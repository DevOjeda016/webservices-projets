#!/usr/bin/env bash
# Levanta los 5 proyectos a la vez (Linux/macOS) y los abre en el navegador.
set -e

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PIDS_FILE="$ROOT/.proyectos-pids"
> "$PIDS_FILE"

echo "Levantando los 5 proyectos..."
echo

iniciar() {
  local nombre="$1"
  local ruta="$2"
  local puerto="$3"
  echo "  - $nombre en el puerto $puerto"
  (cd "$ruta" && nohup npm start > "$ROOT/.log-$puerto.txt" 2>&1 &)
  sleep 0.3
  pid=$(lsof -ti tcp:"$puerto" 2>/dev/null || true)
  [ -n "$pid" ] && echo "$pid" >> "$PIDS_FILE"
}

iniciar "Zodiaco" "$ROOT/zodiaco/Backend" 3000
iniciar "Tienda de Refrescos" "$ROOT/tienda-refrescos/Backend" 3001
iniciar "Lista de Tareas" "$ROOT/lista-tareas/Backend" 3002
iniciar "Portal Escolar" "$ROOT/portal-escolar/Backend" 3003

if [ ! -f "$ROOT/lattice-systems-web-frontend/dist/lattice-systems-web-frontend/browser/ngsw-worker.js" ]; then
  echo "Compilando Lattice Systems para produccion, esto tarda un momento..."
  (cd "$ROOT/lattice-systems-web-frontend" && npx ng build --configuration production)
fi
iniciar "Lattice Systems" "$ROOT/lattice-systems-web-frontend/Backend" 3004

echo
echo "Esperando a que los servidores arranquen..."
sleep 5

abrir() {
  local url="$1"
  if command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$url" >/dev/null 2>&1 &
  elif command -v open >/dev/null 2>&1; then
    open "$url" >/dev/null 2>&1 &
  else
    echo "  (no encontre xdg-open/open, abre manualmente: $url)"
  fi
}

for puerto in 3000 3001 3002 3003 3004; do
  abrir "http://localhost:$puerto"
done

echo
echo "Listo. Se abrieron los 5 proyectos en el navegador."
echo "Para detener todo: ./detener-proyectos.sh"
