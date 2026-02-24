

# Plan: Correcciones QR/PDF, limpieza de compartir, perfil en cotización, banner y menú

## 1. Arreglar QR y generar PDF real

El QR actualmente apunta a `/cotizacion?d=...` que muestra una vista HTML. Se cambiará para que:

- **`/cotizacion`** renderice la cotización con los datos del perfil del vendedor incluidos (nombre, cargo, numero, email) pasados en el payload base64
- Se agregará un botón "Descargar PDF" en la página `/cotizacion` que use la API del navegador `window.print()` con estilos de impresión optimizados (CSS `@media print`) para generar un PDF real
- El QR seguirá apuntando a `/cotizacion?d=...` pero ahora el payload incluirá los datos del perfil del vendedor
- Se ajustará el componente `Cotizacion.tsx` para mostrar el pie con datos del vendedor y el botón de descarga

## 2. Eliminar webhook Zapier y email de QuoteShare

- Se simplificará `QuoteShare.tsx` eliminando todo el bloque de webhook Zapier y el bloque de envío por email
- Solo quedará la sección de QR con el botón de descarga

## 3. Datos del perfil al pie de la cotización (vista /cotizacion)

- Se modificará el payload `quoteData` en `Index.tsx` para incluir los datos del perfil: `nombre`, `cargo`, `numero`, `email_contacto`, `foto_url`
- En `Cotizacion.tsx` se renderizará un pie con estos datos debajo del resumen

## 4. Reducir tamaño del banner

- En `Index.tsx`, se limitará la altura del banner con `max-h-48` o similar y `object-cover` para que no se estire y mantenga calidad

## 5. Menú hamburguesa en Landing Page

- La Landing Page actualmente no tiene el `AppMenu`. Se agregará en la esquina superior izquierda con posición absoluta, igual que en Index
- Perfil ya lo tiene

## Archivos a modificar

| Archivo | Cambio |
|---|---|
| `src/pages/Index.tsx` | Incluir datos de perfil en quoteData, reducir banner |
| `src/pages/Cotizacion.tsx` | Agregar pie con perfil del vendedor, botón descargar PDF, estilos print |
| `src/components/QuoteShare.tsx` | Eliminar webhook y email, dejar solo QR |
| `src/pages/Landing.tsx` | Agregar AppMenu en esquina superior izquierda |

