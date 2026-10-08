const express = require("express");
const path = require("path");
const fs = require("fs");
const proyectos = require("./data/proyectos");

const app = express();
const PORT = process.env.PORT || 3004;
const MENSAJES_PATH = path.join(__dirname, "data", "mensajes.json");

app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.use(
  express.static(
    path.join(__dirname, "..", "dist", "lattice-systems-web-frontend", "browser")
  )
);

function leerMensajes() {
  const contenido = fs.readFileSync(MENSAJES_PATH, "utf-8");
  return JSON.parse(contenido || "[]");
}

function guardarMensajes(mensajes) {
  fs.writeFileSync(MENSAJES_PATH, JSON.stringify(mensajes, null, 2));
}

app.get("/api/proyectos", (req, res) => {
  res.json(proyectos);
});

app.get("/api/contacto", (req, res) => {
  const mensajes = leerMensajes().sort((a, b) => b.recibidoEn.localeCompare(a.recibidoEn));
  res.json(mensajes);
});

app.post("/api/contacto", (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !name.trim() || !email || !email.trim()) {
    return res.status(400).json({ error: "Nombre y correo son obligatorios" });
  }

  const mensaje = {
    id: Date.now().toString(),
    name: name.trim(),
    email: email.trim(),
    message: (message || "").trim(),
    recibidoEn: new Date().toISOString()
  };

  const mensajes = leerMensajes();
  mensajes.push(mensaje);
  guardarMensajes(mensajes);

  res.status(201).json(mensaje);
});

app.listen(PORT, () => {
  console.log(`API Lattice Systems corriendo en http://localhost:${PORT}`);
});
