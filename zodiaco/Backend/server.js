const express = require("express");
const path = require("path");
const signos = require("./data/signos");

const app = express();
const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.use(express.static(path.join(__dirname, "..", "Frontend")));

app.get("/api/signos", (req, res) => {
  res.json(signos);
});

app.get("/api/signos/fecha/:dia/:mes", (req, res) => {
  const dia = parseInt(req.params.dia, 10);
  const mes = parseInt(req.params.mes, 10);

  if (!dia || !mes || mes < 1 || mes > 12 || dia < 1 || dia > 31) {
    return res.status(400).json({ error: "Fecha invalida" });
  }

  const fecha = `${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;

  const signo = signos.find((s) => {
    if (s.fechaInicio <= s.fechaFin) {
      return fecha >= s.fechaInicio && fecha <= s.fechaFin;
    }
    return fecha >= s.fechaInicio || fecha <= s.fechaFin;
  });

  if (!signo) {
    return res.status(404).json({ error: "No se encontro signo para esa fecha" });
  }

  res.json(signo);
});

app.get("/api/signos/:id", (req, res) => {
  const signo = signos.find((s) => s.id === req.params.id.toLowerCase());
  if (!signo) {
    return res.status(404).json({ error: "Signo no encontrado" });
  }
  res.json(signo);
});

app.listen(PORT, () => {
  console.log(`API Zodiaco corriendo en http://localhost:${PORT}`);
});
