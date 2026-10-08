import { Injectable, inject } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';

/**
 * Sin esto, un Service Worker viejo se queda controlando la pestaña indefinidamente
 * despues de cada build nuevo (solo se reemplaza cuando ya no quedan clientes usandolo).
 * Aqui, en cuanto detecta una version nueva lista, recarga para adoptarla al toque.
 */
@Injectable({ providedIn: 'root' })
export class AppUpdateService {
  private readonly swUpdate = inject(SwUpdate);

  constructor() {
    if (!this.swUpdate.isEnabled) return;

    this.swUpdate.versionUpdates.subscribe((event) => {
      if (event.type === 'VERSION_READY') {
        document.location.reload();
      }
    });

    this.swUpdate.checkForUpdate();
  }
}
