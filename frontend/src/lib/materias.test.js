// frontend/src/lib/materias.test.js
import { describe, it, expect, vi } from 'vitest';
import {
  formatearContadorCursadas,
  filtrarMateriasPorEstado,
  obtenerCursadasActivas
} from './materias.js';

describe('Suite Frontend: Lógica de Materias y Cursadas', () => {

  // Test 1: PARAMETRIZADO (it.each)
  it.each([
    [1, 'CURSADAS ACTIVAS: 01'],
    [3, 'CURSADAS ACTIVAS: 03'],
    [12, 'CURSADAS ACTIVAS: 12'],
    [-5, 'CURSADAS ACTIVAS: 00'],
    [null, 'CURSADAS ACTIVAS: 00'],
  ])('formatea correctamente el contador para el valor %s', (entrada, esperado) => {
    // Arrange & Act
    const resultado = formatearContadorCursadas(entrada);

    // Assert
    expect(resultado).toBe(esperado);
  });

  // Test 2: CASO DE ERROR
  it('lanza un error explícito si la lista de materias pasada a filtrar no es un arreglo', () => {
    // Arrange
    const entradaInvalida = 'no-es-un-arreglo';

    // Act & Assert
    expect(() => filtrarMateriasPorEstado(entradaInvalida, 'Cursando')).toThrow(
      'La lista de materias debe ser un arreglo válido'
    );
  });

  // Test 3: LÓGICA DE FILTRADO ESTÁNDAR
  it('filtra correctamente las materias que coinciden con el estado solicitado sin distinción de mayúsculas', () => {
    // Arrange
    const materias = [
      { id: 1, nombre: 'Ingeniería de Software 3', estado: 'Cursando' },
      { id: 2, nombre: 'Redes Teleinformáticas 2', estado: 'Aprobada' },
      { id: 3, nombre: 'OAE', estado: 'cursando' },
    ];

    // Act
    const resultado = filtrarMateriasPorEstado(materias, 'cursando');

    // Assert
    expect(resultado).toHaveLength(2);
    expect(resultado.map((m) => m.nombre)).toEqual([
      'Ingeniería de Software 3',
      'OAE',
    ]);
  });

  // Test 4: MOCK OBLIGATORIO (vi.fn() verificando interacción)
  it('consulta la ruta correcta de la API y filtra las cursadas usando un cliente mockeado', async () => {
    // Arrange: creamos el mock del fetch con vi.fn()
    const clienteMock = vi.fn().mockResolvedValue({
      json: async () => [
        { id: 1, nombre: 'Ingeniería de Software 3', estado: 'Cursando' },
        { id: 2, nombre: 'OAE', estado: 'Finalizada' },
      ],
    });

    // Act
    const resultado = await obtenerCursadasActivas(clienteMock);

    // Assert: Verificamos interacción con el doble y el resultado
    expect(clienteMock).toHaveBeenCalledTimes(1);
    expect(clienteMock).toHaveBeenCalledWith('/api/materias?estado=cursando');
    expect(resultado).toHaveLength(1);
    expect(resultado[0].nombre).toBe('Ingeniería de Software 3');
  });
});