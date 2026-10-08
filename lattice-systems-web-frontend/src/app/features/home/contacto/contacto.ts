import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheck, lucideLinkedin, lucideLoaderCircle, lucideMail } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmTextareaImports } from '@spartan-ng/helm/textarea';
import { LatticeCanvas } from '../../../shared/lattice-canvas';
import { Reveal } from '../../../shared/reveal.directive';
import {
  ContactMessage,
  ContactMessagesService,
  StoredContactMessage,
} from '../../../shared/contact-messages.service';

@Component({
  selector: 'app-contacto',
  imports: [
    ReactiveFormsModule,
    NgIcon,
    HlmButtonImports,
    HlmInputImports,
    HlmTextareaImports,
    LatticeCanvas,
    Reveal,
    DatePipe,
  ],
  providers: [provideIcons({ lucideMail, lucideLinkedin, lucideCheck, lucideLoaderCircle })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="contacto" class="border-border relative isolate overflow-hidden border-t">
      <div class="absolute inset-0 z-0 opacity-40" aria-hidden="true">
        <app-lattice [density]="0.7" [interactive]="false" />
      </div>
      <div class="theme-scrim-soft absolute inset-0 z-0" aria-hidden="true"></div>

      <div class="relative z-[1] mx-auto max-w-6xl px-6 py-24 sm:px-10 sm:py-32">
        <div class="grid gap-14 md:grid-cols-2 md:items-start">
          <div>
            <h2
              class="text-foreground text-4xl font-extrabold tracking-[-0.02em] sm:text-5xl"
              style="text-wrap: balance"
              data-reveal
            >
              Conversemos sobre tu proyecto
            </h2>
            <p class="text-subtle-foreground mt-5 max-w-md text-lg leading-relaxed" data-reveal>
              Cuéntanos qué necesitas y te contactamos en menos de dos días hábiles.
            </p>
            <div class="mt-9 flex flex-col gap-4" data-reveal [revealDelay]="80">
              <a
                href="mailto:hola@latticesystems.dev"
                class="press text-foreground group flex w-fit items-center gap-3 text-sm"
              >
                <span
                  class="flex size-10 items-center justify-center rounded-xl border transition-transform duration-300 group-hover:-translate-y-0.5"
                  style="color: var(--accent-2); background: color-mix(in srgb, var(--accent-2) 12%, transparent); border-color: color-mix(in srgb, var(--accent-2) 34%, transparent)"
                >
                  <ng-icon name="lucideMail" size="18" />
                </span>
                <span class="signal-underline pb-0.5">hola&#64;latticesystems.dev</span>
              </a>
              <a
                href="https://www.linkedin.com/company/lattice-systems"
                target="_blank"
                rel="noopener"
                class="press text-foreground group flex w-fit items-center gap-3 text-sm"
              >
                <span
                  class="flex size-10 items-center justify-center rounded-xl border transition-transform duration-300 group-hover:-translate-y-0.5"
                  style="color: var(--accent-1); background: color-mix(in srgb, var(--accent-1) 12%, transparent); border-color: color-mix(in srgb, var(--accent-1) 34%, transparent)"
                >
                  <ng-icon name="lucideLinkedin" size="18" />
                </span>
                <span class="signal-underline pb-0.5">Lattice Systems en LinkedIn</span>
              </a>
            </div>
          </div>

          <div
            class="border-border bg-card/80 rounded-3xl border p-7 backdrop-blur-sm sm:p-8"
            data-reveal
            revealKind="scale"
          >
            @if (!sent()) {
              <form [formGroup]="form" (ngSubmit)="onSubmit()" class="flex flex-col gap-5" novalidate>
                <div class="flex flex-col gap-1.5">
                  <label for="contact-name" class="text-foreground text-sm font-medium">Nombre</label>
                  <input
                    hlmInput
                    id="contact-name"
                    type="text"
                    formControlName="name"
                    placeholder="Tu nombre"
                    autocomplete="name"
                    [attr.aria-invalid]="invalid('name')"
                    [attr.aria-describedby]="invalid('name') ? 'err-name' : null"
                  />
                  @if (invalid('name')) {
                    <p id="err-name" class="text-destructive text-xs">Escribe tu nombre.</p>
                  }
                </div>

                <div class="flex flex-col gap-1.5">
                  <label for="contact-email" class="text-foreground text-sm font-medium">Correo</label>
                  <input
                    hlmInput
                    id="contact-email"
                    type="email"
                    formControlName="email"
                    placeholder="tucorreo@empresa.com"
                    autocomplete="email"
                    [attr.aria-invalid]="invalid('email')"
                    [attr.aria-describedby]="invalid('email') ? 'err-email' : null"
                  />
                  @if (invalid('email')) {
                    <p id="err-email" class="text-destructive text-xs">
                      Escribe un correo válido.
                    </p>
                  }
                </div>

                <div class="flex flex-col gap-1.5">
                  <label for="contact-message" class="text-foreground text-sm font-medium">
                    Cuéntanos sobre tu proyecto
                  </label>
                  <textarea
                    hlmTextarea
                    id="contact-message"
                    formControlName="message"
                    rows="4"
                    placeholder="¿Qué te gustaría construir?"
                  ></textarea>
                </div>

                <button hlmBtn type="submit" class="mt-1 w-full" [disabled]="submitting()">
                  @if (submitting()) {
                    <ng-icon name="lucideLoaderCircle" class="animate-spin" />
                    Enviando
                  } @else {
                    Enviar mensaje
                  }
                </button>
                @if (error()) {
                  <p class="text-destructive text-xs">
                    No se pudo enviar tu mensaje. Intenta de nuevo o escríbenos directo a
                    hola&#64;latticesystems.dev.
                  </p>
                }
              </form>
            } @else {
              <div class="flex flex-col items-start gap-4 py-4">
                <span
                  class="border-signal/40 bg-signal-soft text-signal flex size-11 items-center justify-center rounded-full border"
                >
                  <ng-icon [name]="queued() ? 'lucideLoaderCircle' : 'lucideCheck'" size="20" />
                </span>
                <div>
                  @if (queued()) {
                    <p class="text-foreground font-semibold">Mensaje en cola (sin conexión).</p>
                    <p class="text-muted-foreground mt-1 text-sm">
                      Se enviará solo en cuanto vuelva la conexión, no necesitas hacer nada más.
                    </p>
                  } @else {
                    <p class="text-foreground font-semibold">Mensaje recibido.</p>
                    <p class="text-muted-foreground mt-1 text-sm">
                      Te contactamos en menos de dos días hábiles.
                    </p>
                  }
                </div>
              </div>
              @if (ultimoEnviado(); as m) {
                <div class="border-border bg-muted/50 mt-2 rounded-xl border p-4 text-sm">
                  <p class="text-muted-foreground font-mono text-[11px] tracking-[0.18em] uppercase">
                    Esto fue lo que guardamos (demo, sin envío real de correo)
                  </p>
                  <p class="text-foreground mt-2">
                    <span class="font-semibold">{{ m.name }}</span>
                    <span class="text-muted-foreground"> · {{ m.email }}</span>
                  </p>
                  @if (m.message) {
                    <p class="text-subtle-foreground mt-1">{{ m.message }}</p>
                  }
                  <p class="text-muted-foreground mt-2 text-xs">
                    Guardado {{ m.recibidoEn | date: 'medium' }} · id {{ m.id }}
                  </p>
                </div>
              } @else if (queuedMensaje(); as m) {
                <div class="border-border bg-muted/50 mt-2 rounded-xl border p-4 text-sm">
                  <p class="text-muted-foreground font-mono text-[11px] tracking-[0.18em] uppercase">
                    En espera de conexión
                  </p>
                  <p class="text-foreground mt-2">
                    <span class="font-semibold">{{ m.name }}</span>
                    <span class="text-muted-foreground"> · {{ m.email }}</span>
                  </p>
                  @if (m.message) {
                    <p class="text-subtle-foreground mt-1">{{ m.message }}</p>
                  }
                </div>
              }
            }
          </div>
        </div>
      </div>
    </section>
  `,
})
export class Contacto {
  private readonly fb = inject(FormBuilder);
  private readonly contactMessages = inject(ContactMessagesService);

  protected readonly sent = signal(false);
  protected readonly submitting = signal(false);
  protected readonly error = signal(false);
  protected readonly queued = signal(false);
  protected readonly ultimoEnviado = signal<StoredContactMessage | null>(null);
  protected readonly queuedMensaje = signal<ContactMessage | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    message: [''],
  });

  protected invalid(control: 'name' | 'email'): boolean {
    const c = this.form.controls[control];
    return c.invalid && c.touched;
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    this.error.set(false);
    const payload = this.form.getRawValue();
    this.contactMessages.send(payload).subscribe({
      next: (mensaje) => {
        this.submitting.set(false);
        this.ultimoEnviado.set(mensaje);
        this.sent.set(true);
      },
      error: (err) => {
        this.submitting.set(false);
        if (ContactMessagesService.esErrorDeRed(err)) {
          this.contactMessages.encolar(payload);
          this.queuedMensaje.set(payload);
          this.queued.set(true);
          this.sent.set(true);
        } else {
          this.error.set(true);
        }
      },
    });
  }
}
