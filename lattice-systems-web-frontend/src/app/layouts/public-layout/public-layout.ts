import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './navbar/navbar';
import { Footer } from './footer/footer';

@Component({
  selector: 'app-public-layout',
  imports: [RouterOutlet, Navbar, Footer],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div id="top" class="min-h-screen">
      <app-navbar />
      <router-outlet />
      <app-footer />
    </div>
  `,
})
export class PublicLayout {}
