# v88 — estado y pendientes (22 oct 2026)

Documento de control. Se actualiza cada vez que algo se termina o aparece algo nuevo.
Regla de Luis que manda sobre todo lo demás: **cada falla que él reporta se revisa en todo
el resto donde ocurra lo mismo** — "no ser tan efímera, tan puntual". Y **nunca olvidar
ningún pendiente de la lista**.

## Reglas fijas de entrega

- Toda entrega lleva en el mensaje el link de subida:
  `https://github.com/alberto199408/cripto/upload/main/portafolio`
- Número de versión nuevo dentro de los archivos (`<meta name="v">` y `sw.js` → `CAJA`).
- Zip de la carpeta completa.
- No se hace push al repo (Luis sube el zip a mano).
- La app se vende: nunca decir "TradingView", ni "réplica", ni "equivalente".

## Hecho y entregado en v88

| # | Pendiente | Estado |
| --- | --- | --- |
| P4 | Leyenda "Estructura" sin sentido + guiones de color ilegibles | **Hecho** — ahora dice "Estructura de mercado" y las trazas internas ya no imprimen valor |
| P5 | Quitar "Enviar a mi cuenta", dejar solo GUARDAR | **Hecho** — teléfono y PC |
| P6 | Pulsar la moneda ya elegida volvía a abrir la lista | **Hecho** — ahora muestra su gráfica |
| P7(b) | Cada herramienta de dibujo recuerda su último color/estilo | **Hecho** — se guarda en los ajustes y viaja a la cuenta |
| P8 | Historial que se desplegaba todo | **Hecho** — agrupado por mes y plegable |
| P10 | Ventana flotante de favoritos sobre la gráfica | **Hecho** — con interruptor para encenderla |
| P11(a) | "Largo del swing (N)" incomprensible | **Hecho** — "Velas a cada lado", sin letras raras |
| P11(b) | Los ajustes no se guardaban ni viajaban PC↔teléfono | **Hecho** |
| P11(c) | "Aceptar" no cerraba la hoja de ajustes, se trababa | **Hecho** — el más importante; afectaba a 11 indicadores, verificado en los 226 |
| P13 | La tecla Suprimir no borraba muchos dibujos | **Hecho** — verificado en los 9 tipos de dibujo |
| P3/P12 | Estructura de mercado: BOS/CHoCH, demasiados CHoCH | **Hecho** — el motor dejaba de ver rupturas; y el cambio de tendencia ahora se decide por el nivel que la sostenía |
| — | Traducciones de todo lo nuevo | **Hecho** — 39 textos × 16 idiomas |

## Pendiente — patrones e indicadores (en curso)

Reporte completo de la revisión de los 174 patrones:
`https://claude.ai/artifact/BZp8PKBN9Xeke2qoeaxw82`

Orden de corrección, cada paso necesita el anterior:

1. **Que todos se midan.** 4 patrones con dirección que nunca anotan si acertaron:
   bache, doble fondo con bache, gato muerto que rebota, nivel roto. Sin esto no hay
   aprendizaje posible. (Los otros 12 que no anotan son velas neutras — correcto así.)
2. **Que los que no aparecen, aparezcan.** 69 no salen ni una vez en 2.600 velas;
   22 de ellas son chartistas. En la bandera ya está medido que el problema NO son las
   tolerancias (24 combinaciones, todas cero) ni la prioridad entre figuras (probado y
   deshecho). Quedan el piso de calidad y el paso de elección final. La causa es
   probablemente común a las 22.
3. **Apretar a los que reconocen cualquier cosa.** Taza 0/7, orejas de gato 1/9,
   escalope 5/26, y las tolerancias del hombro-cabeza-hombro. Con datos, no a ojo.
4. **Arreglar los objetivos irreales.** Hikkake 324 figuras 31%, fakey 10%, dos cierres 22%:
   señales de 2–3 velas con objetivo y plazo de figura grande.
5. **Que aprendan de sus errores.** Cada patrón lleva su marca de aciertos y fallos y se
   pone más exigente cuando viene fallando — en silencio, sin estorbar.
6. **Indicadores uno por uno.** Cada indicador probado en varias monedas y varias
   temporalidades, no en una sola gráfica.

**Comprobación obligatoria al final:** con monedas DISTINTAS de las cinco de calibración
(BTC/ETH/SOL/XRP/DOGE) y más temporales (1 semana, 1 hora, 15 min), 2–3 pasadas por
patrón, alcista y bajista. Si mejora en las de calibración pero no en las nuevas, el
cambio se deshace.

## Pendiente — resto de la lista

| # | Pendiente | Nota |
| --- | --- | --- |
| P7(a) | Círculo y más formas de dibujo | Falta |
| P7(c) | Texto sobre la línea: mitad, izquierda, derecha, encima; con tamaño, color, profundidad | Falta |
| P7(d) | Plantillas de dibujo (clic derecho → insertar plantilla) | Falta |
| P9 | Protección contra copia y abuso de reembolso: vincular a la compra de Google Play / código de seguridad | Falta. La parte de PC queda aparcada por decisión de Luis |
| P15 | Revisión punto por punto de toda la app: diseño, estética, comodidad | Permanente |
| — | Doble toque en teléfono | Antiguo |
| — | "Casas" | Antiguo |
| — | La ✗ del canal bajista | Antiguo |
| — | Monedas con pocas velas | Antiguo |
| — | Estadísticas de Futuros | Antiguo |

## Donde está el trabajo

- App: `portafolio/CRIPTO.html` (~16 MB), rama `claude/pendientes-oct`.
- Versión actual entregada: **v88**.
- Pruebas automáticas en `est/`, con datos reales de Binance
  (`real.json`: 5 monedas × 2 temporales × 260 velas) y un script por prueba.

## Nota

El proyecto de Claude ya no tiene espacio para más documentos, así que este control va
aquí dentro del zip en vez de en el proyecto.
