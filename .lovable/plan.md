

# Plan: Separar Historial en "Mis Cotizaciones" y "Cotizaciones Andina Link"

## Problema Actual

Una sola página `/cotizaciones` mezcla funcionalidad personal con vista global. Las políticas RLS actuales restringen UPDATE solo al propietario, lo cual es correcto para la página personal pero problemático para acciones de equipo.

## Solución Propuesta

### Dos páginas separadas:

| Página | Ruta | Propósito |
|--------|------|-----------|
| **Mis Cotizaciones** | `/mis-cotizaciones` | Historial personal - ver, archivar, marcar pagado, enviar WhatsApp (solo propias) |
| **Cotizaciones Andina Link** | `/cotizaciones-andina` | Vista global de solo lectura - todas las cotizaciones ordenadas por número, sin acciones |

### Cambios de código:

1. **Crear `MisCotizaciones.tsx`**
   - Reutilizar código actual de `Cotizaciones.tsx`
   - Filtrar por `user_id === auth.uid()`
   - Mantener todas las acciones: archivar, marcar pagado, enviar WhatsApp

2. **Crear `CotizacionesAndina.tsx`**
   - Vista de solo lectura de todas las cotizaciones
   - Ordenar por `quote_number` descendente (más reciente primero)
   - Sin botones de acción (solo ver/abrir enlace externo)
   - Mostrar número, fecha, cliente, empresa, agente, total, estado de pago

3. **Actualizar `AppMenu.tsx`**
   - Agregar dos entradas de menú:
     - "Mis Cotizaciones" → `/mis-cotizaciones`
     - "Cotizaciones Andina" → `/cotizaciones-andina`

4. **Actualizar `App.tsx`**
   - Agregar rutas protegidas para ambas páginas

### RLS (sin cambios necesarios)

- La política actual de SELECT `Anyone can view quotes by id` permite la lectura global
- La política de UPDATE sigue restringida al propietario (correcto para "Mis Cotizaciones")
- Agregar política para que agentes vean perfiles de otros (mostrar nombres de agentes)

### Migración SQL

```sql
-- Permitir ver perfiles de todo el equipo
CREATE POLICY "Authenticated users can view all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (true);
```

## Archivos a crear/modificar

| Archivo | Acción |
|---------|--------|
| `src/pages/MisCotizaciones.tsx` | Crear (copia de Cotizaciones con filtro user_id) |
| `src/pages/CotizacionesAndina.tsx` | Crear (vista global read-only) |
| `src/components/AppMenu.tsx` | Modificar (agregar 2 links) |
| `src/App.tsx` | Modificar (agregar 2 rutas) |
| Migración SQL | Política de SELECT en profiles |

