import { useEffect, useState } from "react";
import "./App.css";

const API = "/api";

function App() {
  const [materias, setMaterias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const [nombre, setNombre] = useState("");
  const [profesor, setProfesor] = useState("");
  const [estado, setEstado] = useState("Cursando");
  const [materiaEditandoId, setMateriaEditandoId] = useState(null);
  const [guardandoMateria, setGuardandoMateria] = useState(false);

  const [materiaSeleccionadaId, setMateriaSeleccionadaId] = useState(null);

  const [actividades, setActividades] = useState([]);
  const [cargandoActividades, setCargandoActividades] = useState(false);

  const [tituloActividad, setTituloActividad] = useState("");
  const [descripcionActividad, setDescripcionActividad] = useState("");
  const [fechaActividad, setFechaActividad] = useState("");
  const [actividadEditandoId, setActividadEditandoId] = useState(null);
  const [guardandoActividad, setGuardandoActividad] = useState(false);

  const [confirmacion, setConfirmacion] = useState(null);

  const materiaSeleccionada = materias.find(
    (materia) => materia.id === materiaSeleccionadaId
  );

  const cargarMaterias = async () => {
    try {
      setError("");

      const respuesta = await fetch(`${API}/materias`);

      if (!respuesta.ok) {
        throw new Error();
      }

      const datos = await respuesta.json();
      setMaterias(datos);

      if (
        materiaSeleccionadaId !== null &&
        !datos.some((materia) => materia.id === materiaSeleccionadaId)
      ) {
        setMateriaSeleccionadaId(null);
        setActividades([]);
      }
    } catch (error) {
      console.error(error);
      setError("No se pudieron cargar las materias");
    } finally {
      setCargando(false);
    }
  };

  const cargarActividades = async (materiaId) => {
    try {
      setCargandoActividades(true);
      setError("");

      const respuesta = await fetch(
        `${API}/materias/${materiaId}/actividades`
      );

      if (!respuesta.ok) {
        throw new Error();
      }

      const datos = await respuesta.json();
      setActividades(datos);
    } catch (error) {
      console.error(error);
      setError("No se pudieron cargar las actividades");
    } finally {
      setCargandoActividades(false);
    }
  };

  useEffect(() => {
    cargarMaterias();
  }, []);

  useEffect(() => {
    if (materiaSeleccionadaId !== null) {
      cargarActividades(materiaSeleccionadaId);
    } else {
      setActividades([]);
    }
  }, [materiaSeleccionadaId]);

  const limpiarFormularioMateria = () => {
    setNombre("");
    setProfesor("");
    setEstado("Cursando");
    setMateriaEditandoId(null);
  };

  const guardarMateria = async (evento) => {
    evento.preventDefault();

    if (!nombre.trim() || !profesor.trim() || !estado) {
      setError(
        "Completá nombre, profesor y estado antes de guardar la materia"
      );
      return;
    }

    try {
      setGuardandoMateria(true);
      setError("");

      const datosMateria = {
        nombre: nombre.trim(),
        profesor: profesor.trim(),
        estado,
      };

      let respuesta;

      if (materiaEditandoId !== null) {
        respuesta = await fetch(
          `${API}/materias/${materiaEditandoId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(datosMateria),
          }
        );
      } else {
        respuesta = await fetch(`${API}/materias`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(datosMateria),
        });
      }

      if (!respuesta.ok) {
        throw new Error();
      }

      limpiarFormularioMateria();
      await cargarMaterias();
    } catch (error) {
      console.error(error);
      setError("No se pudo guardar la materia");
    } finally {
      setGuardandoMateria(false);
    }
  };

  const comenzarEdicionMateria = (materia) => {
    setMateriaEditandoId(materia.id);
    setNombre(materia.nombre);
    setProfesor(materia.profesor || "");
    setEstado(materia.estado);
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const solicitarEliminarMateria = (materia) => {
    setConfirmacion({
      tipo: "materia",
      id: materia.id,
      titulo: "Eliminar materia",
      mensaje: `¿Seguro que querés eliminar "${materia.nombre}"? También se eliminarán todas sus actividades.`,
    });
  };

  const eliminarMateria = async (id) => {
    try {
      setError("");

      const respuesta = await fetch(`${API}/materias/${id}`, {
        method: "DELETE",
      });

      if (!respuesta.ok) {
        throw new Error();
      }

      if (materiaSeleccionadaId === id) {
        setMateriaSeleccionadaId(null);
        setActividades([]);
      }

      if (materiaEditandoId === id) {
        limpiarFormularioMateria();
      }

      await cargarMaterias();
    } catch (error) {
      console.error(error);
      setError("No se pudo eliminar la materia");
    }
  };

  const seleccionarMateria = (id) => {
    setMateriaSeleccionadaId(id);
    limpiarFormularioActividad();
    setError("");
  };

  const limpiarFormularioActividad = () => {
    setTituloActividad("");
    setDescripcionActividad("");
    setFechaActividad("");
    setActividadEditandoId(null);
  };

  const guardarActividad = async (evento) => {
    evento.preventDefault();

    if (!materiaSeleccionadaId) {
      setError("Seleccioná una materia");
      return;
    }

    if (!tituloActividad.trim() || !fechaActividad) {
      setError(
        "Completá el título y la fecha antes de guardar la actividad"
      );
      return;
    }

    try {
      setGuardandoActividad(true);
      setError("");

      const datosActividad = {
        titulo: tituloActividad.trim(),
        descripcion: descripcionActividad.trim(),
        fecha_entrega: fechaActividad,
        completada:
          actividadEditandoId !== null
            ? actividades.find(
                (actividad) => actividad.id === actividadEditandoId
              )?.completada ?? false
            : false,
        materia_id: materiaSeleccionadaId,
      };

      let respuesta;

      if (actividadEditandoId !== null) {
        respuesta = await fetch(
          `${API}/actividades/${actividadEditandoId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(datosActividad),
          }
        );
      } else {
        respuesta = await fetch(`${API}/actividades`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(datosActividad),
        });
      }

      if (!respuesta.ok) {
        throw new Error();
      }

      limpiarFormularioActividad();
      await cargarActividades(materiaSeleccionadaId);
    } catch (error) {
      console.error(error);
      setError("No se pudo guardar la actividad");
    } finally {
      setGuardandoActividad(false);
    }
  };

  const comenzarEdicionActividad = (actividad) => {
    setActividadEditandoId(actividad.id);
    setTituloActividad(actividad.titulo);
    setDescripcionActividad(actividad.descripcion || "");
    setFechaActividad(
      actividad.fecha_entrega
        ? actividad.fecha_entrega.substring(0, 10)
        : ""
    );
    setError("");
  };

  const cambiarCompletada = async (actividad) => {
    try {
      setError("");

      const respuesta = await fetch(
        `${API}/actividades/${actividad.id}/completada`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            completada: !actividad.completada,
          }),
        }
      );

      if (!respuesta.ok) {
        throw new Error();
      }

      await cargarActividades(materiaSeleccionadaId);
    } catch (error) {
      console.error(error);
      setError("No se pudo actualizar la actividad");
    }
  };

  const solicitarEliminarActividad = (actividad) => {
    setConfirmacion({
      tipo: "actividad",
      id: actividad.id,
      titulo: "Eliminar actividad",
      mensaje: `¿Seguro que querés eliminar "${actividad.titulo}"?`,
    });
  };

  const eliminarActividad = async (id) => {
    try {
      setError("");

      const respuesta = await fetch(`${API}/actividades/${id}`, {
        method: "DELETE",
      });

      if (!respuesta.ok) {
        throw new Error();
      }

      if (actividadEditandoId === id) {
        limpiarFormularioActividad();
      }

      await cargarActividades(materiaSeleccionadaId);
    } catch (error) {
      console.error(error);
      setError("No se pudo eliminar la actividad");
    }
  };

  const confirmarEliminacion = async () => {
    if (!confirmacion) {
      return;
    }

    const { tipo, id } = confirmacion;

    setConfirmacion(null);

    if (tipo === "materia") {
      await eliminarMateria(id);
    }

    if (tipo === "actividad") {
      await eliminarActividad(id);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) {
      return "Sin fecha";
    }

    return new Date(fecha).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  const actividadesCompletadas = actividades.filter(
    (actividad) => actividad.completada
  ).length;

  return (
    <main className="app">
      <header className="encabezado">
        <p className="eyebrow">Gestor académico</p>
        <h1>Mis materias</h1>
        <p className="subtitulo">
          Organizá tus materias y actividades desde un solo lugar.
        </p>
      </header>

      {error && <div className="mensaje-error">{error}</div>}

      <section className="panel-formulario">
        <div className="panel-titulo">
          <h2>
            {materiaEditandoId !== null
              ? "Editar materia"
              : "Nueva materia"}
          </h2>

          <p>
            {materiaEditandoId !== null
              ? "Modificá los datos de la materia seleccionada."
              : "Agregá una materia para comenzar a organizar sus actividades."}
          </p>
        </div>

        <form className="formulario-materia" onSubmit={guardarMateria}>
          <div className="campo">
            <label htmlFor="nombre">Nombre</label>
            <input
              id="nombre"
              type="text"
              placeholder="Ej: Arquitectura de Software"
              value={nombre}
              onChange={(evento) => setNombre(evento.target.value)}
            />
          </div>

          <div className="campo">
            <label htmlFor="profesor">Profesor</label>
            <input
              id="profesor"
              type="text"
              placeholder="Ej: Juan Pérez"
              value={profesor}
              onChange={(evento) => setProfesor(evento.target.value)}
            />
          </div>

          <div className="campo">
            <label htmlFor="estado">Estado</label>
            <select
              id="estado"
              value={estado}
              onChange={(evento) => setEstado(evento.target.value)}
            >
              <option value="Cursando">Cursando</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Aprobada">Aprobada</option>
            </select>
          </div>

          <div className="acciones-formulario">
            <button
              className="boton-principal"
              type="submit"
              disabled={guardandoMateria}
            >
              {guardandoMateria
                ? "Guardando..."
                : materiaEditandoId !== null
                ? "Guardar cambios"
                : "Agregar materia"}
            </button>

            {materiaEditandoId !== null && (
              <button
                className="boton-secundario"
                type="button"
                onClick={() => {
                  limpiarFormularioMateria();
                  setError("");
                }}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="contenido">
        <div className="seccion-titulo">
          <h2>Materias cargadas</h2>

          <span className="contador">
            {materias.length}{" "}
            {materias.length === 1 ? "materia" : "materias"}
          </span>
        </div>

        {cargando && <p>Cargando materias...</p>}

        {!cargando && materias.length === 0 && (
          <div className="estado-vacio">
            Todavía no cargaste ninguna materia.
          </div>
        )}

        <div className="grid-materias">
          {materias.map((materia) => {
            const seleccionada =
              materia.id === materiaSeleccionadaId;

            return (
              <article
                className={`tarjeta-materia ${
                  seleccionada ? "seleccionada" : ""
                }`}
                key={materia.id}
              >
                <button
                  className="area-materia"
                  type="button"
                  onClick={() => seleccionarMateria(materia.id)}
                >
                  <div>
                    <h3>{materia.nombre}</h3>
                    <p>
                      <strong>Profesor:</strong> {materia.profesor}
                    </p>
                  </div>

                  <span className="estado">{materia.estado}</span>
                </button>

                <div className="acciones-materia">
                  <button
                    className="boton-editar"
                    type="button"
                    onClick={() => comenzarEdicionMateria(materia)}
                  >
                    Editar
                  </button>

                  <button
                    className="boton-eliminar"
                    type="button"
                    onClick={() => solicitarEliminarMateria(materia)}
                  >
                    Eliminar
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {materiaSeleccionada && (
        <section className="panel-actividades">
          <div className="cabecera-actividades">
            <div>
              <p className="eyebrow">Actividades</p>
              <h2>{materiaSeleccionada.nombre}</h2>
              <p>
                {actividadesCompletadas} de {actividades.length} completadas
              </p>
            </div>

            <button
              className="boton-secundario"
              type="button"
              onClick={() => setMateriaSeleccionadaId(null)}
            >
              Cerrar
            </button>
          </div>

          <form className="formulario-actividad" onSubmit={guardarActividad}>
            <div className="campo">
              <label htmlFor="tituloActividad">Actividad</label>
              <input
                id="tituloActividad"
                type="text"
                placeholder="Ej: Parcial 1"
                value={tituloActividad}
                onChange={(evento) =>
                  setTituloActividad(evento.target.value)
                }
              />
            </div>

            <div className="campo">
              <label htmlFor="fechaActividad">Fecha</label>
              <input
                id="fechaActividad"
                type="date"
                value={fechaActividad}
                onChange={(evento) =>
                  setFechaActividad(evento.target.value)
                }
              />
            </div>

            <div className="campo descripcion">
              <label htmlFor="descripcionActividad">Descripción</label>
              <input
                id="descripcionActividad"
                type="text"
                placeholder="Opcional"
                value={descripcionActividad}
                onChange={(evento) =>
                  setDescripcionActividad(evento.target.value)
                }
              />
            </div>

            <div className="acciones-formulario">
              <button
                className="boton-principal"
                type="submit"
                disabled={guardandoActividad}
              >
                {guardandoActividad
                  ? "Guardando..."
                  : actividadEditandoId !== null
                  ? "Guardar cambios"
                  : "Agregar actividad"}
              </button>

              {actividadEditandoId !== null && (
                <button
                  className="boton-secundario"
                  type="button"
                  onClick={limpiarFormularioActividad}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>

          <div className="lista-actividades">
            {cargandoActividades && <p>Cargando actividades...</p>}

            {!cargandoActividades && actividades.length === 0 && (
              <div className="estado-vacio">
                Esta materia todavía no tiene actividades.
              </div>
            )}

            {actividades.map((actividad) => (
              <article
                className={`actividad ${
                  actividad.completada
                    ? "actividad-completada"
                    : ""
                }`}
                key={actividad.id}
              >
                <button
                  className="check-actividad"
                  type="button"
                  onClick={() => cambiarCompletada(actividad)}
                >
                  {actividad.completada ? "✓" : ""}
                </button>

                <div className="actividad-contenido">
                  <div className="actividad-principal">
                    <h3>{actividad.titulo}</h3>

                    <span className="fecha">
                      {formatearFecha(actividad.fecha_entrega)}
                    </span>
                  </div>

                  {actividad.descripcion && (
                    <p>{actividad.descripcion}</p>
                  )}
                </div>

                <div className="actividad-acciones">
                  <button
                    className="boton-editar"
                    type="button"
                    onClick={() =>
                      comenzarEdicionActividad(actividad)
                    }
                  >
                    Editar
                  </button>

                  <button
                    className="boton-eliminar"
                    type="button"
                    onClick={() =>
                      solicitarEliminarActividad(actividad)
                    }
                  >
                    Eliminar
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {confirmacion && (
        <div
          className="modal-fondo"
          onClick={() => setConfirmacion(null)}
        >
          <div
            className="modal"
            onClick={(evento) => evento.stopPropagation()}
          >
            <div className="modal-icono">!</div>

            <h2>{confirmacion.titulo}</h2>
            <p>{confirmacion.mensaje}</p>

            <div className="modal-acciones">
              <button
                className="boton-secundario"
                type="button"
                onClick={() => setConfirmacion(null)}
              >
                Cancelar
              </button>

              <button
                className="boton-confirmar-eliminar"
                type="button"
                onClick={confirmarEliminacion}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default App;