#!/usr/bin/env bash
# Instala las dependencias (npm install) de los 5 proyectos.
set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

instalar() {
  local nombre="$1"
  local ruta="$2"
  echo "==> Instalando $nombre ($ruta)"
  (cd "$ruta" && npm install)
  echo
}

instalar "Zodiaco" "$ROOT/zodiaco/Backend"
instalar "Tienda de Refrescos" "$ROOT/tienda-refrescos/Backend"
instalar "Lista de Tareas" "$ROOT/lista-tareas/Backend"
instalar "Portal Escolar" "$ROOT/portal-escolar/Backend"
instalar "Lattice Systems (Frontend)" "$ROOT/lattice-systems-web-frontend"
instalar "Lattice Systems (Backend)" "$ROOT/lattice-systems-web-frontend/Backend"

echo "Listo. Dependencias instaladas en los 5 proyectos."
