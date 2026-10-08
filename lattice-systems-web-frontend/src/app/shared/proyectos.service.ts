import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

export interface CaseStudy {
  icon: string;
  accent: number;
  title: string;
  problem: string;
  solution: string;
  result: string;
  wide: boolean;
}

export interface ProyectoDestacado {
  titulo: string;
  etiqueta: string;
  descripcion: string;
  url: string;
}

export interface ProyectosData {
  destacado: ProyectoDestacado;
  casosDeEstudio: CaseStudy[];
}

@Injectable({ providedIn: 'root' })
export class ProyectosService {
  private readonly http = inject(HttpClient);

  obtener() {
    return this.http.get<ProyectosData>('/api/proyectos');
  }
}
