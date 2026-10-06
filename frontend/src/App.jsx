import { useEffect, useState } from "react";
import "./App.css";

const API = "/api";

function App() {
  const [materias, setMaterias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  // Estado del formulario colapsable y secuencial
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [pasoFormulario, setPasoFormulario] = useState(1); // 1: Nombre -> 2: Profesor -> 3: Estado

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

  // Bitácora Markdown
  const [materiaBitacora, setMateriaBitacora] = useState(null);
  const [textoMarkdown, setTextoMarkdown] = useState("");
  const [guardandoNotas, setGuardandoNotas] = useState(false);
  const [vistaMarkdown, setVistaMarkdown] = useState("edit");
  const [mensajeNotas, setMensajeNotas] = useState("");

  const [confirmacion, setConfirmacion] = useState(null);

  const materiaSeleccionada = materias.find(
    (materia) => materia.id === materiaSeleccionadaId
  );

  const cargarMaterias = async () => {
    try {
      setError("");
      const respuesta = await fetch(`${API}/materias`);
      if (!respuesta.ok) throw new Error();
      const datos = await respuesta.json();
      setMaterias(datos);

      if (
        materiaSeleccionadaId !== null &&
        !datos.some((materia) => materia.id === materiaSeleccionadaId)
      ) {
        setMateriaSeleccionadaId(null);
        setActividades([]);
      }
    } catch (err) {
      console.error(err);
      setError("Error de sincronización con la base de datos.");
    } finally {
      setCargando(false);
    }
  };

  const cargarActividades = async (materiaId) => {
    try {
      setCargandoActividades(true);
      setError("");
      const respuesta = await fetch(`${API}/materias/${materiaId}/actividades`);
      if (!respuesta.ok) throw new Error();
      const datos = await respuesta.json();
      setActividades(datos);
    } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los registros de actividades.");
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

  const obtenerFechaHoyFormateada = () => {
    return new Date().toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "America/Argentina/Cordoba",
    });
  };

  const abrirBitacora = async (materia) => {
    setMateriaBitacora(materia);
    setMensajeNotas("Cargando bitácora...");
    try {
      const res = await fetch(`${API}/materias/${materia.id}/notas`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      let contenido = data.notas || "";

      const fechaHoy = obtenerFechaHoyFormateada();
      const separadorHoy = `--- [ ${fechaHoy} ] ---`;

      if (contenido.trim() && !contenido.includes(separadorHoy)) {
        contenido = `${contenido.trimEnd()}\n\n${separadorHoy}\n\n`;
      } else if (!contenido.trim()) {
        contenido = `${separadorHoy}\n\n`;
      }

      setTextoMarkdown(contenido);
      setMensajeNotas("");
    } catch (err) {
      console.error(err);
      setMensajeNotas("Error al cargar notas previas.");
    }
  };

  const insertarEntradaHoy = () => {
    const fechaHoy = obtenerFechaHoyFormateada();
    const separadorHoy = `--- [ ${fechaHoy} ] ---`;
    if (textoMarkdown.includes(separadorHoy)) {
      setMensajeNotas("FECHA YA PRESENTE");
      setTimeout(() => setMensajeNotas(""), 1500);
      return;
    }
    setTextoMarkdown((prev) => `${prev.trimEnd()}\n\n${separadorHoy}\n\n`);
  };

  const guardarBitacora = async () => {
    if (!materiaBitacora) return;
    try {
      setGuardandoNotas(true);
      setMensajeNotas("Guardando...");
      const res = await fetch(`${API}/materias/${materiaBitacora.id}/notas`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notas: textoMarkdown }),
      });
      if (!res.ok) throw new Error();
      setMensajeNotas("SINCRONIZADO OK");
      setTimeout(() => setMensajeNotas(""), 2000);
    } catch (err) {
      console.error(err);
      setMensajeNotas("Error al guardar bitácora.");
    } finally {
      setGuardandoNotas(false);
    }
  };

  const limpiarFormularioMateria = () => {
    setNombre("");
    setProfesor("");
    setEstado("Cursando");
    setMateriaEditandoId(null);
    setPasoFormulario(1);
    setMostrarFormulario(false);
  };

  const guardarMateria = async (evento) => {
    if (evento) evento.preventDefault();
    if (!nombre.trim() || !profesor.trim() || !estado) {
      setError("Completa nombre, cátedra y estado.");
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
        respuesta = await fetch(`${API}/materias/${materiaEditandoId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(datosMateria),
        });
      } else {
        respuesta = await fetch(`${API}/materias`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(datosMateria),
        });
      }

      if (!respuesta.ok) throw new Error();

      limpiarFormularioMateria();
      await cargarMaterias();
    } catch (err) {
      console.error(err);
      setError("Fallo al registrar la materia.");
    } finally {
      setGuardandoMateria(false);
    }
  };

  const comenzarEdicionMateria = (materia) => {
    setMateriaEditandoId(materia.id);
    setNombre(materia.nombre);
    setProfesor(materia.profesor || "");
    setEstado(materia.estado);
    setPasoFormulario(3);
    setMostrarFormulario(true);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const solicitarEliminarMateria = (materia) => {
    setConfirmacion({
      tipo: "materia",
      id: materia.id,
      titulo: "Purgar materia",
      mensaje: `¿Deseas purgar permanentemente "${materia.nombre}" y todos sus hitos asociados?`,
    });
  };

  const eliminarMateria = async (id) => {
    try {
      setError("");
      const respuesta = await fetch(`${API}/materias/${id}`, {
        method: "DELETE",
      });
      if (!respuesta.ok) throw new Error();

      if (materiaSeleccionadaId === id) {
        setMateriaSeleccionadaId(null);
        setActividades([]);
      }
      if (materiaBitacora?.id === id) {
        setMateriaBitacora(null);
      }
      if (materiaEditandoId === id) {
        limpiarFormularioMateria();
      }
      await cargarMaterias();
    } catch (err) {
      console.error(err);
      setError("No se pudo purgar la materia.");
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
      setError("Selecciona una materia primero.");
      return;
    }
    if (!tituloActividad.trim() || !fechaActividad) {
      setError("Indica el título de la actividad y su fecha límite.");
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
            ? actividades.find((a) => a.id === actividadEditandoId)?.completada ?? false
            : false,
        materia_id: materiaSeleccionadaId,
      };

      let respuesta;
      if (actividadEditandoId !== null) {
        respuesta = await fetch(`${API}/actividades/${actividadEditandoId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(datosActividad),
        });
      } else {
        respuesta = await fetch(`${API}/actividades`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(datosActividad),
        });
      }

      if (!respuesta.ok) throw new Error();

      limpiarFormularioActividad();
      await cargarActividades(materiaSeleccionadaId);
    } catch (err) {
      console.error(err);
      setError("Error al registrar la actividad.");
    } finally {
      setGuardandoActividad(false);
    }
  };

  const comenzarEdicionActividad = (actividad) => {
    setActividadEditandoId(actividad.id);
    setTituloActividad(actividad.titulo);
    setDescripcionActividad(actividad.descripcion || "");
    setFechaActividad(
      actividad.fecha_entrega ? actividad.fecha_entrega.substring(0, 10) : ""
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
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ completada: !actividad.completada }),
        }
      );
      if (!respuesta.ok) throw new Error();
      await cargarActividades(materiaSeleccionadaId);
    } catch (err) {
      console.error(err);
      setError("No se pudo actualizar el estado.");
    }
  };

  const solicitarEliminarActividad = (actividad) => {
    setConfirmacion({
      tipo: "actividad",
      id: actividad.id,
      titulo: "Eliminar actividad",
      mensaje: `¿Deseas remover la actividad "${actividad.titulo}"?`,
    });
  };

  const eliminarActividad = async (id) => {
    try {
      setError("");
      const respuesta = await fetch(`${API}/actividades/${id}`, {
        method: "DELETE",
      });
      if (!respuesta.ok) throw new Error();

      if (actividadEditandoId === id) {
        limpiarFormularioActividad();
      }
      await cargarActividades(materiaSeleccionadaId);
    } catch (err) {
      console.error(err);
      setError("No se pudo eliminar la actividad.");
    }
  };

  const confirmarEliminacion = async () => {
    if (!confirmacion) return;
    const { tipo, id } = confirmacion;
    setConfirmacion(null);

    if (tipo === "materia") await eliminarMateria(id);
    if (tipo === "actividad") await eliminarActividad(id);
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "SIN PLAZO";
    return new Date(fecha).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  const renderSimpleMarkdown = (md) => {
    if (!md.trim()) return <p className="text-dim">// BITÁCORA VACÍA</p>;
    return md.split("\n").map((line, i) => {
      if (line.startsWith("--- [ ") && line.endsWith(" ] ---")) {
        const fecha = line.replace("--- [ ", "").replace(" ] ---", "");
        return (
          <div key={i} className="md-date-divider font-mono">
            <span className="divider-line"></span>
            <span className="divider-stamp">JORNADA // {fecha}</span>
            <span className="divider-line"></span>
          </div>
        );
      }
      if (line.startsWith("### ")) return <h5 key={i} className="md-h3">{line.replace("### ", "")}</h5>;
      if (line.startsWith("## ")) return <h4 key={i} className="md-h2">{line.replace("## ", "")}</h4>;
      if (line.startsWith("# ")) return <h3 key={i} className="md-h1">{line.replace("# ", "")}</h3>;
      if (line.startsWith("- [x] ")) return <div key={i} className="md-todo done">✓ {line.replace("- [x] ", "")}</div>;
      if (line.startsWith("- [ ] ")) return <div key={i} className="md-todo">☐ {line.replace("- [ ] ", "")}</div>;
      if (line.startsWith("- ") || line.startsWith("* ")) return <li key={i} className="md-bullet">{line.replace(/^[-*]\s/, "")}</li>;
      if (line.startsWith("```")) return <pre key={i} className="md-codeblock">{line.replace(/```/g, "")}</pre>;
      if (!line.trim()) return <br key={i} />;
      return <p key={i} className="md-p">{line}</p>;
    });
  };

  const actividadesCompletadas = actividades.filter((a) => a.completada).length;

  return (
    <main className="terminal-app">
      {/* HEADER */}
      <header className="terminal-header">
        <div>
          <span className="terminal-tag font-mono">// ARCHIVO ACADÉMICO REG-2026</span>
          <h1 className="terminal-title font-display">
            Materias<span className="dot-neon">.</span>
          </h1>
        </div>
        <div className="terminal-counter font-mono">
          <span className="status-live"></span>
          <span>CURSADAS ACTIVAS: {String(materias.length).padStart(2, "0")}</span>
        </div>
      </header>

      {error && <div className="terminal-alert font-mono">{error}</div>}

      {/* DISPARADOR MINIMALISTA / FORMULARIO PROGRESIVO */}
      <section className="terminal-action-dock">
        {!mostrarFormulario ? (
          <button
            type="button"
            className="btn-trigger font-mono"
            onClick={() => {
              limpiarFormularioMateria();
              setMostrarFormulario(true);
            }}
          >
            <span className="trigger-icon">+</span>
            <span className="trigger-text">REGISTRAR NUEVA MATERIA</span>
          </button>
        ) : (
          <div className="progressive-form-box">
            <div className="progressive-topline font-mono">
              <span>{materiaEditandoId !== null ? "[ EDITANDO REGISTRO ]" : "[ NUEVA ENTRADA ]"}</span>
              <button
                type="button"
                className="btn-link"
                onClick={() => {
                  limpiarFormularioMateria();
                  setError("");
                }}
              >
                [ CERRAR ✕ ]
              </button>
            </div>

            <form onSubmit={guardarMateria} className="prose-form font-display">
              {/* PASO 1: NOMBRE */}
              <span className="fade-item">
                <span>Inscribir </span>
                <span className="prose-wrapper">
                  <input
                    type="text"
                    autoFocus
                    placeholder="Nombre de materia..."
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && nombre.trim() && pasoFormulario === 1) {
                        e.preventDefault();
                        setPasoFormulario(2);
                      }
                    }}
                    className="prose-input"
                  />
                </span>
              </span>

              {/* PASO 2: PROFESOR */}
              {(pasoFormulario >= 2 || materiaEditandoId !== null) && (
                <span className="fade-item">
                  <span> a cargo de </span>
                  <span className="prose-wrapper">
                    <input
                      type="text"
                      autoFocus={pasoFormulario === 2}
                      placeholder="Profesor / Cátedra..."
                      value={profesor}
                      onChange={(e) => setProfesor(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && profesor.trim() && pasoFormulario === 2) {
                          e.preventDefault();
                          setPasoFormulario(3);
                        }
                      }}
                      className="prose-input"
                    />
                  </span>
                </span>
              )}

              {/* PASO 3: ESTADO */}
              {(pasoFormulario >= 3 || materiaEditandoId !== null) && (
                <span className="fade-item">
                  <span> en estado </span>
                  <span className="prose-wrapper">
                    <select
                      value={estado}
                      onChange={(e) => setEstado(e.target.value)}
                      className="prose-select font-mono"
                    >
                      <option value="Cursando">Cursando</option>
                      <option value="Pendiente">Pendiente</option>
                      <option value="Aprobada">Aprobada</option>
                    </select>
                  </span>
                  <span>.</span>
                </span>
              )}

              <div className="prose-actions font-mono">
                {pasoFormulario < 3 && materiaEditandoId === null ? (
                  <button
                    type="button"
                    className="btn-brutal-solid"
                    disabled={pasoFormulario === 1 ? !nombre.trim() : !profesor.trim()}
                    onClick={() => setPasoFormulario((prev) => prev + 1)}
                  >
                    <span>CONTINUAR</span>
                    <span>→</span>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={guardandoMateria}
                    className="btn-brutal-solid"
                  >
                    <span>{guardandoMateria ? "GUARDANDO..." : materiaEditandoId !== null ? "ACTUALIZAR" : "CONFIRMAR REGISTRO"}</span>
                    <span>→</span>
                  </button>
                )}

                <button
                  type="button"
                  className="btn-brutal-outline"
                  onClick={() => {
                    limpiarFormularioMateria();
                    setError("");
                  }}
                >
                  CANCELAR
                </button>
              </div>
            </form>
          </div>
        )}
      </section>

      {/* ÍNDICE GENERAL */}
      <section className="terminal-index-block">
        <div className="index-topline font-mono">
          <span>01 // ÍNDICE GENERAL</span>
          <span>OPERACIONES</span>
        </div>

        {cargando && <p className="font-mono text-dim">RECUPERANDO REGISTROS...</p>}

        {!cargando && materias.length === 0 && (
          <div className="terminal-empty font-mono">NO HAY MATERIAS CARGADAS AÚN</div>
        )}

        <div className="index-list">
          {materias.map((materia, index) => {
            const seleccionada = materia.id === materiaSeleccionadaId;
            const idx = String(index + 1).padStart(2, "0");

            return (
              <div
                key={materia.id}
                className={`index-item ${seleccionada ? "item-selected" : ""}`}
              >
                <div
                  className="item-click-area"
                  onClick={() => seleccionarMateria(materia.id)}
                  role="button"
                  tabIndex={0}
                >
                  <span className="item-num font-mono">{idx}</span>
                  <div>
                    <h3 className="item-title font-display">{materia.nombre}</h3>
                    <div className="item-details font-mono">
                      <span>CÁTEDRA: {materia.profesor}</span>
                      <span className="sep">•</span>
                      <span className="item-status">[ {materia.estado} ]</span>
                    </div>
                  </div>
                </div>

                <div className="item-ops font-mono">
                  <button
                    type="button"
                    className="btn-link glow"
                    onClick={() => abrirBitacora(materia)}
                  >
                    [ BITÁCORA MD ]
                  </button>
                  <button
                    type="button"
                    className="btn-link"
                    onClick={() => comenzarEdicionMateria(materia)}
                  >
                    [ EDITAR ]
                  </button>
                  <button
                    type="button"
                    className="btn-link danger"
                    onClick={() => solicitarEliminarMateria(materia)}
                  >
                    [ PURGAR ]
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ACTIVIDADES */}
      {materiaSeleccionada && (
        <section className="activities-panel">
          <div className="activities-header">
            <div>
              <span className="terminal-tag font-mono">// HOJA DE CURSADA</span>
              <h2 className="activities-title font-display">{materiaSeleccionada.nombre}</h2>
              <div className="activities-stats font-mono">
                COMPLETADAS: <strong className="neon-text">{actividadesCompletadas}</strong> / {actividades.length}
              </div>
            </div>

            <button
              type="button"
              className="btn-brutal-outline font-mono"
              onClick={() => setMateriaSeleccionadaId(null)}
            >
              CERRAR [ESC]
            </button>
          </div>

          <form onSubmit={guardarActividad} className="activities-form font-mono">
            <div className="field-group">
              <label htmlFor="act-titulo">ACTIVIDAD / ENTREGA</label>
              <input
                id="act-titulo"
                type="text"
                placeholder="Ej: Entrega TP N° 1"
                value={tituloActividad}
                onChange={(e) => setTituloActividad(e.target.value)}
                className="clean-input"
              />
            </div>

            <div className="field-group">
              <label htmlFor="act-fecha">FECHA LÍMITE</label>
              <input
                id="act-fecha"
                type="date"
                value={fechaActividad}
                onChange={(e) => setFechaActividad(e.target.value)}
                className="clean-input date-input"
              />
            </div>

            <div className="field-group">
              <label htmlFor="act-desc">NOTAS / CONSIGNAS</label>
              <input
                id="act-desc"
                type="text"
                placeholder="Opcional..."
                value={descripcionActividad}
                onChange={(e) => setDescripcionActividad(e.target.value)}
                className="clean-input"
              />
            </div>

            <div className="form-submit-row">
              <button
                type="submit"
                disabled={guardandoActividad}
                className="btn-brutal-solid"
              >
                <span>{guardandoActividad ? "..." : actividadEditandoId !== null ? "ACTUALIZAR" : "+ REGISTRAR"}</span>
              </button>

              {actividadEditandoId !== null && (
                <button
                  type="button"
                  className="btn-brutal-outline"
                  onClick={limpiarFormularioActividad}
                >
                  CANCELAR
                </button>
              )}
            </div>
          </form>

          <div className="activities-list">
            {cargandoActividades && (
              <p className="font-mono text-dim">RECUPERANDO ACTIVIDADES...</p>
            )}

            {!cargandoActividades && actividades.length === 0 && (
              <div className="terminal-empty font-mono">
                NO HAY ACTIVIDADES REGISTRADAS EN ESTA MATERIA
              </div>
            )}

            {actividades.map((actividad) => (
              <div
                key={actividad.id}
                className={`activity-row ${actividad.completada ? "act-done" : ""}`}
              >
                <button
                  type="button"
                  className="box-check font-mono"
                  onClick={() => cambiarCompletada(actividad)}
                  title="Marcar estado"
                >
                  {actividad.completada ? "X" : ""}
                </button>

                <div className="act-data">
                  <div className="act-line">
                    <span className="act-name font-mono">{actividad.titulo}</span>
                    <span className="act-date font-mono">
                      [ {formatearFecha(actividad.fecha_entrega)} ]
                    </span>
                  </div>
                  {actividad.descripcion && (
                    <p className="act-desc font-mono">{actividad.descripcion}</p>
                  )}
                </div>

                <div className="item-ops font-mono">
                  <button
                    type="button"
                    className="btn-link"
                    onClick={() => comenzarEdicionActividad(actividad)}
                  >
                    [ EDITAR ]
                  </button>
                  <button
                    type="button"
                    className="btn-link danger"
                    onClick={() => solicitarEliminarActividad(actividad)}
                  >
                    [ PURGAR ]
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* LIBRETA A5 BITÁCORA CENTRALIZADA */}
      {materiaBitacora && (
        <aside className="drawer-overlay" onClick={() => setMateriaBitacora(null)}>
          <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <div>
                <span className="terminal-tag font-mono">// LIBRETA A5 .MD</span>
                <h3 className="drawer-title font-display">{materiaBitacora.nombre}</h3>
              </div>
              <button
                type="button"
                className="btn-link"
                onClick={() => setMateriaBitacora(null)}
              >
                [ CERRAR ✕ ]
              </button>
            </div>

            <div className="drawer-toolbar font-mono">
              <div className="tab-group">
                <button
                  type="button"
                  className={`tab-btn ${vistaMarkdown === "edit" ? "active" : ""}`}
                  onClick={() => setVistaMarkdown("edit")}
                >
                  EDITAR (.MD)
                </button>
                <button
                  type="button"
                  className={`tab-btn ${vistaMarkdown === "preview" ? "active" : ""}`}
                  onClick={() => setVistaMarkdown("preview")}
                >
                  PREVISUALIZAR
                </button>
                <button
                  type="button"
                  className="tab-btn date-stamp-btn"
                  onClick={insertarEntradaHoy}
                  title="Estampar la jornada de hoy"
                >
                  + JORNADA DE HOY
                </button>
              </div>

              <div className="drawer-status">
                {mensajeNotas && <span className="status-badge font-mono">{mensajeNotas}</span>}
                <button
                  type="button"
                  className="btn-brutal-solid"
                  onClick={guardarBitacora}
                  disabled={guardandoNotas}
                >
                  {guardandoNotas ? "GUARDANDO..." : "GUARDAR [CTRL+S]"}
                </button>
              </div>
            </div>

            <div className="drawer-body">
              {vistaMarkdown === "edit" ? (
                <textarea
                  className="md-editor font-mono"
                  placeholder="Escribe tus notas aquí..."
                  value={textoMarkdown}
                  onChange={(e) => setTextoMarkdown(e.target.value)}
                  onKeyDown={(e) => {
                    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
                      e.preventDefault();
                      guardarBitacora();
                    }
                  }}
                />
              ) : (
                <div className="md-preview font-mono">
                  {renderSimpleMarkdown(textoMarkdown)}
                </div>
              )}
            </div>
          </div>
        </aside>
      )}

      {/* MODAL DEPURACIÓN */}
      {confirmacion && (
        <div className="modal-backdrop" onClick={() => setConfirmacion(null)}>
          <div className="modal-box font-mono" onClick={(e) => e.stopPropagation()}>
            <span className="danger-tag">// ACCIÓN DESTRUCTIVA</span>
            <h2 className="modal-title font-display">{confirmacion.titulo}</h2>
            <p className="modal-text">{confirmacion.mensaje}</p>

            <div className="modal-btns">
              <button
                type="button"
                className="btn-brutal-outline"
                onClick={() => setConfirmacion(null)}
              >
                CANCELAR
              </button>
              <button
                type="button"
                className="btn-danger-solid"
                onClick={confirmarEliminacion}
              >
                PURGAR DEFINITIVAMENTE
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default App;