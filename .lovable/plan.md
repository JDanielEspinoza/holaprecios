

# Plan: QR via DB, formulario destinatario, historial, banner, estilos, validez

## 1. Crear tabla `quotes` en la base de datos

Nueva tabla para guardar cotizaciones con URL corta (UUID):
- `id` (uuid PK), `user_id` (uuid), `client_name`, `client_company`, `client_phone`, `client_email` (todos text, nullable)
- `clients_count` (int), `items` (jsonb), `discount` (int), `total` (numeric), `discounted_total` (numeric), `discount_amount` (numeric), `installation_cost` (numeric)
- `seller_name`, `seller_cargo`, `seller_numero`, `seller_email` (text)
- `created_at` (timestamptz default now())
- RLS: authenticated users can insert/select their own rows; anonymous can select any row by id (for the shared link)

## 2. Corregir QR: guardar en DB y generar URL corta

En `Index.tsx`:
- Al generar la cotizacion, insertar en tabla `quotes` y obtener el UUID
- La URL del QR sera `{origin}/cotizacion?id={uuid}` (corta, funciona con QR)
- Agregar 4 campos opcionales antes de compartir: nombre cliente, empresa, telefono, email

En `Cotizacion.tsx`:
- Leer el parametro `id` de la URL y hacer fetch a la tabla `quotes`
- Renderizar la cotizacion con los datos obtenidos de la DB
- Mantener boton "Descargar PDF" con `window.print()`

## 3. Historial de cotizaciones

Nueva pagina `src/pages/Cotizaciones.tsx`:
- Tabla con todas las cotizaciones del usuario: fecha/hora, destinatario, valor total, plataformas
- Link para abrir cada cotizacion

Agregar "Cotizaciones" al `AppMenu.tsx` y ruta `/cotizaciones` protegida en `App.tsx`.

## 4. Banner mas compacto

Cambiar `max-h-48` a `max-h-32` con `object-cover object-center` en `Index.tsx`.

## 5. Estilizar selector de clientes

Mejorar visualmente la card de "Cantidad de Clientes" con gradiente y mejor espaciado.

## 6. Texto de validez al pie de la cotizacion

En `Cotizacion.tsx`, agregar al final: "Cotizacion valida hasta el 12 de Marzo, mientras dure el evento Andina Link."

## Archivos a crear/modificar

| Archivo | Cambio |
|---|---|
| Nueva migracion SQL | Crear tabla `quotes` con RLS |
| `src/pages/Index.tsx` | Campos destinatario, guardar en DB, URL corta, banner, estilos selector |
| `src/pages/Cotizacion.tsx` | Fetch por ID, texto validez |
| `src/components/QuoteShare.tsx` | Recibir UUID, estado de carga |
| `src/pages/Cotizaciones.tsx` | Nueva pagina historial |
| `src/components/AppMenu.tsx` | Agregar opcion "Cotizaciones" |
| `src/App.tsx` | Agregar ruta `/cotizaciones` |

