const grid = document.getElementById("grid-signos");
const modal = document.getElementById("modal");
const detalleSigno = document.getElementById("detalle-signo");
const cerrarModal = document.getElementById("cerrar-modal");
const formFecha = document.getElementById("form-fecha");
const resultadoBusqueda = document.getElementById("resultado-busqueda");
const estadoConexion = document.getElementById("estado-conexion");

function actualizarEstadoConexion() {
  estadoConexion.classList.toggle("oculto", navigator.onLine);
}
window.addEventListener("online", actualizarEstadoConexion);
window.addEventListener("offline", actualizarEstadoConexion);
actualizarEstadoConexion();

function tarjetaHTML(signo) {
  return `
    <div class="tarjeta" data-id="${signo.id}">
      <img src="${signo.imagen}" alt="${signo.nombre}" />
      <h3>${signo.nombre}</h3>
      <span>${signo.simbolo}</span>
    </div>
  `;
}

function detalleHTML(signo) {
  return `
    <img src="${signo.imagen}" alt="${signo.nombre}" />
    <h2>${signo.nombre} ${signo.simbolo}</h2>
    <p class="meta">${signo.elemento} · Regido por ${signo.regente} · ${signo.fechaInicio} a ${signo.fechaFin}</p>
    <p>${signo.cartaAstral}</p>
  `;
}

let signosCache = JSON.parse(localStorage.getItem("signos-cache") || "[]");

async function cargarSignos() {
  try {
    const res = await fetch("/api/signos");
    signosCache = await res.json();
    localStorage.setItem("signos-cache", JSON.stringify(signosCache));
  } catch (err) {
    // sin conexion: seguimos con lo que ya habia en cache local
  }

  grid.innerHTML = signosCache.length
    ? signosCache.map(tarjetaHTML).join("")
    : "<p>No se pudieron cargar los signos.</p>";
}

grid.addEventListener("click", (e) => {
  const tarjeta = e.target.closest(".tarjeta");
  if (!tarjeta) return;
  const id = tarjeta.dataset.id;

  const signo = signosCache.find((s) => s.id === id);
  if (signo) {
    detalleSigno.innerHTML = detalleHTML(signo);
    modal.classList.remove("oculto");
  }
});

cerrarModal.addEventListener("click", () => modal.classList.add("oculto"));
modal.addEventListener("click", (e) => {
  if (e.target === modal) modal.classList.add("oculto");
});

formFecha.addEventListener("submit", async (e) => {
  e.preventDefault();
  const dia = parseInt(document.getElementById("dia").value, 10);
  const mes = parseInt(document.getElementById("mes").value, 10);

  const signo = encontrarSignoPorFecha(dia, mes);
  if (signo) {
    resultadoBusqueda.innerHTML = `Tu signo es <strong>${signo.nombre} ${signo.simbolo}</strong>`;
  } else {
    resultadoBusqueda.innerHTML = "No se pudo encontrar el signo para esa fecha.";
  }
});

function encontrarSignoPorFecha(dia, mes) {
  if (!dia || !mes || mes < 1 || mes > 12 || dia < 1 || dia > 31) return null;

  const fecha = `${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;

  return signosCache.find((s) => {
    if (s.fechaInicio <= s.fechaFin) {
      return fecha >= s.fechaInicio && fecha <= s.fechaFin;
    }
    return fecha >= s.fechaInicio || fecha <= s.fechaFin;
  });
}

cargarSignos();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.error("Error registrando el service worker:", err);
    });
  });
}
