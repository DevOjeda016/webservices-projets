@echo off
setlocal

set "ROOT=%~dp0"

echo Levantando los 5 proyectos...
echo.

start "Zodiaco (3000)" cmd /k "cd /d "%ROOT%zodiaco\Backend" && npm start"
start "Tienda de Refrescos (3001)" cmd /k "cd /d "%ROOT%tienda-refrescos\Backend" && npm start"
start "Lista de Tareas (3002)" cmd /k "cd /d "%ROOT%lista-tareas\Backend" && npm start"
start "Portal Escolar (3003)" cmd /k "cd /d "%ROOT%portal-escolar\Backend" && npm start"

if not exist "%ROOT%lattice-systems-web-frontend\dist\lattice-systems-web-frontend\browser\ngsw-worker.js" (
  echo Compilando Lattice Systems para produccion, esto tarda un momento...
  pushd "%ROOT%lattice-systems-web-frontend"
  call npx ng build --configuration production
  popd
)
start "Lattice Systems (3004)" cmd /k "cd /d "%ROOT%lattice-systems-web-frontend\Backend" && npm start"

echo Esperando a que los servidores arranquen...
timeout /t 6 /nobreak >nul

start "" http://localhost:3000
start "" http://localhost:3001
start "" http://localhost:3002
start "" http://localhost:3003
start "" http://localhost:3004

echo.
echo Listo. Se abrieron los 5 proyectos en el navegador.
echo Cierra las ventanas de consola para detener cada servidor.
endlocal
