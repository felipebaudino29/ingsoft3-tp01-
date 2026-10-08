// frontend/src/lib/materias.test.js
import { describe, it, expect, vi } from 'vitest';
import {
  formatearContadorCursadas,
  filtrarMateriasPorEstado,
  obtenerCursadasActivas,
  calcularPrioridadMateria
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
    // Arrange: creación del mock con vi.fn()
    const clienteMock = vi.fn().mockResolvedValue({
      json: async () => [
        { id: 1, nombre: 'Ingeniería de Software 3', estado: 'Cursando' },
        { id: 2, nombre: 'OAE', estado: 'Finalizada' },
      ],
    });

    // Act
    const resultado = await obtenerCursadasActivas(clienteMock);

    // Assert: Verificación de interacción y resultado
    expect(clienteMock).toHaveBeenCalledTimes(1);
    expect(clienteMock).toHaveBeenCalledWith('/api/materias?estado=cursando');
    expect(resultado).toHaveLength(1);
    expect(resultado[0].nombre).toBe('Ingeniería de Software 3');
  });

  // Cobertura completa de ramas para recuperar el umbral del Quality Gate
  describe('calcularPrioridadMateria', () => {
    it('retorna sin-datos si no se proporciona materia o no tiene nombre', () => {
      // Arrange & Act & Assert
      expect(calcularPrioridadMateria(null, 5)).toBe('sin-datos');
      expect(calcularPrioridadMateria({}, 5)).toBe('sin-datos');
    });

    it('retorna desconocida si los días restantes no son un número', () => {
      // Arrange & Act & Assert
      expect(calcularPrioridadMateria({ nombre: 'IS3' }, '5')).toBe('desconocida');
    });

    it('retorna urgente cuando restan 2 días o menos', () => {
      // Arrange & Act & Assert
      expect(calcularPrioridadMateria({ nombre: 'IS3' }, 2)).toBe('urgente');
      expect(calcularPrioridadMateria({ nombre: 'IS3' }, 0)).toBe('urgente');
    });

    it('retorna alta cuando restan entre 3 y 7 días', () => {
      // Arrange & Act & Assert
      expect(calcularPrioridadMateria({ nombre: 'IS3' }, 5)).toBe('alta');
    });

    it('retorna media cuando restan entre 8 y 15 días', () => {
      // Arrange & Act & Assert
      expect(calcularPrioridadMateria({ nombre: 'IS3' }, 10)).toBe('media');
    });

    it('retorna baja cuando restan más de 15 días', () => {
      // Arrange & Act & Assert
      expect(calcularPrioridadMateria({ nombre: 'IS3' }, 20)).toBe('baja');
    });
  });
});