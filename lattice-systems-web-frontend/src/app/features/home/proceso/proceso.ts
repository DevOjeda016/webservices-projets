import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Reveal } from '../../../shared/reveal.directive';

const STEPS = [
  {
    accent: 1,
    title: 'Descubrimiento',
    content: 'Entendemos tu operación, objetivos y restricciones antes de proponer una solución.',
  },
  {
    accent: 2,
    title: 'Diseño y prototipado',
    content: 'Diseñamos la solución y la validamos contigo antes de escribir código.',
  },
  {
    accent: 3,
    title: 'Desarrollo',
    content: 'Construimos e integramos la solución con entregas incrementales.',
  },
  {
    accent: 4,
    title: 'Lanzamiento y soporte',
    content: 'Publicamos, medimos resultados y damos seguimiento post-lanzamiento.',
  },
] as const;

@Component({
  selector: 'app-proceso',
  imports: [Reveal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      id="proceso"
      class="relative isolate mx-auto max-w-6xl overflow-hidden px-6 py-24 sm:px-10 sm:py-32"
    >
      <div
        class="glow par-y -z-10 hidden size-96 opacity-[0.1] md:block"
        style="top: 6rem; right: -5rem; background: var(--accent-3); --par-from: 80px; --par-to: -80px"
        aria-hidden="true"
      ></div>

      <div class="max-w-2xl">
        <h2
          class="text-foreground text-4xl font-extrabold tracking-[-0.02em]"
          style="text-wrap: balance"
          data-reveal
        >
          Cómo trabajamos
        </h2>
        <p class="text-muted-foreground mt-4 text-lg leading-relaxed" data-reveal [revealDelay]="60">
          Un proceso claro, de principio a fin.
        </p>
      </div>

      <ol class="proceso-list relative mt-16 max-w-2xl">
        <div class="proceso-rail" aria-hidden="true"></div>
        @for (step of steps; track step.title; let i = $index; let last = $last) {
          <li
            class="relative pl-14"
            [class.pb-12]="!last"
            data-reveal
            revealKind="left"
            [revealDelay]="i * 90"
          >
            <span
              class="bg-background absolute top-0 left-0 flex size-10 items-center justify-center rounded-full border font-mono text-sm"
              [style.color]="'var(--accent-' + step.accent + ')'"
              [style.borderColor]="'color-mix(in srgb, var(--accent-' + step.accent + ') 45%, transparent)'"
            >
              {{ '0' + (i + 1) }}
            </span>
            <h3 class="text-foreground pt-1.5 text-xl font-semibold">{{ step.title }}</h3>
            <p class="text-muted-foreground mt-2 max-w-md leading-relaxed">{{ step.content }}</p>
          </li>
        }
      </ol>
    </section>
  `,
})
export class Proceso {
  protected readonly steps = STEPS;
}
