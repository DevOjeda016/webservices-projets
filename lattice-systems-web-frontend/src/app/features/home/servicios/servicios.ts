import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowUpRight,
  lucideBraces,
  lucideMonitor,
  lucidePlug,
  lucideWorkflow,
} from '@ng-icons/lucide';
import { Reveal } from '../../../shared/reveal.directive';

const SERVICES = [
  {
    icon: 'lucideMonitor',
    accent: 2,
    title: 'Sitios web',
    description: 'Sitios diseñados y desarrollados a medida, rápidos y fáciles de mantener.',
  },
  {
    icon: 'lucideBraces',
    accent: 1,
    title: 'Software a medida',
    description: 'Aplicaciones y herramientas internas construidas para tu operación.',
  },
  {
    icon: 'lucideWorkflow',
    accent: 3,
    title: 'Automatización de procesos',
    description: 'Flujos de trabajo automatizados que eliminan tareas repetitivas.',
  },
  {
    icon: 'lucidePlug',
    accent: 4,
    title: 'Integraciones tecnológicas',
    description: 'Conectamos tus sistemas y datos para que trabajen juntos.',
  },
] as const;

@Component({
  selector: 'app-servicios',
  imports: [NgIcon, Reveal],
  providers: [
    provideIcons({ lucideMonitor, lucideBraces, lucideWorkflow, lucidePlug, lucideArrowUpRight }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="servicios" class="relative isolate mx-auto max-w-6xl overflow-hidden px-6 py-24 sm:px-10 sm:py-32">
      <div
        class="glow par-y -z-10 hidden size-96 opacity-[0.14] md:block"
        style="top: 2rem; right: -6rem; background: var(--accent-2); --par-from: 80px; --par-to: -80px"
        aria-hidden="true"
      ></div>

      <div class="grid gap-x-12 gap-y-10 md:grid-cols-12">
        <div class="md:col-span-4">
          <h2
            class="text-foreground text-4xl font-extrabold tracking-[-0.02em]"
            style="text-wrap: balance"
            data-reveal
          >
            Qué hacemos para tu organización
          </h2>
          <p class="text-muted-foreground mt-4 max-w-xs leading-relaxed" data-reveal [revealDelay]="60">
            Cuatro frentes, un mismo criterio de ingeniería.
          </p>
        </div>

        <ul class="border-border md:col-span-8 md:border-t">
          @for (service of services; track service.title; let i = $index) {
            <li
              class="group border-border border-t md:border-t-0 md:[&:not(:first-child)]:border-t"
              data-reveal
              revealKind="left"
              [revealDelay]="i * 70"
            >
              <a
                href="#contacto"
                class="press hover:bg-muted/40 flex items-center gap-5 rounded-xl px-4 py-6 sm:gap-6"
              >
                <span
                  class="flex size-11 shrink-0 items-center justify-center rounded-xl border transition-transform duration-300 group-hover:-translate-y-0.5"
                  [style.color]="'var(--accent-' + service.accent + ')'"
                  [style.background]="'color-mix(in srgb, var(--accent-' + service.accent + ') 12%, transparent)'"
                  [style.borderColor]="'color-mix(in srgb, var(--accent-' + service.accent + ') 34%, transparent)'"
                >
                  <ng-icon [name]="service.icon" size="20" />
                </span>
                <span class="min-w-0 flex-1">
                  <span class="text-foreground block text-lg font-semibold">{{ service.title }}</span>
                  <span class="text-muted-foreground mt-1 block text-sm leading-relaxed">
                    {{ service.description }}
                  </span>
                </span>
                <ng-icon
                  name="lucideArrowUpRight"
                  size="20"
                  class="text-muted-foreground shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              </a>
            </li>
          }
        </ul>
      </div>
    </section>
  `,
})
export class Servicios {
  protected readonly services = SERVICES;
}
