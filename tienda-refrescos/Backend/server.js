const express = require("express");
const path = require("path");
const fs = require("fs");
const refrescos = require("./data/refrescos");

const app = express();
const PORT = process.env.PORT || 3001;
const PEDIDOS_PATH = path.join(__dirname, "data", "pedidos.json");

app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.use(express.static(path.join(__dirname, "..", "Frontend")));

function leerPedidos() {
  const contenido = fs.readFileSync(PEDIDOS_PATH, "utf-8");
  return JSON.parse(contenido || "[]");
}

function guardarPedidos(pedidos) {
  fs.writeFileSync(PEDIDOS_PATH, JSON.stringify(pedidos, null, 2));
}

app.get("/api/refrescos", (req, res) => {
  res.json(refrescos);
});

app.get("/api/refrescos/:id", (req, res) => {
  const refresco = refrescos.find((r) => r.id === req.params.id.toLowerCase());
  if (!refresco) {
    return res.status(404).json({ error: "Refresco no encontrado" });
  }
  res.json(refresco);
});

app.get("/api/pedidos", (req, res) => {
  const pedidos = leerPedidos().sort((a, b) => b.creadoEn.localeCompare(a.creadoEn));
  res.json(pedidos);
});

app.post("/api/pedidos", (req, res) => {
  const { items, clienteId } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "El pedido debe tener al menos un item" });
  }

  const pedidos = leerPedidos();

  // Idempotencia: si este pedido ya se recibio antes (reintento tras perder la respuesta),
  // devolvemos el que ya existe en vez de crear uno duplicado.
  if (clienteId) {
    const yaExiste = pedidos.find((p) => p.clienteId === clienteId);
    if (yaExiste) {
      return res.status(200).json(yaExiste);
    }
  }

  let total = 0;
  const detalle = [];

  for (const item of items) {
    const refresco = refrescos.find((r) => r.id === item.id);
    if (!refresco) {
      return res.status(400).json({ error: `Refresco "${item.id}" no existe` });
    }
    const cantidad = Number(item.cantidad) > 0 ? Number(item.cantidad) : 1;
    const subtotal = refresco.precio * cantidad;
    total += subtotal;
    detalle.push({ id: refresco.id, nombre: refresco.nombre, cantidad, subtotal: Number(subtotal.toFixed(2)) });
  }

  const pedido = {
    pedidoId: Date.now().toString(),
    clienteId: clienteId || null,
    detalle,
    total: Number(total.toFixed(2)),
    creadoEn: new Date().toISOString()
  };

  pedidos.push(pedido);
  guardarPedidos(pedidos);

  res.status(201).json(pedido);
});

app.listen(PORT, () => {
  console.log(`API Tienda de Refrescos corriendo en http://localhost:${PORT}`);
});
