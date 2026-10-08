const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3002;
const DB_PATH = path.join(__dirname, "data", "tareas.json");

app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.use(express.static(path.join(__dirname, "..", "Frontend")));

function leerTareas() {
  const contenido = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(contenido || "[]");
}

function guardarTareas(tareas) {
  fs.writeFileSync(DB_PATH, JSON.stringify(tareas, null, 2));
}

app.get("/api/tareas", (req, res) => {
  res.json(leerTareas());
});

app.post("/api/tareas", (req, res) => {
  const texto = (req.body.texto || "").trim();
  if (!texto) {
    return res.status(400).json({ error: "El texto de la tarea es requerido" });
  }

  const tareas = leerTareas();
  const nuevaTarea = {
    id: Date.now().toString(),
    texto,
    completada: false,
    creadaEn: new Date().toISOString()
  };
  tareas.push(nuevaTarea);
  guardarTareas(tareas);

  res.status(201).json(nuevaTarea);
});

app.patch("/api/tareas/:id", (req, res) => {
  const tareas = leerTareas();
  const tarea = tareas.find((t) => t.id === req.params.id);

  if (!tarea) {
    return res.status(404).json({ error: "Tarea no encontrada" });
  }

  if (typeof req.body.completada === "boolean") {
    tarea.completada = req.body.completada;
  }
  if (typeof req.body.texto === "string" && req.body.texto.trim()) {
    tarea.texto = req.body.texto.trim();
  }

  guardarTareas(tareas);
  res.json(tarea);
});

app.delete("/api/tareas/:id", (req, res) => {
  const tareas = leerTareas();
  const existe = tareas.some((t) => t.id === req.params.id);

  if (!existe) {
    return res.status(404).json({ error: "Tarea no encontrada" });
  }

  guardarTareas(tareas.filter((t) => t.id !== req.params.id));
  res.status(204).end();
});

app.listen(PORT, () => {
  console.log(`API Lista de Tareas corriendo en http://localhost:${PORT}`);
});
