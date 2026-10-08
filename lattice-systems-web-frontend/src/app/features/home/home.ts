import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Hero } from './hero/hero';
import { Nosotros } from './nosotros/nosotros';
import { Servicios } from './servicios/servicios';
import { Proyectos } from './proyectos/proyectos';
import { Proceso } from './proceso/proceso';
import { Contacto } from './contacto/contacto';

@Component({
  selector: 'app-home',
  imports: [Hero, Nosotros, Servicios, Proyectos, Proceso, Contacto],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main>
      <app-hero />
      <app-nosotros />
      <app-servicios />
      <app-proyectos />
      <app-proceso />
      <app-contacto />
    </main>
  `,
})
export class Home {}
