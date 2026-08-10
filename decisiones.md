# Decisiones y Reflexiones - TP1

## 1. Análisis del conflicto de merge
* **Por qué Git no pudo resolverlo solo:** Ambas ramas modificaron exactamente la misma línea del archivo `README.md` partiendo del mismo commit base, por lo que Git no puede determinar cuál versión debe prevalecer.


* **Cómo evitarlo en un equipo:** Mantener ramas cortas de integración frecuente (GitHub Flow), constante comunicación en el equipo y ejecutar `git pull` o integrar `main` con frecuencia.


## 2. Problemas encontrados y soluciones
* Durante el desarrollo fue necesario revisar la configuración de las reglas de protección de rama para asegurar que el push directo fuera rechazado correctamente sin bloquear la capacidad de mergear el propio PR (configurando 0 aprobaciones obligatorias por ser trabajo individual y desactivando el bypass para administradores).

## 3. Declaración de uso de IA
* Se utilizó IA como soporte a lo largo del seguimiento de la guia para llevar a cabo precisamente los pasos descriptos en el documento. Fue siempre a fin de soporte cuando surgieron dudas especificas en caunto a ciertos puntos de la guia y para corroborar todo fui compartiendo capturas de los comandos, procedimientos y resultados obtenidos.