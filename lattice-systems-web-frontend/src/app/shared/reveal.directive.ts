import {
  Directive,
  ElementRef,
  inject,
  input,
  numberAttribute,
  OnDestroy,
  OnInit,
} from '@angular/core';

/*
  Progressive-enhancement scroll reveal. The element ships fully visible; this
  directive only arms the hidden start-state once JS runs and motion is allowed,
  then releases it when the element scrolls into view. Honors reduced-motion by
  never arming at all. See [data-reveal] rules in styles.css.
*/
@Directive({
  selector: '[data-reveal]',
})
export class Reveal implements OnInit, OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Stagger offset in ms, applied via --reveal-delay. */
  readonly revealDelay = input(0, { transform: numberAttribute });

  /** Entrance flavour: '' (up), 'left', 'right', 'scale', 'blur', 'fade'. */
  readonly revealKind = input('');

  private observer?: IntersectionObserver;
  private safety?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    const el = this.host.nativeElement;
    const reduce =
      typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || typeof IntersectionObserver === 'undefined') return;

    el.style.setProperty('--reveal-delay', `${this.revealDelay()}ms`);
    const kind = this.revealKind();
    if (kind) el.dataset['kind'] = kind;
    el.classList.add('reveal-armed');

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) this.reveal();
        }
      },
      { threshold: 0.18, rootMargin: '0px 0px -8% 0px' },
    );
    this.observer.observe(el);

    // Safety net: nothing stays hidden permanently if the observer never fires
    // (headless capture, background tab, slow scroll). Scrolling reveals earlier.
    this.safety = setTimeout(() => this.reveal(), 1600);
  }

  private reveal(): void {
    this.host.nativeElement.classList.add('is-visible');
    this.observer?.disconnect();
    clearTimeout(this.safety);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    clearTimeout(this.safety);
  }
}
