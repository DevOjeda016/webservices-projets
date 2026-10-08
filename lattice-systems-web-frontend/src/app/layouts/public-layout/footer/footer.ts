import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideLinkedin, lucideMail } from '@ng-icons/lucide';

const FOOTER_NAV = [
  { label: 'Servicios', fragment: 'servicios' },
  { label: 'Proyectos', fragment: 'proyectos' },
  { label: 'Nosotros', fragment: 'nosotros' },
  { label: 'Proceso', fragment: 'proceso' },
] as const;

@Component({
  selector: 'app-footer',
  imports: [NgIcon],
  providers: [provideIcons({ lucideMail, lucideLinkedin })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="border-border bg-muted border-t">
      <div class="mx-auto max-w-6xl px-6 py-16 sm:px-10">
        <div class="flex flex-col gap-12 sm:flex-row sm:justify-between">
          <div class="max-w-xs">
            <a href="#top" class="flex items-center gap-2.5">
              <img src="/lattice-logo-dark.png" alt="" width="600" height="600" class="h-6 w-auto" />
              <span class="text-foreground text-base font-extrabold tracking-tight">
                Lattice Systems
              </span>
            </a>
            <p class="text-muted-foreground mt-4 text-sm leading-relaxed">
              Diseñamos, construimos e integramos software a la medida de tu operación.
            </p>
          </div>

          <div class="flex flex-col gap-8 sm:flex-row sm:gap-16">
            <nav class="flex flex-col gap-2.5" aria-label="Navegación del pie">
              @for (item of footerNav; track item.fragment) {
                <a
                  [href]="'#' + item.fragment"
                  class="text-muted-foreground hover:text-foreground w-fit text-sm transition-colors"
                >
                  {{ item.label }}
                </a>
              }
            </nav>
            <div class="flex flex-col gap-2.5">
              <a
                href="mailto:hola@latticesystems.dev"
                class="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm transition-colors"
              >
                <ng-icon name="lucideMail" size="16" />
                hola&#64;latticesystems.dev
              </a>
              <a
                href="https://www.linkedin.com/company/lattice-systems"
                target="_blank"
                rel="noopener noreferrer"
                class="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm transition-colors"
              >
                <ng-icon name="lucideLinkedin" size="16" />
                LinkedIn
              </a>
            </div>
          </div>
        </div>

        <div
          class="border-border mt-14 flex flex-col gap-2 border-t pt-6 sm:flex-row sm:items-center sm:justify-between"
        >
          <p class="text-muted-foreground font-mono text-xs">
            © {{ year }} Lattice Systems
          </p>
          <p class="text-muted-foreground text-xs">Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  `,
})
export class Footer {
  protected readonly footerNav = FOOTER_NAV;
  protected readonly year = new Date().getFullYear();
}
