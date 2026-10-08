#!/usr/bin/env bash
# Detiene los 5 proyectos levantados por iniciar-proyectos.sh
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PIDS_FILE="$ROOT/.proyectos-pids"

if [ ! -f "$PIDS_FILE" ]; then
  echo "No hay nada que detener (no existe $PIDS_FILE)."
  exit 0
fi

while read -r pid; do
  [ -n "$pid" ] && kill "$pid" 2>/dev/null && echo "Detenido PID $pid"
done < "$PIDS_FILE"

rm -f "$PIDS_FILE"
echo "Listo."
