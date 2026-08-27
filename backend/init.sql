CREATE TABLE IF NOT EXISTS materias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    profesor VARCHAR(100) NOT NULL,
    estado VARCHAR(50) NOT NULL DEFAULT 'Cursando'
);

CREATE TABLE IF NOT EXISTS actividades (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT,
    fecha_entrega DATE,
    completada BOOLEAN DEFAULT FALSE,
    materia_id INTEGER NOT NULL,
    CONSTRAINT fk_materia
        FOREIGN KEY (materia_id)
        REFERENCES materias(id)
        ON DELETE CASCADE
);