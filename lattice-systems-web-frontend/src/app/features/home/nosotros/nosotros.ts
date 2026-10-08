import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Reveal } from '../../../shared/reveal.directive';

const PILLARS = [
  {
    accent: 1,
    title: 'Soluciones a medida',
    description: 'Diseñadas para tu operación, no plantillas genéricas.',
  },
  {
    accent: 2,
    title: 'Entrega ágil',
    description: 'Avances incrementales y visibles, sin sorpresas al final.',
  },
  {
    accent: 4,
    title: 'Código confiable',
    description: 'Arquitecturas limpias, construidas para durar y escalar.',
  },
] as const;

@Component({
  selector: 'app-nosotros',
  imports: [Reveal],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="nosotros" class="border-border bg-muted relative isolate overflow-hidden border-t">
      <div
        class="glow par-y -z-10 hidden size-[30rem] opacity-[0.1] md:block"
        style="top: -4rem; right: -8rem; background: var(--accent-1); --par-from: 90px; --par-to: -90px"
        aria-hidden="true"
      ></div>
      <div
        class="glow par-y -z-10 hidden size-96 opacity-[0.08] md:block"
        style="bottom: -6rem; left: -6rem; background: var(--accent-2); --par-from: -70px; --par-to: 70px"
        aria-hidden="true"
      ></div>

      <div class="mx-auto max-w-6xl px-6 py-24 sm:px-10 sm:py-32">
        <h2
          class="text-foreground max-w-4xl text-3xl leading-[1.25] font-semibold tracking-[-0.01em] sm:text-[2.6rem] sm:leading-[1.2]"
          style="text-wrap: balance"
          data-reveal
          revealKind="blur"
        >
          Somos un equipo enfocado en la
          <span class="text-signal">transformación digital</span>
          de organizaciones: sistemas internos, procesos automatizados y productos propios
          impulsados por IA.
        </h2>

        <p
          class="text-muted-foreground mt-8 max-w-2xl text-lg leading-relaxed"
          data-reveal
          [revealDelay]="80"
        >
          SpaceAI, nuestra plataforma de gestión inteligente de espacios, nace de ese mismo criterio.
          Integramos metodologías ágiles y arquitecturas escalables en cada proyecto que entregamos.
        </p>

        <div class="border-border mt-16 grid gap-px border-t sm:grid-cols-3">
          @for (pillar of pillars; track pillar.title; let i = $index) {
            <div class="pt-8 sm:pr-8" data-reveal revealKind="scale" [revealDelay]="i * 80">
              <span
                class="font-mono text-sm"
                [style.color]="'var(--accent-' + pillar.accent + ')'"
              >
                {{ '0' + (i + 1) }}
              </span>
              <h3 class="text-foreground mt-4 text-lg font-semibold">{{ pillar.title }}</h3>
              <p class="text-muted-foreground mt-2 text-sm leading-relaxed">
                {{ pillar.description }}
              </p>
            </div>
          }
        </div>
      </div>
    </section>
  `,
})
export class Nosotros {
  protected readonly pillars = PILLARS;
}
