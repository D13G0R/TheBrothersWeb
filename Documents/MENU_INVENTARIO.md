# Inventario y Especificaciones - The Brothers Pizza

Fuente: https://thebrotherspizza.com.co/#/ (sitio real de ventas)
Fecha de recopilación: noviembre 2026

---

## 1. Categorías del menú

| Categoría | Descripción |
|-----------|-------------|
| Pizza | Tamaños personalizables con sabores |
| Platos de la nave | Comidas preparadas (burros, lasagna, quesadilla, maicitos, dedos de queso) |
| Cervezas | Cervezas nacionales e importadas |
| Jugos | Jugos naturales en agua y en leche |
| Limonadas | Limonadas |
| Gaseosas | Gaseosas de diversos tamaños y marcas |
| Sodas Saborizadas | Sodas con sabor |
| Cerveza Saborizada | Cerveza con sabor |
| Otros | Agua, bretón, agua saborizada |
| Todo | Vista completa de todos los productos |

---

## 2. Pizzas (tamaños y precios base)

| Tamaño | Porciones | Diámetro | Precio base |
|--------|-----------|----------|-------------|
| Pizza Personal | 4 porciones | 23 cm | $22.000 |
| Pizza Mediana | 6 porciones | 30 cm | $34.000 |
| Pizza Grande | 8 porciones | 35 cm | $42.000 |
| Pizza Extra Grande | 12 porciones | 40 cm | $47.000 |

---

## 3. Sabores de pizza

Todos los tamaños comparten el mismo catálogo de sabores. Algunos sabores tienen recargo.

| Sabor | Recargo |
|-------|---------|
| BARBI POLLO | $0 |
| CARNES | $0 |
| CHAMPI POLLO | $0 |
| HAWAIANA | $0 |
| MEXICANA | $0 |
| NAPOLITANA | $0 |
| PAISA | $0 |
| PEPPERONI | +$3.000 |
| PEPPERONI PIÑA | +$3.000 |
| SÚPER HAWAIANA | $0 |
| SÚPER PEPPERONI | +$3.000 |
| SÚPER POLLO | $0 |
| THE BROTHERS | $0 |
| TOCICHAMPIÑON | $0 |
| VEGETARIANA | $0 |
| SOLO QUESO | $0 |
| JAMON | $0 |

**Total de sabores:** 17

**Sabores con recargo (+$3.000):** PEPPERONI, PEPPERONI PIÑA, SÚPER PEPPERONI

---

## 4. Platos de la nave

| Producto | Precio |
|----------|--------|
| BURROS AL HORNO | $23.000 |
| LASAGNA | $23.000 |
| QUESADILLA | $23.000 |
| MAICITOS | $20.000 |
| DEDITOS DE QUESO | $14.000 |

---

## 5. Cervezas

| Producto | Precio |
|----------|--------|
| CERVAZA AGUILA LIGTH | $4.500 |
| CERVEZA PILSEN | $4.500 |
| CERVEZA AGUILA | $4.500 |
| corona | $8.000 |
| Estela | $8.000 |

---

## 6. Jugos

| Producto | Precio |
|----------|--------|
| JUGOS NATURALES EN AGUA | $7.000 |
| JUGOS NATURALES EN LECHE | $8.000 |

---

## 7. Limonadas

| Producto | Precio |
|----------|--------|
| LIMONADAS | $8.000 |

---

## 8. Gaseosas

| Producto | Precio |
|----------|--------|
| GASEOSA 1.5 | $8.500 |
| COCACOLA MEGA | $13.000 |
| COCA COLA 1.5 | $8.500 |
| Coca cola 350 | $3.000 |
| PREMIO 1.5 | $8.500 |

---

## 9. Sodas Saborizadas

| Producto | Precio |
|----------|--------|
| SODAS SABORIZADAS | $8.000 |

---

## 10. Cerveza Saborizada

| Producto | Precio |
|----------|--------|
| CERVEZA SABORIZADA | $11.000 |

---

## 11. Otros

| Producto | Precio |
|----------|--------|
| BRETAÑA | $3.500 |
| AGUA | $3.000 |
| Agua saborizada | $4.000 |

---

## 12. Funcionalidades detectadas en el sitio real

| Funcionalidad | Descripción |
|---------------|-------------|
| Selector de categoría | Filtro por categoría (Pizza, Cervezas, Jugos, etc.) y "Todo" |
| Modal de personalización de pizza | Al hacer clic en "Agregar" se abre modal con: nombre, precio base, tabla de sabores (con recargo individual), selector de cantidad (+/-), botón "Agregar [precio]" |
| Carrito de compras | Contador en esquina inferior derecha, muestra "Total carrito", botón "Hacer pedido [cantidad]" |
| WhatsApp | Botón flotante con enlace a WhatsApp (api.whatsapp.com) |
| Seguimiento de pedido | Enlace "#/seguimiento-pedido" |
| Logo y navegación | Logo de The Brothers Pizza, enlace a inicio |

---

## 13. Reglas de negocio observadas

1. **Un sabor por pizza:** En el modal se selecciona un solo sabor por pizza (no dos sabores en una misma pizza como se mencionaba en el MVP_SCOPE original).
2. **Recargos por sabor:** Solo 3 sabores tienen recargo (+$3.000): PEPPERONI, PEPPERONI PIÑA, SÚPER PEPPERONI.
3. **Sin ingredientes adicionales visibles:** No hay sección de "extras" o "ingredientes adicionales" en el modal de pizza, solo sabores.
4. **Sin selector de tamaño en el modal:** El tamaño se elige antes (Pizza Personal, Mediana, Grande, Extra Grande son productos separados con precios distintos).
5. **Precio base por tamaño:** Cada tamaño tiene su propio precio base fijo.

---

## 14. Qué hay que agregar al MVP (comparado con el sitio real)

| Elemento | Estado en MVP actual | Estado en sitio real | Acción |
|----------|---------------------|---------------------|--------|
| Sabores de pizza | 4 sabores genéricos | 17 sabores específicos | Actualizar data.js con los 17 sabores reales |
| Recargos por sabor | No implementado | +$3.000 en 3 sabores | Agregar lógica de recargo por sabor |
| Tamaños de pizza | Personal/Mediana/Familiar | Personal/Mediana/Grande/Extra Grande | Actualizar tamaños y precios base |
| Precios en COP | Genéricos | Precios reales ($22.000 - $47.000) | Actualizar precios |
| Platos de la nave | No incluidos | 5 productos ($14.000-$23.000) | Agregar al catálogo |
| Bebidas completas | Básicas | Cervezas, jugos, limonadas, gaseosas, sodas, agua | Agregar todos los productos de bebidas |
| WhatsApp | No incluido | Botón flotante de WhatsApp | Agregar enlace de contacto |
| Seguimiento de pedido | No incluido | Enlace "#/seguimiento-pedido" | Agregar como enlace |
| Dos sabores por pizza | Implementado en MVP | No existe en el sitio real (1 sabor por pizza) | Revisar si se mantiene o se ajusta |
| Ingredientes extras | Implementados | No existen en el sitio real | Revisar si se mantienen o se eliminan |

---

## 15. URLs de imágenes (productos)

Las imágenes de productos se sirven desde: `https://api.thebrotherspizza.com.co/ventas/storage?file=productos/prd-XX.jpg`

Algunos productos usan placeholder blanco: `https://thebrotherspizza.com.co/assets/image/white.png`

---

## 16. Información de contacto

- **WhatsApp:** https://api.whatsapp.com/send?phone=573100000000&text=Hola
- **Seguimiento de pedido:** https://thebrotherspizza.com.co/#/seguimiento-pedido
- **Sitio web:** https://thebrotherspizza.com.co/#/

---

## 17. Resumen de conteo de productos

| Categoría | Cantidad de productos |
|-----------|----------------------|
| Pizzas (tamaños) | 4 |
| Platos de la nave | 5 |
| Cervezas | 5 |
| Jugos | 2 |
| Limonadas | 1 |
| Gaseosas | 5 |
| Sodas Saborizadas | 1 |
| Cerveza Saborizada | 1 |
| Otros | 3 |
| **Total** | **27 productos** |
| **Sabores de pizza** | **17 sabores** |
