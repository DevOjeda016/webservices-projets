import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  NgZone,
  OnDestroy,
  viewChild,
} from '@angular/core';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface Pulse {
  a: number;
  b: number;
  t: number;
  speed: number;
}

/*
  The Lattice — the brand's literal namesake rendered live: nodes drifting on a
  mesh, edges forming between neighbours, and an amber "signal" travelling the
  graph. This is identity, not a decorative CSS grid overlay. The render loop
  runs outside Angular, pauses when hidden or offscreen, and collapses to a
  single static frame under prefers-reduced-motion.
*/
@Component({
  selector: 'app-lattice',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<canvas #canvas class="block h-full w-full"></canvas>`,
  host: { class: 'block h-full w-full' },
})
export class LatticeCanvas implements OnDestroy {
  private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly zone = inject(NgZone);
  private readonly hostEl = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  /** Roughly how dense the mesh is; node count scales with area up to a cap. */
  readonly density = input(0.9);
  /** Whether the mesh reacts to the pointer. */
  readonly interactive = input(true);

  private ctx!: CanvasRenderingContext2D;
  private nodes: Node[] = [];
  private pulses: Pulse[] = [];
  private raf = 0;
  private w = 0;
  private h = 0;
  private dpr = 1;
  private pointer = { x: -9999, y: -9999, active: false };
  private lastPulse = 0;
  private running = false;
  private reduce = false;

  private lineC: [number, number, number] = [120, 168, 196];
  private nodeC: [number, number, number] = [150, 190, 214];
  private pulseC: [number, number, number] = [193, 206, 217];

  private resizeObs?: ResizeObserver;
  private intersectObs?: IntersectionObserver;
  private themeObs?: MutationObserver;
  private readonly onVisibility = () => this.syncRunning();
  private readonly onPointerMove = (e: PointerEvent) => {
    const rect = this.hostEl.getBoundingClientRect();
    this.pointer.x = e.clientX - rect.left;
    this.pointer.y = e.clientY - rect.top;
    this.pointer.active = true;
  };
  private readonly onPointerLeave = () => (this.pointer.active = false);

  private onScreen = true;

  constructor() {
    afterNextRender(() => this.init());
  }

  private init(): void {
    const canvas = this.canvasRef().nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    this.ctx = ctx;
    this.reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.readColors();
    this.measure();
    this.seed();

    // Re-read palette when the page theme (light/dark) flips.
    this.themeObs = new MutationObserver(() => {
      this.readColors();
      if (this.reduce || !this.running) this.drawFrame();
    });
    this.themeObs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    this.resizeObs = new ResizeObserver(() => {
      this.measure();
      this.seed();
      if (this.reduce || !this.running) this.drawFrame();
    });
    this.resizeObs.observe(this.hostEl);

    if (this.reduce) {
      this.drawFrame();
      return;
    }

    this.intersectObs = new IntersectionObserver(
      ([entry]) => {
        this.onScreen = entry.isIntersecting;
        this.syncRunning();
      },
      { threshold: 0 },
    );
    this.intersectObs.observe(this.hostEl);

    document.addEventListener('visibilitychange', this.onVisibility);
    if (this.interactive()) {
      this.hostEl.addEventListener('pointermove', this.onPointerMove);
      this.hostEl.addEventListener('pointerleave', this.onPointerLeave);
    }
    this.syncRunning();
  }

  private syncRunning(): void {
    const shouldRun = this.onScreen && !document.hidden && !this.reduce;
    if (shouldRun && !this.running) {
      this.running = true;
      this.zone.runOutsideAngular(() => {
        this.raf = requestAnimationFrame((t) => this.tick(t));
      });
    } else if (!shouldRun && this.running) {
      this.running = false;
      cancelAnimationFrame(this.raf);
    }
  }

  private readColors(): void {
    const style = getComputedStyle(this.hostEl);
    const parse = (name: string, fallback: [number, number, number]): [number, number, number] => {
      const raw = style.getPropertyValue(name).trim();
      const parts = raw.split(/[\s,]+/).map(Number).filter((n) => !Number.isNaN(n));
      return parts.length === 3 ? (parts as [number, number, number]) : fallback;
    };
    this.lineC = parse('--lattice-line', this.lineC);
    this.nodeC = parse('--lattice-node', this.nodeC);
    this.pulseC = parse('--lattice-pulse', this.pulseC);
  }

  private measure(): void {
    const rect = this.hostEl.getBoundingClientRect();
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = Math.max(1, rect.width);
    this.h = Math.max(1, rect.height);
    const canvas = this.canvasRef().nativeElement;
    canvas.width = Math.round(this.w * this.dpr);
    canvas.height = Math.round(this.h * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  private seed(): void {
    const target = Math.round(
      Math.min(72, Math.max(14, (this.w * this.h) / 20000) * this.density()),
    );
    this.nodes = Array.from({ length: target }, () => ({
      x: Math.random() * this.w,
      y: Math.random() * this.h,
      vx: (Math.random() - 0.5) * 0.16,
      vy: (Math.random() - 0.5) * 0.16,
    }));
    this.pulses = [];
  }

  private get linkDist(): number {
    return Math.min(180, Math.max(120, this.w / 9));
  }

  private tick(time: number): void {
    if (!this.running) return;
    this.step(time);
    this.drawFrame();
    this.raf = requestAnimationFrame((t) => this.tick(t));
  }

  private step(time: number): void {
    for (const n of this.nodes) {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > this.w) n.vx *= -1;
      if (n.y < 0 || n.y > this.h) n.vy *= -1;
      n.x = Math.max(0, Math.min(this.w, n.x));
      n.y = Math.max(0, Math.min(this.h, n.y));

      if (this.pointer.active) {
        const dx = n.x - this.pointer.x;
        const dy = n.y - this.pointer.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 14000 && d2 > 1) {
          const f = (14000 - d2) / 14000 / Math.sqrt(d2);
          n.x += dx * f * 1.4;
          n.y += dy * f * 1.4;
        }
      }
    }

    // Spawn an amber pulse along a real edge every ~1.3s, up to 3 concurrent.
    if (time - this.lastPulse > 1300 && this.pulses.length < 3 && this.nodes.length > 2) {
      this.lastPulse = time;
      const a = Math.floor(Math.random() * this.nodes.length);
      const link = this.linkDist;
      const candidates: number[] = [];
      for (let b = 0; b < this.nodes.length; b++) {
        if (b === a) continue;
        const dx = this.nodes[a].x - this.nodes[b].x;
        const dy = this.nodes[a].y - this.nodes[b].y;
        if (dx * dx + dy * dy < link * link) candidates.push(b);
      }
      if (candidates.length) {
        this.pulses.push({
          a,
          b: candidates[Math.floor(Math.random() * candidates.length)],
          t: 0,
          speed: 0.012 + Math.random() * 0.01,
        });
      }
    }
    for (const p of this.pulses) p.t += p.speed;
    this.pulses = this.pulses.filter((p) => p.t < 1);
  }

  private drawFrame(): void {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.w, this.h);
    const link = this.linkDist;
    const [lr, lg, lb] = this.lineC;
    const [nr, ng, nb] = this.nodeC;
    const [pr, pg, pb] = this.pulseC;

    // Edges
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const a = this.nodes[i];
        const b = this.nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < link * link) {
          const alpha = (1 - Math.sqrt(d2) / link) * 0.24;
          ctx.strokeStyle = `rgba(${lr}, ${lg}, ${lb}, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // Nodes
    ctx.fillStyle = `rgba(${nr}, ${ng}, ${nb}, 0.5)`;
    for (const n of this.nodes) {
      ctx.beginPath();
      ctx.arc(n.x, n.y, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Signal pulses travelling the graph + lit endpoints
    for (const p of this.pulses) {
      const a = this.nodes[p.a];
      const b = this.nodes[p.b];
      if (!a || !b) continue;
      const x = a.x + (b.x - a.x) * p.t;
      const y = a.y + (b.y - a.y) * p.t;
      const fade = Math.sin(p.t * Math.PI);

      ctx.strokeStyle = `rgba(${pr}, ${pg}, ${pb}, ${0.32 * fade})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();

      ctx.beginPath();
      ctx.fillStyle = `rgba(${pr}, ${pg}, ${pb}, ${0.95 * fade})`;
      ctx.shadowColor = `rgba(${pr}, ${pg}, ${pb}, 0.9)`;
      ctx.shadowBlur = 8;
      ctx.arc(x, y, 2.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.raf);
    this.running = false;
    this.resizeObs?.disconnect();
    this.intersectObs?.disconnect();
    this.themeObs?.disconnect();
    document.removeEventListener('visibilitychange', this.onVisibility);
    this.hostEl.removeEventListener('pointermove', this.onPointerMove);
    this.hostEl.removeEventListener('pointerleave', this.onPointerLeave);
  }
}
