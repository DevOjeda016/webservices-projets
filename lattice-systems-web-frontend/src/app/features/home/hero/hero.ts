import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  NgZone,
  viewChild,
} from '@angular/core';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { LatticeCanvas } from '../../../shared/lattice-canvas';
import { Reveal } from '../../../shared/reveal.directive';

@Component({
  selector: 'app-hero',
  imports: [HlmButtonImports, LatticeCanvas, Reveal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      #hero
      class="relative isolate flex min-h-[calc(100dvh-4.5rem)] items-center overflow-hidden"
    >
      <!-- The live lattice, on parallax layers (scroll drift + pointer) -->
      <div class="parallax-scroll absolute inset-0 z-0" aria-hidden="true">
        <div class="parallax-pointer h-full w-full">
          <app-lattice [density]="1.05" />
        </div>
      </div>
      <div class="theme-scrim absolute inset-0 z-0" aria-hidden="true"></div>

      <div class="parallax-content relative z-[1] mx-auto w-full max-w-6xl px-6 py-24 sm:px-10">
        <div class="max-w-3xl">
          <p class="text-signal font-mono text-xs tracking-[0.28em] uppercase" data-reveal>
            Estudio de software
          </p>

          <h1
            class="text-foreground mt-6 text-[clamp(2.5rem,6.2vw,4.75rem)] leading-[1] font-extrabold tracking-[-0.03em]"
            style="text-wrap: balance"
            data-reveal
            [revealDelay]="80"
          >
            Software a la medida de tu
            <span class="signal-underline-on pb-1">operación</span>
          </h1>

          <p
            class="text-subtle-foreground mt-7 max-w-xl text-lg leading-relaxed"
            data-reveal
            [revealDelay]="160"
          >
            Diseñamos, construimos e integramos los sistemas que tu negocio necesita para operar
            mejor.
          </p>

          <div class="mt-10 flex flex-wrap items-center gap-3" data-reveal [revealDelay]="240">
            <a hlmBtn size="lg" href="#contacto">Hablemos</a>
            <a hlmBtn size="lg" variant="outline" href="#proyectos">Ver proyectos</a>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class Hero {
  private readonly hero = viewChild.required<ElementRef<HTMLElement>>('hero');
  private readonly zone = inject(NgZone);

  constructor() {
    afterNextRender(() => {
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const el = this.hero().nativeElement;
      this.zone.runOutsideAngular(() => {
        el.addEventListener('pointermove', (e: PointerEvent) => {
          const rect = el.getBoundingClientRect();
          const mx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
          const my = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
          el.style.setProperty('--mx', mx.toFixed(3));
          el.style.setProperty('--my', my.toFixed(3));
        });
        el.addEventListener('pointerleave', () => {
          el.style.setProperty('--mx', '0');
          el.style.setProperty('--my', '0');
        });
      });
    });
  }
}
