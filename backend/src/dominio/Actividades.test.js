// backend/src/dominio/Actividades.test.js
const {
  validarTitulo,
  calcularProgreso,
  clasificarEstadoActividad,
  purgarActividad
} = require('./Actividades');

describe('Suite de Dominio: Materias y Actividades', () => {

  // ----------------------------------------------------
  // REGLA 1: Validación y sanitización de títulos
  // ----------------------------------------------------

  // Test 1: Caso parametrizado
  it.each([
    ['cadena vacía', ''],
    ['solo espacios', '    '],
    ['tabulaciones', '\t\t'],
    ['nulo', null],
    ['indefinido', undefined]
  ])('Regla 1 - Rechaza título inválido: %s', (_caso, entrada) => {
    // Arrange & Act
    const resultado = validarTitulo(entrada);

    // Assert
    expect(resultado.valido).toBe(false);
  });

  // Test 2: Caso de error (supera largo máximo)
  it('Regla 1 - Rechaza títulos que superan el límite de 60 caracteres informando el error', () => {
    // Arrange
    const tituloExcesivo = 'A'.repeat(61);

    // Act
    const resultado = validarTitulo(tituloExcesivo);

    // Assert
    expect(resultado.valido).toBe(false);
    expect(resultado.error).toContain('60');
  });

  // Test 3: Caso feliz con normalización (trim)
  it('Regla 1 - Acepta título válido y elimina espacios periféricos innecesarios', () => {
    // Arrange
    const entrada = '   Ingeniería de Software 3   ';

    // Act
    const resultado = validarTitulo(entrada);

    // Assert
    expect(resultado.valido).toBe(true);
    expect(resultado.tituloNormalizado).toBe('Ingeniería de Software 3');
  });

  // ----------------------------------------------------
  // REGLA 2: Métricas y progreso ("COMPLETADAS: X / Y")
  // ----------------------------------------------------

  // Test 4: Caso borde lista vacía (evita división por cero / NaN)
  it('Regla 2 - Retorna 0% y texto seguro si no hay actividades registradas', () => {
    // Arrange
    const actividades = [];

    // Act
    const resumen = calcularProgreso(actividades);

    // Assert
    expect(resumen.total).toBe(0);
    expect(resumen.porcentaje).toBe(0);
    expect(resumen.texto).toBe('0 / 0');
  });

  // Test 5: Cálculo estándar de progreso completado
  it('Regla 2 - Calcula correctamente el avance cuando todas están completadas', () => {
    // Arrange
    const actividades = [
      { id: 1, completada: true },
      { id: 2, completada: true }
    ];

    // Act
    const resumen = calcularProgreso(actividades);

    // Assert
    expect(resumen.total).toBe(2);
    expect(resumen.completadas).toBe(2);
    expect(resumen.porcentaje).toBe(100);
    expect(resumen.texto).toBe('2 / 2');
  });

  // ----------------------------------------------------
  // REGLA 3: Clasificación temporal de vencimiento
  // ----------------------------------------------------

  // Test 6: Clasificación de actividad vencida respecto a fecha de corte
  it('Regla 3 - Clasifica como vencida una actividad incompleta con fecha previa a hoy', () => {
    // Arrange
    const fechaHoy = new Date('2026-10-07T12:00:00Z');
    const actividad = {
      completada: false,
      fechaLimite: '2026-10-01'
    };

    // Act
    const estado = clasificarEstadoActividad(actividad, fechaHoy);

    // Assert
    expect(estado).toBe('vencida');
  });

  // Test 7: Clasificación de actividad con entrega en el día
  it('Regla 3 - Clasifica como vence-hoy si la fecha límite coincide con la fecha evaluada', () => {
    // Arrange
    const fechaHoy = new Date('2026-10-07T08:00:00Z');
    const actividad = {
      completada: false,
      fechaLimite: '2026-10-07'
    };

    // Act
    const estado = clasificarEstadoActividad(actividad, fechaHoy);

    // Assert
    expect(estado).toBe('vence-hoy');
  });

  // ----------------------------------------------------
  // REGLA 4: Purgado con Notificador de Auditoría (MOCK)
  // ----------------------------------------------------

  // Test 8: Mock obligatorio verificando interacción
  it('Regla 4 - Al purgar una actividad, interactúa exactamente una vez con el servicio auditor', () => {
    // Arrange: creamos el mock con jest.fn()
    const auditorMock = {
      registrar: jest.fn()
    };
    const idParaPurgar = 105;

    // Act
    const resultado = purgarActividad(idParaPurgar, auditorMock);

    // Assert: Verificamos comportamiento y la interacción con el doble
    expect(resultado.purgada).toBe(true);
    expect(auditorMock.registrar).toHaveBeenCalledTimes(1);
    expect(auditorMock.registrar).toHaveBeenCalledWith(
      expect.objectContaining({
        accion: 'PURGA_ACTIVIDAD',
        id: 105
      })
    );
  });
});