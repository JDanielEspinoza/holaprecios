

## Plan: Multi-Event Quotation System (Revised v2)

### Phase 1 — Database Migration

- Add `event_code TEXT DEFAULT NULL` and `event_quote_label TEXT DEFAULT NULL` to `quotes`
- Existing quotes stay `NULL` (no backfill)
- DB function + trigger: on INSERT, if `event_code` is not null, generate label (e.g. `APTC26-01`) by counting existing quotes for that code

### Phase 2 — Event Context + Menu Selector

- Create `src/data/events.ts` — registry with code, name, language, webhook config, active flag
- Create `src/contexts/EventContext.tsx` — persists active event in `localStorage`, default `null` ("Sin evento")
- Modify `AppMenu.tsx`: add event selector dropdown in the slide-out menu; show active event name in header/banner

### Phase 3 — Auto-attach event_code on Save

- Modify `Index.tsx`: read `activeEvent` from context, include `event_code` in the quote insert
- No UI change inside the calculator

### Phase 4 — Modify Existing Edge Function

- Modify `send-quote/index.ts` (the existing function, no new function)
- Accept `event_code` in the payload
- If `NULL` or `'NONE'` → identical to current behavior, no changes
- If has value → select webhook URL/template from event config
- Preserve all existing retry logic, backoff, webhook_errors logging

### Phase 5 — Cotizaciones (rename + event tabs)

- Rename "Cotizaciones Andina" → "Cotizaciones" (page, route, menu)
- Add filter tabs: Todas / Sin evento / Andina Link 2026 / APTC Cumbre 2026 / Abrint 2026
- Filter by `event_code` (`NULL` for "Sin evento")
- Add same event filter to `MisCotizaciones.tsx`; show `event_quote_label` when present

### Phase 6 — Menu Restructure (Cotizar by app)

```text
Cotizar
├─ Ecosistema Wispro + IXC   → / (existing calculator)
├─ Opa! Suite                → placeholder "Próximamente"
├─ IXC Consult               → placeholder "Próximamente"
└─ Olli                      → placeholder "Próximamente"
```

### Phase 7 (future) — i18n + new calculators

- i18n system (ES/PT-BR) with manual selector
- Opa! Suite calculator
- Andina Link stays hardcoded in Spanish

### Files modified/created

| File | Action |
|---|---|
| `supabase/migrations/new` | Add `event_code`, `event_quote_label`, trigger |
| `src/data/events.ts` | NEW — event registry |
| `src/contexts/EventContext.tsx` | NEW — event context + provider |
| `src/components/AppMenu.tsx` | Event selector + menu restructure |
| `src/App.tsx` | Wrap with EventProvider, placeholder routes |
| `src/pages/Index.tsx` | Read event context on save |
| `src/pages/MisCotizaciones.tsx` | Event filter, show event_quote_label |
| `src/pages/CotizacionesAndina.tsx` | Rename to Cotizaciones, event tabs |
| `src/pages/ComingSoon.tsx` | NEW — generic placeholder |
| `supabase/functions/send-quote/index.ts` | Parameterize by event_code |

### NOT done

- No separate routes per event
- No CotizarAPTC.tsx
- No new Edge Function
- No backfill of existing quotes
- No i18n yet (Phase 7)
- HolaSuiteIA / OpaSuiteIA untouched

