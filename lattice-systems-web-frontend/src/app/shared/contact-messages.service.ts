import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';

export interface ContactMessage {
  name: string;
  email: string;
  message: string;
}

export interface StoredContactMessage extends ContactMessage {
  id: string;
  recibidoEn: string;
}

interface ColaItem extends ContactMessage {
  clienteId: string;
}

const QUEUE_KEY = 'lattice-contacto-cola';

@Injectable({ providedIn: 'root' })
export class ContactMessagesService {
  private readonly http = inject(HttpClient);

  readonly pendientes = signal<ColaItem[]>(this.leerCola());

  constructor() {
    if (typeof window === 'undefined') return;
    window.addEventListener('online', () => this.sincronizar());
    if (navigator.onLine) this.sincronizar();
  }

  send(payload: ContactMessage) {
    // ngsw-bypass: el Service Worker de Angular intercepta tambien las peticiones POST
    // (aunque no esten en un dataGroup) y puede colgarlas devolviendo 504. Este header
    // le dice al SW que deje pasar la peticion directo a la red, sin tocarla.
    return this.http.post<StoredContactMessage>('/api/contacto', payload, {
      headers: { 'ngsw-bypass': 'true' },
    });
  }

  encolar(payload: ContactMessage): void {
    const cola = this.leerCola();
    cola.push({ ...payload, clienteId: this.generarId() });
    this.guardarCola(cola);
  }

  /** Reintenta enviar la cola pendiente; se detiene en el primer fallo (seguimos sin red). */
  sincronizar(): void {
    const cola = this.leerCola();
    if (cola.length === 0) return;

    const [primero, ...resto] = cola;
    this.send(primero).subscribe({
      next: () => {
        this.guardarCola(resto);
        this.sincronizar();
      },
      error: () => {
        // seguimos sin conexion o el servidor no responde; reintentamos con el proximo evento 'online'
      },
    });
  }

  static esErrorDeRed(err: unknown): boolean {
    return err instanceof HttpErrorResponse && err.status === 0;
  }

  private generarId(): string {
    return typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  private leerCola(): ColaItem[] {
    try {
      return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
    } catch {
      return [];
    }
  }

  private guardarCola(cola: ColaItem[]): void {
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(cola));
    } catch {
      // localStorage no disponible (SSR o navegador restringido); seguimos solo en memoria
    }
    this.pendientes.set(cola);
  }
}
