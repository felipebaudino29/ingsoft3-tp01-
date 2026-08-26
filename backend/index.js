const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// =========================
// HEALTH / INICIO
// =========================

app.get("/", (req, res) => {
  res.json({
    mensaje: "API Gestor de Materias funcionando",
  });
});

// =========================
// MATERIAS
// =========================

// Obtener todas las materias
app.get("/materias", async (req, res) => {
  try {
    const resultado = await pool.query(
      "SELECT * FROM materias ORDER BY id"
    );

    res.json(resultado.rows);
  } catch (error) {
    console.error("Error al obtener materias:", error);

    res.status(500).json({
      error: "Error al obtener las materias",
    });
  }
});

// Crear materia
app.post("/materias", async (req, res) => {
  try {
    const { nombre, profesor, estado } = req.body;

    if (!nombre?.trim() || !profesor?.trim() || !estado?.trim()) {
      return res.status(400).json({
        error: "Todos los campos de la materia son obligatorios",
      });
    }

    const estadosValidos = ["Cursando", "Pendiente", "Aprobada"];

    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({
        error: "Estado de materia inválido",
      });
    }

    const resultado = await pool.query(
      `INSERT INTO materias (nombre, profesor, estado)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [
        nombre.trim(),
        profesor.trim(),
        estado,
      ]
    );

    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error("Error al crear materia:", error);

    res.status(500).json({
      error: "Error al crear la materia",
    });
  }
});

// Editar materia
app.put("/materias/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, profesor, estado } = req.body;

    if (!nombre?.trim() || !profesor?.trim() || !estado?.trim()) {
      return res.status(400).json({
        error: "Todos los campos de la materia son obligatorios",
      });
    }

    const estadosValidos = ["Cursando", "Pendiente", "Aprobada"];

    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({
        error: "Estado de materia inválido",
      });
    }

    const resultado = await pool.query(
      `UPDATE materias
       SET nombre = $1,
           profesor = $2,
           estado = $3
       WHERE id = $4
       RETURNING *`,
      [
        nombre.trim(),
        profesor.trim(),
        estado,
        id,
      ]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        error: "Materia no encontrada",
      });
    }

    res.json(resultado.rows[0]);
  } catch (error) {
    console.error("Error al editar materia:", error);

    res.status(500).json({
      error: "Error al editar la materia",
    });
  }
});

// Eliminar materia
app.delete("/materias/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await pool.query(
      `DELETE FROM materias
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        error: "Materia no encontrada",
      });
    }

    res.json({
      mensaje: "Materia eliminada correctamente",
      materia: resultado.rows[0],
    });
  } catch (error) {
    console.error("Error al eliminar materia:", error);

    res.status(500).json({
      error: "Error al eliminar la materia",
    });
  }
});

// =========================
// ACTIVIDADES
// =========================

// Obtener todas las actividades
app.get("/actividades", async (req, res) => {
  try {
    const resultado = await pool.query(
      `SELECT
        actividades.id,
        actividades.titulo,
        actividades.descripcion,
        actividades.fecha_entrega,
        actividades.completada,
        actividades.materia_id,
        materias.nombre AS materia_nombre
       FROM actividades
       INNER JOIN materias
         ON actividades.materia_id = materias.id
       ORDER BY actividades.fecha_entrega, actividades.id`
    );

    res.json(resultado.rows);
  } catch (error) {
    console.error("Error al obtener actividades:", error);

    res.status(500).json({
      error: "Error al obtener las actividades",
    });
  }
});

// Obtener actividades de una materia
app.get("/materias/:id/actividades", async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await pool.query(
      `SELECT *
       FROM actividades
       WHERE materia_id = $1
       ORDER BY fecha_entrega, id`,
      [id]
    );

    res.json(resultado.rows);
  } catch (error) {
    console.error(
      "Error al obtener actividades de la materia:",
      error
    );

    res.status(500).json({
      error: "Error al obtener las actividades de la materia",
    });
  }
});

// Crear actividad
app.post("/actividades", async (req, res) => {
  try {
    const {
      titulo,
      descripcion,
      fecha_entrega,
      completada,
      materia_id,
    } = req.body;

    if (!titulo?.trim() || !fecha_entrega || !materia_id) {
      return res.status(400).json({
        error: "Título, fecha y materia son obligatorios",
      });
    }

    const materiaExiste = await pool.query(
      "SELECT id FROM materias WHERE id = $1",
      [materia_id]
    );

    if (materiaExiste.rows.length === 0) {
      return res.status(404).json({
        error: "La materia indicada no existe",
      });
    }

    const resultado = await pool.query(
      `INSERT INTO actividades (
        titulo,
        descripcion,
        fecha_entrega,
        completada,
        materia_id
       )
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        titulo.trim(),
        descripcion?.trim() || null,
        fecha_entrega,
        completada ?? false,
        materia_id,
      ]
    );

    res.status(201).json(resultado.rows[0]);
  } catch (error) {
    console.error("Error al crear actividad:", error);

    res.status(500).json({
      error: "Error al crear la actividad",
    });
  }
});

// Editar actividad
app.put("/actividades/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const {
      titulo,
      descripcion,
      fecha_entrega,
      completada,
      materia_id,
    } = req.body;

    if (!titulo?.trim() || !fecha_entrega || !materia_id) {
      return res.status(400).json({
        error: "Título, fecha y materia son obligatorios",
      });
    }

    const materiaExiste = await pool.query(
      "SELECT id FROM materias WHERE id = $1",
      [materia_id]
    );

    if (materiaExiste.rows.length === 0) {
      return res.status(404).json({
        error: "La materia indicada no existe",
      });
    }

    const resultado = await pool.query(
      `UPDATE actividades
       SET titulo = $1,
           descripcion = $2,
           fecha_entrega = $3,
           completada = $4,
           materia_id = $5
       WHERE id = $6
       RETURNING *`,
      [
        titulo.trim(),
        descripcion?.trim() || null,
        fecha_entrega,
        completada ?? false,
        materia_id,
        id,
      ]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        error: "Actividad no encontrada",
      });
    }

    res.json(resultado.rows[0]);
  } catch (error) {
    console.error("Error al editar actividad:", error);

    res.status(500).json({
      error: "Error al editar la actividad",
    });
  }
});

// Cambiar solamente el estado completada
app.patch("/actividades/:id/completada", async (req, res) => {
  try {
    const { id } = req.params;
    const { completada } = req.body;

    if (typeof completada !== "boolean") {
      return res.status(400).json({
        error: "El estado completada debe ser verdadero o falso",
      });
    }

    const resultado = await pool.query(
      `UPDATE actividades
       SET completada = $1
       WHERE id = $2
       RETURNING *`,
      [completada, id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        error: "Actividad no encontrada",
      });
    }

    res.json(resultado.rows[0]);
  } catch (error) {
    console.error(
      "Error al cambiar estado de actividad:",
      error
    );

    res.status(500).json({
      error: "Error al actualizar la actividad",
    });
  }
});

// Eliminar actividad
app.delete("/actividades/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await pool.query(
      `DELETE FROM actividades
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        error: "Actividad no encontrada",
      });
    }

    res.json({
      mensaje: "Actividad eliminada correctamente",
      actividad: resultado.rows[0],
    });
  } catch (error) {
    console.error("Error al eliminar actividad:", error);

    res.status(500).json({
      error: "Error al eliminar la actividad",
    });
  }
});

// =========================
// SERVIDOR
// =========================

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});