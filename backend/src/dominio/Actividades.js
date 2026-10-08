// backend/src/dominio/actividades.js

// Regla 1: Validación y sanitización del título de una materia o actividad
function validarTitulo(titulo) {
  if (titulo === null || titulo === undefined) {
    return { valido: false, error: 'El título es obligatorio.' };
  }
  const limpio = titulo.trim();
  if (limpio.length === 0) {
    return { valido: false, error: 'El título no puede estar vacío.' };
  }
  const LARGO_MAXIMO = 60;
  if (limpio.length > LARGO_MAXIMO) {
    return { valido: false, error: `El título supera el máximo de ${LARGO_MAXIMO} caracteres.` };
  }
  return { valido: true, tituloNormalizado: limpio };
}

// Regla 2: Métricas de progreso ("COMPLETADAS: X / Y")
function calcularProgreso(actividades) {
  if (!Array.isArray(actividades) || actividades.length === 0) {
    return { total: 0, completadas: 0, porcentaje: 0, texto: '0 / 0' };
  }
  const completadas = actividades.filter(a => a.completada === true).length;
  const total = actividades.length;
  const porcentaje = Math.round((completadas / total) * 100);

  return {
    total,
    completadas,
    porcentaje,
    texto: `${completadas} / ${total}`
  };
}

// Regla 3: Clasificación temporal / estado de entrega (vencimiento determinista)
function clasificarEstadoActividad(actividad, fechaReferencia = new Date()) {
  if (!actividad) {
    return 'invalida';
  }
  if (actividad.completada) {
    return 'completada';
  }
  if (!actividad.fechaLimite) {
    return 'sin-fecha';
  }

  // Normalizamos a string YYYY-MM-DD para evitar desfases de huso horario (UTC vs local)
  const formatearFecha = (d) => {
    const date = new Date(d);
    const anio = date.getUTCFullYear();
    const mes = String(date.getUTCMonth() + 1).padStart(2, '0');
    const dia = String(date.getUTCDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  };

  const limiteStr = actividad.fechaLimite.includes('T')
    ? formatearFecha(actividad.fechaLimite)
    : actividad.fechaLimite;

  const hoyStr = fechaReferencia instanceof Date
    ? fechaReferencia.toISOString().slice(0, 10)
    : String(fechaReferencia).slice(0, 10);

  if (limiteStr < hoyStr) {
    return 'vencida';
  }
  if (limiteStr === hoyStr) {
    return 'vence-hoy';
  }
  return 'al-dia';
}


// Regla 4: Servicio de Purgado con inyección de dependencia (para Mock)
function purgarActividad(idActividad, notificadorAudit) {
  if (!idActividad) {
    throw new Error('ID de actividad inválido para purgar');
  }

  // La acción de purgado se efectúa y delega la auditoría al colaborador externo
  if (notificadorAudit && typeof notificadorAudit.registrar === 'function') {
    notificadorAudit.registrar({
      accion: 'PURGA_ACTIVIDAD',
      id: idActividad,
      timestamp: new Date().toISOString()
    });
  }

  return { purgada: true, id: idActividad };
}

module.exports = {
  validarTitulo,
  calcularProgreso,
  clasificarEstadoActividad,
  purgarActividad
};