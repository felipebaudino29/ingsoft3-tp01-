// frontend/src/lib/materias.js

// 1. Formateador de contadores ("CURSADAS ACTIVAS: 03")
export function formatearContadorCursadas(cantidad) {
  if (typeof cantidad !== 'number' || cantidad < 0 || isNaN(cantidad)) {
    return 'CURSADAS ACTIVAS: 00';
  }
  const pad = String(cantidad).padStart(2, '0');
  return `CURSADAS ACTIVAS: ${pad}`;
}

// 2. Filtro y ordenamiento de materias según estado
export function filtrarMateriasPorEstado(materias, estadoFiltro) {
  if (!Array.isArray(materias)) {
    throw new Error('La lista de materias debe ser un arreglo válido');
  }
  if (!estadoFiltro) {
    return materias;
  }
  return materias.filter(
    (m) => m && m.estado && m.estado.toLowerCase() === estadoFiltro.toLowerCase()
  );
}

// 3. Cliente de API con inyección de dependencia para MOCK (igual a §3.0 de la guía)
export async function obtenerCursadasActivas(clienteFetch) {
  if (typeof clienteFetch !== 'function') {
    throw new Error('Se requiere un cliente fetch inyectado');
  }
  const respuesta = await clienteFetch('/api/materias?estado=cursando');
  const datos = await respuesta.json();
  return datos.filter((m) => m.estado === 'Cursando');
}

// Agregado al final de frontend/src/lib/materias.js SIN tests:
export function calcularPrioridadMateria(materia, diasRestantes) {
  if (!materia || !materia.nombre) {
    return 'sin-datos';
  }
  if (typeof diasRestantes !== 'number') {
    return 'desconocida';
  }
  if (diasRestantes <= 2) {
    return 'urgente';
  }
  if (diasRestantes <= 7) {
    return 'alta';
  }
  if (diasRestantes <= 15) {
    return 'media';
  }
  return 'baja';
}

// Función para demostración del Quality Gate bloqueado
export function estimarHorasDedicacion(creditos) {
  if (!creditos || creditos <= 0) return 0;
  if (creditos <= 2) return 4;
  if (creditos <= 4) return 8;
  return 12;
}