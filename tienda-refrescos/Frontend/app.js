const grid = document.getElementById("grid-refrescos");
const estadoConexion = document.getElementById("estado-conexion");
const contadorCarrito = document.getElementById("contador-carrito");
const itemsCarritoEl = document.getElementById("items-carrito");
const totalCarritoEl = document.getElementById("total-carrito");
const confirmarPedidoBtn = document.getElementById("confirmar-pedido");
const resultadoPedidoEl = document.getElementById("resultado-pedido");
const botonesFiltro = document.querySelectorAll(".filtro");
const listaHistorialEl = document.getElementById("lista-historial");

let refrescosCache = [];
let carrito = JSON.parse(localStorage.getItem("carrito") || "{}");
let filtroActual = "todas";
let pedidosPendientes = JSON.parse(localStorage.getItem("pedidos-pendientes") || "[]");
let sincronizandoPedidos = false;

const formatoMoneda = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });
const formatoFecha = new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" });

function actualizarEstadoConexion() {
  estadoConexion.classList.toggle("oculto", navigator.onLine);
}
window.addEventListener("online", () => {
  actualizarEstadoConexion();
  sincronizarPedidos();
});
window.addEventListener("offline", actualizarEstadoConexion);
actualizarEstadoConexion();

function guardarCarrito() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
  renderCarrito();
}

function tarjetaHTML(refresco) {
  return `
    <div class="tarjeta">
      <img src="${refresco.imagen}" alt="${refresco.nombre}" loading="lazy" />
      <h3>${refresco.nombre}</h3>
      <span class="sabor">${refresco.sabor}</span>
      <span class="precio">${formatoMoneda.format(refresco.precio)}</span>
      <button data-id="${refresco.id}">Agregar</button>
    </div>
  `;
}

function renderGrid() {
  const refrescosFiltrados =
    filtroActual === "todas"
      ? refrescosCache
      : refrescosCache.filter((r) => r.categoria === filtroActual);

  grid.innerHTML = refrescosFiltrados.length
    ? refrescosFiltrados.map(tarjetaHTML).join("")
    : "<p>No hay refrescos en esta categoria.</p>";
}

async function cargarRefrescos() {
  try {
    const res = await fetch("/api/refrescos");
    refrescosCache = await res.json();
    localStorage.setItem("refrescos-cache", JSON.stringify(refrescosCache));
  } catch (err) {
    const cache = localStorage.getItem("refrescos-cache");
    refrescosCache = cache ? JSON.parse(cache) : [];
  }
  renderGrid();
}

grid.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-id]");
  if (!btn) return;
  const id = btn.dataset.id;
  carrito[id] = (carrito[id] || 0) + 1;
  guardarCarrito();
});

botonesFiltro.forEach((btn) => {
  btn.addEventListener("click", () => {
    botonesFiltro.forEach((b) => b.classList.remove("activo"));
    btn.classList.add("activo");
    filtroActual = btn.dataset.filtro;
    renderGrid();
  });
});

function renderCarrito() {
  const ids = Object.keys(carrito);
  const total = ids.reduce((acc, id) => acc + carrito[id], 0);
  contadorCarrito.textContent = total;

  if (ids.length === 0) {
    itemsCarritoEl.innerHTML = "<p>Tu carrito esta vacio.</p>";
    totalCarritoEl.textContent = "";
    return;
  }

  let totalPrecio = 0;
  itemsCarritoEl.innerHTML = ids
    .map((id) => {
      const refresco = refrescosCache.find((r) => r.id === id);
      if (!refresco) return "";
      const cantidad = carrito[id];
      const subtotal = refresco.precio * cantidad;
      totalPrecio += subtotal;
      return `
        <div class="item-carrito">
          <span>${refresco.nombre} x${cantidad}</span>
          <span>${formatoMoneda.format(subtotal)} <button data-id="${id}">Quitar</button></span>
        </div>
      `;
    })
    .join("");

  totalCarritoEl.textContent = `Total: ${formatoMoneda.format(totalPrecio)}`;
}

itemsCarritoEl.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-id]");
  if (!btn) return;
  const id = btn.dataset.id;
  delete carrito[id];
  guardarCarrito();
});

function guardarPedidosPendientes() {
  localStorage.setItem("pedidos-pendientes", JSON.stringify(pedidosPendientes));
  renderPedidosPendientes();
}

function renderPedidosPendientes() {
  document.querySelectorAll(".aviso-pendiente").forEach((el) => el.remove());
  if (pedidosPendientes.length === 0) return;

  const aviso = document.createElement("p");
  aviso.className = "aviso-pendiente";
  aviso.textContent =
    pedidosPendientes.length === 1
      ? "1 pedido en cola, se enviara cuando vuelva la conexion."
      : `${pedidosPendientes.length} pedidos en cola, se enviaran cuando vuelva la conexion.`;
  resultadoPedidoEl.after(aviso);
}

function generarClienteId() {
  return crypto.randomUUID ? crypto.randomUUID() : `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

async function enviarPedido(items, clienteId) {
  const res = await fetch("/api/pedidos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items, clienteId })
  });
  if (!res.ok) throw new Error("respuesta no ok");
  return res.json();
}

function pedidoHistorialHTML(pedido) {
  const fecha = formatoFecha.format(new Date(pedido.creadoEn));
  const items = pedido.detalle.map((d) => `${d.nombre} x${d.cantidad}`).join(", ");
  return `
    <div class="pedido-historial">
      <div class="cabecera">
        <span>Pedido #${pedido.pedidoId}</span>
        <span>${formatoMoneda.format(pedido.total)}</span>
      </div>
      <div class="detalle-items">${items} · ${fecha}</div>
    </div>
  `;
}

async function cargarHistorial() {
  let pedidos = [];
  try {
    const res = await fetch("/api/pedidos");
    pedidos = await res.json();
    localStorage.setItem("historial-cache", JSON.stringify(pedidos));
  } catch (err) {
    pedidos = JSON.parse(localStorage.getItem("historial-cache") || "[]");
  }

  listaHistorialEl.innerHTML = pedidos.length
    ? pedidos.map(pedidoHistorialHTML).join("")
    : "<p>Aun no tienes pedidos confirmados.</p>";
}

async function sincronizarPedidos() {
  if (sincronizandoPedidos || pedidosPendientes.length === 0) return;
  sincronizandoPedidos = true;

  while (pedidosPendientes.length > 0) {
    const pendiente = pedidosPendientes[0];
    try {
      const pedido = await enviarPedido(pendiente.items, pendiente.clienteId);
      pedidosPendientes.shift();
      guardarPedidosPendientes();
      resultadoPedidoEl.textContent = `Pedido #${pedido.pedidoId} (en cola) confirmado. Total: ${formatoMoneda.format(pedido.total)}`;
      cargarHistorial();
    } catch (err) {
      break; // seguimos sin conexion, reintentamos mas tarde
    }
  }

  sincronizandoPedidos = false;
}

confirmarPedidoBtn.addEventListener("click", async () => {
  if (confirmarPedidoBtn.disabled) return; // evita doble envio por doble clic

  const items = Object.entries(carrito).map(([id, cantidad]) => ({ id, cantidad }));
  if (items.length === 0) {
    resultadoPedidoEl.textContent = "Agrega productos antes de confirmar.";
    return;
  }

  const clienteId = generarClienteId();
  confirmarPedidoBtn.disabled = true;

  try {
    const pedido = await enviarPedido(items, clienteId);
    resultadoPedidoEl.textContent = `Pedido #${pedido.pedidoId} confirmado. Total: ${formatoMoneda.format(pedido.total)}`;
    carrito = {};
    guardarCarrito();
    cargarHistorial();
  } catch (err) {
    pedidosPendientes.push({ items, clienteId, creadoEn: new Date().toISOString() });
    guardarPedidosPendientes();
    resultadoPedidoEl.textContent = "Sin conexion: tu pedido quedo en cola y se enviara automaticamente al reconectar.";
    carrito = {};
    guardarCarrito();
  } finally {
    confirmarPedidoBtn.disabled = false;
  }
});

cargarRefrescos().then(() => {
  renderCarrito();
  renderPedidosPendientes();
  sincronizarPedidos();
});

cargarHistorial();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.error("Error registrando el service worker:", err);
    });
  });
}
