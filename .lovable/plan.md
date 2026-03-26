## Plan: Multi-Event Quotation System (Revised v2) — IMPLEMENTED

### ✅ Phase 1 — Database Migration
- Added `event_code TEXT DEFAULT NULL` and `event_quote_label TEXT DEFAULT NULL` to `quotes`
- Created `generate_event_quote_label()` function + trigger for auto-labeling (APTC26-01, ABRINT26-02, etc.)
- Existing quotes stay `NULL` (no backfill)

### ✅ Phase 2 — Event Context + Menu Selector
- Created `src/data/events.ts` — event registry (NONE, ANDINA26, APTC26, ABRINT26)
- Created `src/contexts/EventContext.tsx` — persists active event in localStorage, default "Sin evento"
- Modified `AppMenu.tsx`: event selector dropdown in slide-out menu
- Wrapped app with `EventProvider` in `App.tsx`

### ✅ Phase 3 — Auto-attach event_code on Save
- Modified `Index.tsx`: reads `eventCode` from context and includes it in quote insert

### ✅ Phase 4 — Modify Existing Edge Function
- Modified `send-quote/index.ts` to accept `event_code` in payload
- If NULL/NONE → identical to current behavior
- If has value → can route to event-specific webhook URL (configurable via EVENT_WEBHOOK_URLS map)
- Passes `event_code` to downstream webhook for template selection

### ✅ Phase 5 — Cotizaciones (rename + event tabs)
- Renamed title "Cotizaciones Andina Link" → "Cotizaciones"
- Added event filter dropdown: Todos / Sin evento / per-event
- Added event filter to MisCotizaciones too
- Shows `event_quote_label` instead of `#quote_number` when available
- Route `/cotizaciones-andina` redirects to `/cotizaciones`

### ✅ Phase 6 — Menu Restructure (Cotizar by app)
- Cotizar submenu organized by application:
  - Ecosistema Wispro + IXC → / (existing calculator)
  - Hola! Suite IA → /hola-suite-ia
  - Opa! Suite IA → /opa-suite-ia
  - Opa! Suite → placeholder (Pronto)
  - IXC Consult → placeholder (Pronto)
  - Olli → placeholder (Pronto)
- Created `ComingSoon.tsx` placeholder page

### Phase 7 (future) — i18n + new calculators
- i18n system (ES/PT-BR) with manual selector
- Opa! Suite calculator for Abrint
- Andina Link stays hardcoded in Spanish
