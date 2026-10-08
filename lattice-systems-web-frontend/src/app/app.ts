import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './shared/theme';
import { AppUpdateService } from './shared/app-update.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export class App {
  // Instantiate the theme service at startup so it applies + persists the theme.
  private readonly theme = inject(ThemeService);
  // Auto-recarga cuando el Service Worker detecta una version nueva ya instalada.
  private readonly appUpdate = inject(AppUpdateService);
}
