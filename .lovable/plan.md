

## Plan: Align CotizacionesAndina with MisCotizaciones

### Current State
- **CotizacionesAndina**: Simple table with search + agent filter. No row click action, no drawer, no pagination, no selection, no export, no archived toggle.
- **MisCotizaciones**: Full-featured with contact drawer, pagination, selection/bulk actions, archived toggle, CSV export.

### Changes (single file: `src/pages/CotizacionesAndina.tsx`)

**1. Row click → Contact drawer**
- Add Sheet (contact detail panel) identical to MisCotizaciones
- Row click opens drawer with 6 fields (Nombre, Empresa, Número, Correo, LinkedIn placeholder, Cotización)
- Each field has "Copiar" button with "✓ Copiado" feedback
- ExternalLink button remains in actions column for opening the quote

**2. Filters — add archived toggle**
- Keep existing search + agent filter
- Add "Activas/Archivadas" toggle button (same as MisCotizaciones)
- Filter list by `archived` field

**3. CSV export**
- Add export button (in a selection bar when items are selected, same pattern as MisCotizaciones)
- Same CSV format: N°, Fecha, Cliente, Empresa, Email, Teléfono, Productos, Total, Total c/Desc., Descuento %, Pago, Enlace

**4. Pagination**
- Add pagination controls (25/50/100 per page)
- Same UI as MisCotizaciones

**5. Selection + bulk actions**
- Add checkboxes column
- Selection bar with: select all, clear, archive bulk, export CSV, delete bulk
- Archive/delete dialogs with reason textarea (same as MisCotizaciones)

**6. Additional state & imports**
- Add: `useCallback`, `Sheet`, `AlertDialog`, `Checkbox`, `Textarea`, `useToast`, `useProfile`
- Add icons: `Copy`, `Check`, `Linkedin`, `Archive`, `ArchiveRestore`, `Download`, `Trash2`, `ChevronLeft`, `ChevronRight`
- New state: `drawerQuote`, `copiedField`, `showArchived`, `currentPage`, `pageSize`, `selectedIds`, `archiveDialog`, `deleteDialog`, `archiveReason`, `deleteReason`, `processingBulk`

**Key difference from MisCotizaciones:**
- CotizacionesAndina fetches ALL quotes (not filtered by user_id) — this stays the same
- CotizacionesAndina keeps its agent filter (MisCotizaciones doesn't have this)
- No CRM column, no WhatsApp/registro actions, no payment confirmation (those are seller-specific features)

### Files modified
- `src/pages/CotizacionesAndina.tsx` — full rewrite to match MisCotizaciones patterns

### NOT modified
- No shared components changed
- No database changes
- No other pages touched

