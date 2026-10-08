const formTarea = document.getElementById("form-tarea");
const inputTarea = document.getElementById("input-tarea");
const listaTareas = document.getElementById("lista-tareas");
const contadorTareas = document.getElementById("contador-tareas");
const botonesFiltro = document.querySelectorAll(".filtro");
const estadoConexion = document.getElementById("estado-conexion");

const CACHE_KEY = "tareas-cache";
const COLA_KEY = "cola-sync";

let tareas = JSON.parse(localStorage.getItem(CACHE_KEY) || "[]");
let cola = JSON.parse(localStorage.getItem(COLA_KEY) || "[]");
let filtroActual = "todas";
let sincronizando = false;

function actualizarEstadoConexion() {
  estadoConexion.classList.toggle("oculto", navigator.onLine);
}
window.addEventListener("online", () => {
  actualizarEstadoConexion();
  sincronizar();
});
window.addEventListener("offline", actualizarEstadoConexion);
actualizarEstadoConexion();

function guardarCache() {
  localStorage.setItem(CACHE_KEY, JSON.stringify(tareas));
}

function guardarCola() {
  localStorage.setItem(COLA_KEY, JSON.stringify(cola));
}

function tareasFiltradas() {
  if (filtroActual === "pendientes") return tareas.filter((t) => !t.completada);
  if (filtroActual === "completadas") return tareas.filter((t) => t.completada);
  return tareas;
}

function render() {
  const filtradas = tareasFiltradas();

  listaTareas.innerHTML = filtradas
    .map(
      (tarea) => `
        <li class="tarea ${tarea.completada ? "completada" : ""}" data-id="${tarea.id}">
          <input type="checkbox" ${tarea.completada ? "checked" : ""} />
          <span>${tarea.texto}${tarea.pendienteSync ? " ⏳" : ""}</span>
          <button aria-label="Eliminar">&times;</button>
        </li>
      `
    )
    .join("");

  const pendientes = tareas.filter((t) => !t.completada).length;
  contadorTareas.textContent = tareas.length
    ? `${pendientes} pendiente(s) de ${tareas.length} tarea(s)`
    : "No tienes tareas todavia";
}

async function cargarTareas() {
  try {
    const res = await fetch("/api/tareas");
    if (!res.ok) throw new Error("respuesta no ok");
    const servidor = await res.json();

    const idsEnCola = new Set(cola.filter((op) => op.tipo === "crear").map((op) => op.tempId));
    const localesPendientes = tareas.filter((t) => idsEnCola.has(t.id));

    tareas = [...servidor, ...localesPendientes];
    guardarCache();
  } catch (err) {
    // sin conexion: nos quedamos con lo que hay en cache local
  }
  render();
}

function agregarACola(operacion) {
  cola.push(operacion);
  guardarCola();
}

async function sincronizar() {
  if (sincronizando || cola.length === 0) return;
  sincronizando = true;

  while (cola.length > 0) {
    const operacion = cola[0];

    try {
      if (operacion.tipo === "crear") {
        const res = await fetch("/api/tareas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ texto: operacion.texto })
        });
        if (!res.ok) throw new Error("fallo al crear");
        const tareaCreada = await res.json();

        const idx = tareas.findIndex((t) => t.id === operacion.tempId);
        if (idx !== -1) tareas[idx] = tareaCreada;
      }

      if (operacion.tipo === "actualizar") {
        const res = await fetch(`/api/tareas/${operacion.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(operacion.cambios)
        });
        if (!res.ok) throw new Error("fallo al actualizar");
      }

      if (operacion.tipo === "eliminar") {
        const res = await fetch(`/api/tareas/${operacion.id}`, { method: "DELETE" });
        if (!res.ok && res.status !== 404) throw new Error("fallo al eliminar");
      }

      cola.shift();
      guardarCola();
    } catch (err) {
      break; // seguimos offline o el servidor no responde, reintentamos mas tarde
    }
  }

  guardarCache();
  render();
  sincronizando = false;
}

formTarea.addEventListener("submit", (e) => {
  e.preventDefault();
  const texto = inputTarea.value.trim();
  if (!texto) return;

  const tempId = "tmp-" + Date.now().toString();
  tareas.push({ id: tempId, texto, completada: false, pendienteSync: true });
  inputTarea.value = "";
  guardarCache();
  render();

  agregarACola({ tipo: "crear", tempId, texto });
  sincronizar();
});

listaTareas.addEventListener("click", (e) => {
  const li = e.target.closest(".tarea");
  if (!li) return;
  const id = li.dataset.id;

  if (e.target.matches("input[type='checkbox']")) {
    const tarea = tareas.find((t) => t.id === id);
    tarea.completada = !tarea.completada;
    guardarCache();
    render();

    if (id.startsWith("tmp-")) {
      const pendiente = cola.find((op) => op.tipo === "crear" && op.tempId === id);
      if (pendiente) pendiente.completadaInicial = tarea.completada;
    } else {
      agregarACola({ tipo: "actualizar", id, cambios: { completada: tarea.completada } });
    }
    sincronizar();
  }

  if (e.target.matches("button")) {
    tareas = tareas.filter((t) => t.id !== id);
    guardarCache();
    render();

    if (id.startsWith("tmp-")) {
      cola = cola.filter((op) => !(op.tipo === "crear" && op.tempId === id));
    } else {
      agregarACola({ tipo: "eliminar", id });
    }
    guardarCola();
    sincronizar();
  }
});

botonesFiltro.forEach((btn) => {
  btn.addEventListener("click", () => {
    botonesFiltro.forEach((b) => b.classList.remove("activo"));
    btn.classList.add("activo");
    filtroActual = btn.dataset.filtro;
    render();
  });
});

render();
cargarTareas().then(sincronizar);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.error("Error registrando el service worker:", err);
    });
  });
}
