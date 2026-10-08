const tabs = document.querySelectorAll(".tab");
const vistas = document.querySelectorAll(".vista");
const resumenAlumnoEl = document.getElementById("resumen-alumno");
const listaCalificacionesEl = document.getElementById("lista-calificaciones");
const datosPersonalesEl = document.getElementById("datos-personales");
const estadoConexion = document.getElementById("estado-conexion");

function actualizarEstadoConexion() {
  estadoConexion.classList.toggle("oculto", navigator.onLine);
}
window.addEventListener("online", actualizarEstadoConexion);
window.addEventListener("offline", actualizarEstadoConexion);
actualizarEstadoConexion();

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("activo"));
    vistas.forEach((v) => v.classList.remove("activa"));
    tab.classList.add("activo");
    document.getElementById(`vista-${tab.dataset.vista}`).classList.add("activa");
  });
});

function resumenAlumnoHTML(alumno) {
  return `
    <h2>Bienvenido, ${alumno.nombre}</h2>
    <div class="promedios">
      <div class="promedio-card">
        <div class="valor">${alumno.promedioGeneralIng}</div>
        <div class="etiqueta">Promedio Ingeniería</div>
      </div>
      <div class="promedio-card">
        <div class="valor">${alumno.promedioGeneralTSU}</div>
        <div class="etiqueta">Promedio TSU</div>
      </div>
    </div>
    <div class="fila"><span>Matrícula</span><span>${alumno.matricula}</span></div>
    <div class="fila"><span>Grupo actual</span><span>${alumno.grupoActual}</span></div>
    <div class="fila"><span>Estatus académico</span><span>${alumno.estatusAcademico}</span></div>
    <div class="fila"><span>Estatus de inscripción</span><span>${alumno.estatusInscripcion}</span></div>
    <div class="fila"><span>Estatus de pago</span><span>${alumno.estatusPago}</span></div>
    <div class="fila"><span>Carrera Ingeniería</span><span>${alumno.carreraIngenieria}</span></div>
    <div class="fila"><span>Carrera TSU</span><span>${alumno.carreraTSU}</span></div>
  `;
}

function grupoCalificacionesHTML(grupo) {
  const filas = grupo.materias
    .map(
      (m) => `
        <tr>
          <td>${m.materia}</td>
          <td class="cal-final">${m.calFinal}</td>
        </tr>
      `
    )
    .join("");

  return `
    <div class="grado-card">
      <div class="grado-cabecera">
        <h3>${grupo.nivel} · Grado ${grupo.grado} · ${grupo.periodo} · Grupo ${grupo.grupo}</h3>
        <span class="badge-promedio">Promedio: ${grupo.promedioCuatrimestral}</span>
      </div>
      <table>
        <thead>
          <tr><th>Materia</th><th>Calificación final</th></tr>
        </thead>
        <tbody>${filas}</tbody>
      </table>
    </div>
  `;
}

function datosPersonalesHTML(alumno) {
  const dp = alumno.datosPersonales;
  const dom = alumno.domicilio;

  const campo = (etiqueta, valor) => `
    <div class="dato-card">
      <span class="etiqueta">${etiqueta}</span>
      <span class="valor">${valor}</span>
    </div>
  `;

  return `
    <div class="datos-grid">
      <div class="nota">Cualquier cambio de datos personales debe solicitarse a servicios escolares.</div>
      ${campo("Nombre completo", dp.nombre)}
      ${campo("Fecha de nacimiento", dp.fechaNacimiento)}
      ${campo("Sexo", dp.sexo)}
      ${campo("CURP", dp.curp)}
      ${campo("Correo electrónico", dp.correo)}
      ${campo("Celular", dp.celular)}
      ${campo("Estado civil", dp.estadoCivil)}
      ${campo("Nacionalidad", dp.nacionalidad)}
      ${campo("País", dp.pais)}
      ${campo("Estado", dp.estado)}
      ${campo("Ciudad de origen", dp.ciudadOrigen)}
      ${campo("Domicilio", `${dom.calle} #${dom.numero}, ${dom.colonia}, ${dom.ciudad}, ${dom.estado}`)}
    </div>
  `;
}

async function cargarDatos() {
  let alumno;
  let calificaciones;

  try {
    const [resAlumno, resCalificaciones] = await Promise.all([
      fetch("/api/alumno"),
      fetch("/api/calificaciones")
    ]);
    alumno = await resAlumno.json();
    calificaciones = await resCalificaciones.json();
    localStorage.setItem("alumno-cache", JSON.stringify(alumno));
    localStorage.setItem("calificaciones-cache", JSON.stringify(calificaciones));
  } catch (err) {
    const alumnoCache = localStorage.getItem("alumno-cache");
    const calificacionesCache = localStorage.getItem("calificaciones-cache");
    if (!alumnoCache || !calificacionesCache) {
      resumenAlumnoEl.innerHTML = "<p>Sin conexion y sin datos en cache todavia.</p>";
      return;
    }
    alumno = JSON.parse(alumnoCache);
    calificaciones = JSON.parse(calificacionesCache);
  }

  resumenAlumnoEl.innerHTML = resumenAlumnoHTML(alumno);
  listaCalificacionesEl.innerHTML = calificaciones.map(grupoCalificacionesHTML).join("");
  datosPersonalesEl.innerHTML = datosPersonalesHTML(alumno);
}

cargarDatos();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.error("Error registrando el service worker:", err);
    });
  });
}
