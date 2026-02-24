

# Plan: Menu de navegacion + Landing Page de Hola! Suite

## Resumen

Se reestructura la navegacion de la app con un menu desplegable en la esquina superior izquierda con 3 opciones (Mi Perfil, Landing Page, Cotizar). Se elimina el boton de perfil actual del Index. Se crea una Landing Page completa siguiendo las especificaciones detalladas.

## Cambios en detalle

### 1. Nuevo componente: `src/components/AppMenu.tsx`
- Menu desplegable (DropdownMenu de Radix) con icono hamburguesa o el logo Hola en la esquina superior izquierda
- 3 opciones: "Mi Perfil" (navega a /perfil), "Landing Page" (navega a /landing), "Cotizar" (navega a /)
- Incluye boton "Salir" para cerrar sesion
- Se reutiliza en Index y Perfil como componente compartido

### 2. Modificar `src/pages/Index.tsx`
- Reemplazar la barra superior actual (user bar con boton perfil + salir) por el componente `AppMenu`
- El menu queda en la esquina superior izquierda, sobre o debajo del banner

### 3. Modificar `src/pages/Perfil.tsx`
- Reemplazar el boton "Volver" y "Cerrar sesion" por el componente `AppMenu`

### 4. Nueva pagina: `src/pages/Landing.tsx`
Landing page completa de una sola pagina con scroll vertical, sin navbar ni footer extenso. Implementada con las 5 secciones especificadas:

**Seccion 1 - Hero** (fondo morado #5B2FBE):
- 2 columnas: izquierda con headline/subtitulo/parrafo, derecha con formulario de captura
- Headline con palabras destacadas en naranja (#FF6B00)
- Formulario con 7 campos (nombre, apellido, email, telefono con selector de pais, razon social, n° empleados como dropdown, sitio web)
- Boton CTA naranja pill "QUIERO UNA DEMOSTRACION GRATIS"
- Al enviar el formulario, los datos se guardan en una nueva tabla `leads` en la base de datos

**Seccion 2 - Problema + 4 Beneficios** (fondo blanco):
- Headline de urgencia centrado
- Grid de 4 tarjetas con fondo morado oscuro (#3D1FA3), iconos, titulo y descripcion
- CTA naranja que ancla al formulario del hero

**Seccion 3 - Funcionalidades** (fondo morado oscuro):
- Grid 2x4 con 8 funcionalidades (Bot, Omnichannel, Archivos, Horario, Filas, Graficos, Tags, CSAT)
- CTA naranja

**Seccion 4 - Prueba Social** (fondo blanco):
- 3 tarjetas de estadisticas (+9 segmentos, +396 empresas, +7M conversaciones)
- 2 testimonios con quotes
- CTA

**Seccion 5 - Cierre** (fondo morado):
- Headline final
- Placeholder para imagen de dashboard
- CTA naranja final
- Logos de credibilidad (Meta Business Partner, IXC Soft)
- Footer minimo

### 5. Migracion de base de datos: tabla `leads`
Nueva tabla para almacenar los datos del formulario de la landing:
- `id` (uuid, PK)
- `nombre` (text)
- `apellido` (text)
- `email` (text)
- `telefono` (text)
- `empresa` (text)
- `num_empleados` (text)
- `sitio_web` (text)
- `created_at` (timestamptz)
- RLS: insert publico (cualquiera puede enviar el formulario), select solo para usuarios autenticados

### 6. Modificar `src/App.tsx`
- Agregar ruta `/landing` con la nueva pagina Landing (publica, sin proteccion de auth)
- Mantener rutas existentes

### 7. Tipografia
- Se importara la fuente Poppins desde Google Fonts en `index.html`
- Se aplicara solo en la Landing Page via clases CSS

## Nota tecnica sobre el archivo .ai
El archivo `logo_wispro_ixc_soft.ai` subido no es compatible con la web. Se necesita una version PNG o JPG para poder usarlo. Por ahora se usaran los logos existentes como placeholder.

