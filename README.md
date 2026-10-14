# 💰 Mis Finanzas

Aplicación web de **finanzas personales** para controlar gastos e ingresos, definir presupuestos mensuales por categoría y seguir metas de ahorro. Todo los datos se guardan localmente en el navegador (`localStorage`); no hay servidor ni cuentas.

Hecha con **React 18 + TypeScript + Vite**, sin dependencias de gráficos (los gráficos son SVG/CSS hechos a mano).

## Funciones

- **Panel**: balance total, ingresos, gastos y ahorro del mes con variación respecto al mes anterior; flujo de caja de los últimos 6 meses; gastos por categoría (donut); últimos movimientos; presupuestos más cargados.
- **Movimientos**: lista completa agrupada por día, con búsqueda, filtro por tipo (ingreso/gasto) y por categoría, y totales del filtro. Clic sobre un movimiento para editarlo.
- **Presupuestos**: límite mensual por categoría de gasto, barras de progreso con avisos (80 % / 100 %) y edición del límite en línea.
- **Metas de ahorro**: objetivos con emoji, fecha límite opcional, cálculo de cuánto ahorrar al mes para llegar a tiempo y aportaciones/retiradas.
- **Nuevo movimiento**: alta/edición con importe, categoría, fecha y nota.
- **Tus datos**: exportar/importar todo en JSON y restablecer datos de ejemplo.
- Navegación por meses, formato de moneda en euros (es-ES) y diseño adaptable a móvil (navegación inferior).

## Puesta en marcha

```bash
npm install
npm run dev      # http://localhost:5173
```

Otros comandos:

```bash
npm run build    # type-check + build de producción en dist/
npm run preview  # sirve la build de producción
```

## Estructura

```
src/
├── App.tsx                  # shell, pestañas y estado del mes seleccionado
├── store.tsx                # estado global (useReducer + localStorage)
├── data.ts                  # categorías y generador de datos de ejemplo
├── types.ts, utils.ts
└── components/
    ├── Dashboard.tsx        # panel con KPIs y gráficos
    ├── Transactions.tsx     # movimientos con filtros
    ├── Budgets.tsx          # presupuestos por categoría
    ├── Goals.tsx            # metas de ahorro
    ├── TransactionModal.tsx # alta/edición de movimientos
    ├── Charts.tsx           # donut y barras (SVG/CSS)
    └── Sidebar.tsx, Header.tsx, TxRow.tsx, Icons.tsx
```
