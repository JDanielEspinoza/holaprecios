

## Plan: Contact Detail Drawer on Row Click (Mis Cotizaciones)

### Summary

Replace the current row-click behavior (opens quote in new tab) with a slide-in drawer from the right showing contact details. The "open quote" action moves to the existing ExternalLink button in the actions column.

### Important Finding

There is **no `client_linkedin` field** in the database or codebase. Two options:

1. Add a `client_linkedin` column to the `quotes` table (requires migration + updating the quote creation form)
2. Show the LinkedIn field in the drawer as a placeholder with "—" for now

I'll go with option 2 (placeholder) since the request says "do not modify the quote creation logic." We can add the DB field later.

### Changes — Single file: `src/pages/MisCotizaciones.tsx`

**1. Add state for the drawer**
- `drawerQuote: QuoteRow | null` — controls which quote's contact panel is open
- `copiedField: string | null` — tracks which field just got copied (for "✓ Copiado" feedback)

**2. Change row click behavior (line 553)**
- Current: `onClick={() => window.open(...)}`
- New: `onClick={() => setDrawerQuote(q)}`

**3. Add the contact drawer panel**
- Use the existing `Sheet` component (from `@/components/ui/sheet`) with `side="right"`
- Dark semi-transparent overlay (already built into Sheet)
- X close button (already built into Sheet)
- Header: client name + company
- 6 fields, each with label + value + "Copiar" button:
  - Nombre → `client_name`
  - Empresa → `client_company`
  - Número → `client_phone`
  - Correo → `client_email`
  - LinkedIn → shows "—" (no data yet)
  - Cotización → `quote_number`
- Copy button uses `navigator.clipboard.writeText()`, shows "✓ Copiado" in green for 2s
- LinkedIn rendered as clickable link opening in new tab when data exists
- Slide-in animation from right (built into Sheet component)

**4. No other files modified**
- No DB changes, no API changes, no other views touched

