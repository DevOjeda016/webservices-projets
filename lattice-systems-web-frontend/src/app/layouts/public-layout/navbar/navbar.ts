import { afterNextRender, ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowRight, lucideMenu, lucideMoon, lucideSun, lucideX } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { ThemeService } from '../../../shared/theme';
import { ConnectionStatusService } from '../../../shared/connection-status.service';

const NAV_ITEMS = [
  { label: 'Servicios', fragment: 'servicios' },
  { label: 'Proyectos', fragment: 'proyectos' },
  { label: 'Nosotros', fragment: 'nosotros' },
  { label: 'Proceso', fragment: 'proceso' },
] as const;

@Component({
  selector: 'app-navbar',
  imports: [NgIcon, HlmButtonImports],
  providers: [provideIcons({ lucideMenu, lucideX, lucideArrowRight, lucideSun, lucideMoon })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="border-border bg-background/80 fixed inset-x-0 top-0 z-[50] border-b backdrop-blur-xl">
      <div class="mx-auto flex h-18 max-w-6xl items-center justify-between px-6 sm:px-10">
        <a href="#top" class="flex shrink-0 items-center gap-2.5" aria-label="Inicio, Lattice Systems">
          <img src="/lattice-logo.png" alt="" width="600" height="600" class="h-7 w-auto dark:hidden" />
          <img
            src="/lattice-logo-dark.png"
            alt=""
            width="600"
            height="600"
            class="hidden h-7 w-auto dark:block"
          />
          <span class="text-foreground text-[17px] font-extrabold tracking-tight">
            Lattice Systems
          </span>
        </a>

        <nav class="hidden items-center gap-7 md:flex" aria-label="Navegación principal">
          @for (item of navItems; track item.fragment) {
            <a
              [href]="'#' + item.fragment"
              class="font-mono text-[13px] tracking-tight transition-colors"
              [class]="
                active() === item.fragment
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              "
              [attr.aria-current]="active() === item.fragment ? 'true' : null"
            >
              <span
                class="pb-1"
                [class.signal-underline]="active() !== item.fragment"
                [class.signal-underline-on]="active() === item.fragment"
              >
                {{ item.label }}
              </span>
            </a>
          }

          <button
            hlmBtn
            variant="ghost"
            size="icon"
            class="ml-1"
            [attr.aria-label]="theme.isDark() ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
            (click)="theme.toggle()"
          >
            <ng-icon [name]="theme.isDark() ? 'lucideSun' : 'lucideMoon'" size="18" />
          </button>

          <a hlmBtn size="sm" href="#contacto">
            Hablemos
            <ng-icon name="lucideArrowRight" />
          </a>
        </nav>

        <div class="flex items-center gap-1 md:hidden">
          <button
            hlmBtn
            variant="ghost"
            size="icon"
            [attr.aria-label]="theme.isDark() ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
            (click)="theme.toggle()"
          >
            <ng-icon [name]="theme.isDark() ? 'lucideSun' : 'lucideMoon'" size="18" />
          </button>
          <button
            hlmBtn
            variant="ghost"
            size="icon"
            [attr.aria-expanded]="mobileOpen()"
            aria-controls="mobile-menu"
            aria-label="Abrir menú"
            (click)="toggleMobile()"
          >
            <span class="relative size-5">
              <ng-icon
                name="lucideMenu"
                class="absolute inset-0 transition-all duration-150"
                [class]="mobileOpen() ? 'scale-0 rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100'"
              />
              <ng-icon
                name="lucideX"
                class="absolute inset-0 transition-all duration-150"
                [class]="mobileOpen() ? 'scale-100 rotate-0 opacity-100' : 'scale-0 -rotate-90 opacity-0'"
              />
            </span>
          </button>
        </div>
      </div>

      @if (!connection.online()) {
        <div class="bg-destructive/90 text-destructive-foreground py-1.5 text-center text-xs font-medium">
          Modo offline — lo que envíes en Contacto se guarda y se manda solo al volver la conexión.
        </div>
      }

      @if (mobileOpen()) {
        <div id="mobile-menu" class="border-border bg-background/95 border-t backdrop-blur-xl md:hidden">
          <nav class="mx-auto flex max-w-6xl flex-col gap-0.5 px-6 py-4" aria-label="Menú móvil">
            @for (item of navItems; track item.fragment) {
              <a
                [href]="'#' + item.fragment"
                class="text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg px-3 py-2.5 font-mono text-sm transition-colors"
                (click)="mobileOpen.set(false)"
              >
                {{ item.label }}
              </a>
            }
            <a hlmBtn size="sm" href="#contacto" class="mt-3" (click)="mobileOpen.set(false)">
              Hablemos
              <ng-icon name="lucideArrowRight" />
            </a>
          </nav>
        </div>
      }
    </header>

    <!-- Spacer: keeps content clear of the fixed nav -->
    <div class="h-18" aria-hidden="true"></div>
  `,
})
export class Navbar {
  protected readonly theme = inject(ThemeService);
  protected readonly connection = inject(ConnectionStatusService);
  protected readonly navItems = NAV_ITEMS;
  protected readonly mobileOpen = signal(false);
  protected readonly active = signal<string>('');

  constructor() {
    afterNextRender(() => {
      const sections = this.navItems
        .map((i) => document.getElementById(i.fragment))
        .filter((el): el is HTMLElement => el !== null);
      const spy = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) this.active.set(entry.target.id);
          }
        },
        { rootMargin: '-45% 0px -50% 0px', threshold: 0 },
      );
      sections.forEach((s) => spy.observe(s));
    });
  }

  protected toggleMobile(): void {
    this.mobileOpen.update((v) => !v);
  }
}
