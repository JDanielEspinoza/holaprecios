

## Plan: Agrandar logo Wispro + IXC en la cotización

El logo ya está presente en `Cotizacion.tsx` (línea 105-107) con tamaño `h-10`. El cambio es simple: aumentar el tamaño para que coincida con el estilo del login (`h-18`) y agregar más separación visual.

### Cambio en `src/pages/Cotizacion.tsx`

- Cambiar la clase del logo de `h-10` a `h-16` (un poco menos que login ya que la tarjeta es más compacta)
- Agregar `mb-2` para mayor separación entre el logo y el título
- Mantener la posición actual: arriba del título y arriba de los logos de apps

Esto es un cambio de una sola línea en el archivo.

