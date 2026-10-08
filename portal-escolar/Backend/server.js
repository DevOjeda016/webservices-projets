const express = require("express");
const path = require("path");
const alumno = require("./data/alumno");
const calificaciones = require("./data/calificaciones");

const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.static(path.join(__dirname, "..", "Frontend")));

app.get("/api/alumno", (req, res) => {
  res.json(alumno);
});

app.get("/api/calificaciones", (req, res) => {
  res.json(calificaciones);
});

app.listen(PORT, () => {
  console.log(`API Portal Escolar corriendo en http://localhost:${PORT}`);
});
