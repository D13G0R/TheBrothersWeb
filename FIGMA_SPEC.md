# Especificación de Diseño - The Brothers Pizza (Figma)

Este documento sirve como guía para construir el MVP en Figma. Incluye paleta, tipografía, componentes y pantallas.

---

## 1. Sistema de Colores

| Rol | Hex | Uso |
|-----|-----|-----|
| Rojo Principal | `#C0392B` | CTAs, botones de acción, precios, activos |
| Rojo Oscuro | `#A93226` | Hover de botones rojos |
| Fondo Oscuro | `#343A40` | Header, footer, secciones de contraste |
| Blanco | `#FFFFFF` | Fondos de tarjetas, texto sobre oscuro |
| Gris Texto | `#6C757D` | Descripciones, textos secundarios |
| Gris Borde | `#DEE2E6` | Bordes de tarjetas e inputs |
| Fondo Página | `#F8F9FA` | Fondo general del catálogo |
| Sombra | `rgba(0,0,0,0.08)` | Tarjetas elevadas |

---

## 2. Tipografía

- **Títulos y marca:** Montserrat (700, 800)
- **Cuerpo y interfaz:** Poppins (400, 600, 700)
- Tamaños base:
  - H1: 2.75rem (hero)
  - H2: 1.75rem (secciones)
  - H3: 1.15rem (nombres de producto/sede)
  - Cuerpo: 1rem
  - Pequeño: 0.85rem (descripciones, detalles)

---

## 3. Pantallas del MVP (Frames)

### A. Landing / Inicio
- **Header:** Logo a la izquierda, navegación (Inicio, Menú, Sedes, Carrito con contador), botón "Seleccionar Sede", menú hamburguesa móvil.
- **Hero:** Fondo oscuro `#343A40`, badge "Envíos a domicilio", título "Sabor auténtico, entrega rápida", subtítulo, dos CTAs (Ver Menú / Ver Carrito), visual de pizza a la derecha.
- **Sedes:** 3 tarjetas (Bello La Cumbre, Castilla, El Ángel Bello), cada una con nombre, teléfono y botón "Seleccionar" en rojo.
- **Redes:** Link a Instagram (@thebrotherspizza_).

### B. Catálogo de Productos
- Pestañas de categoría: Pizzas, Bebidas, Adicionales.
- Grid de tarjetas de producto (mínimo 240px de ancho):
  - Imagen del producto (200px alto)
  - Badge de categoría opcional
  - Nombre, descripción breve, precio base
  - Botón "Agregar" (fondo oscuro)

### C. Modal de Personalización (Pizza)
Al hacer clic en "Agregar" de una pizza, se abre un modal con:
- Imagen del producto
- Nombre, descripción, precio base
- **Tamaño:** chips (Personal, Mediana, Familiar) — Mediana +$6.000, Familiar +$12.000
- **Tipo de Masa:** chips (Tradicional, Delgada, Queso en la orilla +$4.000)
- **Sabores (máx. 2):** chips seleccionables, indicador visual de selección (relleno vs vacío)
- **Ingredientes Adicionales:** chips con recargo individual
- **Subtotal dinámico** que se actualiza
- Botones: Cancelar / Agregar al Carrito

### D. Carrito de Compras (Drawer lateral)
- Panel derecho que se desliza
- Lista de items con: miniatura, nombre, detalles (tamaño, masa, sabores, extras), precio unitario, controles de cantidad (+/−), eliminar
- Totales: Subtotal y Total
- Botones: Vaciar / Simular Pedido

### E. Panel Administrativo (Conceptual, estático)
- 3 tarjetas de pedido con estados:
  - Pedido #001 — Pendiente (amarillo)
  - Pedido #002 — En preparación (azul)
  - Pedido #003 — Listo / Entregado (verde)
- Cada tarjeta: ID, sede, items, total, badge de estado

### F. Footer
- Logo, contactos de las 3 sedes, link Instagram, nota legal "Prototipo visual navegable".

---

## 4. Componentes Reutilizables (Figma Components)

1. **BtnPrimary** — Fondo `#C0392B`, texto blanco, border-radius 12px, padding 0.6rem 1.25rem
2. **BtnOutline** — Borde `#C0392B`, texto rojo, fondo transparente
3. **OptionChip** — Borde gris, texto gris, estado activo fondo rojo/texto blanco, radius 20px
4. **ProductCard** — Imagen superior, info inferior, borde gris, hover con sombra
5. **CartItem** — Fila con miniatura, nombre, detalles, precio, qty
6. **Badge** — Pill pequeño, estados: Pendiente/Preparando/Listo
7. **Header** — Sticky, con logo, nav, acciones
8. **LocationCard** — Tarjeta de sede con selección

---

## 5. Reglas de Interacción (Prototipado)

- Al seleccionar una sede, se resalta visualmente y se guarda en estado.
- El modal de pizza permite máximo 2 sabores; al intentar un tercero se muestra aviso.
- El subtotal del modal se recalcula al cambiar tamaño, masa o extras.
- Al agregar al carrito, el contador del header se actualiza y el drawer se abre.
- Los totales del carrito se calculan sumando `unitPrice × qty` de cada item.
- "Simular Pedido" muestra un alert con el resumen (no hay backend real).

---

## 6. Información del Negocio (para textos)

- **Sedes y teléfonos:**
  - Bello La Cumbre: 320 500 60 27
  - Castilla: 304 586 0138
  - El Ángel Bello: Por confirmar
- **Instagram:** https://www.instagram.com/thebrotherspizza_/?hl=en
- **Ubicación:** Bello, Antioquia, Colombia

---

## 7. Fuera de Alcance (no incluir en el prototipo)

- Backend, base de datos, pagos reales, login/registro, WhatsApp API, notificaciones, inventario, app nativa.

---

## 8. Criterios de Éxito (validación)

1. Navegación comprensible en <1 minuto.
2. Pizza de dos sabores se entiende sin confusión en el resumen.
3. Colores `#C0392B` y `#343A40` transmiten identidad urbana.
4. Sirve como herramienta comercial para presentar al propietario.
