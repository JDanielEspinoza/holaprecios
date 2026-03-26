

## Plan: Opa! Suite Cotação Refinements

### Overview
Seven changes to the Opa! Suite quotation flow: new logo, full PT-BR translation, separate monthly vs adesão totals, remove validity text, rename seller label, translate buttons, and add installment (parcelamento) rules.

### Change 1 — New logo on generated cotação
Copy uploaded `OpaSuite-3.png` to `src/assets/logo-opa-suite-3.png`. In `Cotizacion.tsx`, import it and use it instead of `logo-opa-suite-2.png` for Opa! quotes.

### Change 2 — Full PT-BR translation in Cotizacion.tsx
Ensure all Opa! quote text is in Portuguese:
- Error state: "Cotação não encontrada."
- Seller label: change "Seu consultor" → "Especialista Comercial"
- All section headers already in PT-BR (Mensalidade, Opa! Cloud, Adesão) — verify and fix any remaining Spanish text.

### Change 3 — Separate Total Mensal from Adesão in cotação
Currently both are shown together. Restructure the Opa! cotação layout:
- Show **Total Mensal** (mensalidade + cloud) prominently with its breakdown.
- Show **Adesão (pagamento único)** as a visually separate section below, with its own total.

### Change 4 — Remove validity date text
Search for any "Cotización válida hasta" or "válida" text in `Cotizacion.tsx` and remove it. Based on code review, this text doesn't appear in Cotizacion.tsx — check if it's in QuoteShare or elsewhere and remove.

### Change 5 — Translate QuoteShare buttons for Opa! context
`QuoteShare` component has Spanish text. Add an `isOpa` prop to `QuoteShare`:
- "Compartir Cotización" → "Compartilhar Cotação"
- "Enviar Cotización por WhatsApp" → "Enviar Cotação por WhatsApp"
- "Descargar Cotización" → "Baixar Cotação"
- "Escaneá el QR..." → "Escaneie o QR..."
- "Completá el teléfono..." → "Preencha o telefone..."
- "Enlace Para Registro Wispro" → "Link para Registro Wispro" (or hide for Opa!)
- Error/success messages translated similarly.

Pass `isOpa={true}` from `OpaSuite.tsx` success screen.

### Change 6 — Installment rules (parcelamento)
Add installment logic to the Opa! cotação in `Cotizacion.tsx`. Based on the **net adesão total** (`installation_cost`):
- ≤ R$ 854 → até 2x
- R$ 855–1.590 → até 3x
- R$ 1.591–2.650 → até 4x
- ≥ R$ 2.651 → até 6x

Display below the Adesão total: "Parcelamento em até Nx de R$ X,XX"

### Files modified

| File | Change |
|---|---|
| `src/assets/logo-opa-suite-3.png` | NEW — uploaded logo |
| `src/pages/Cotizacion.tsx` | New logo, PT-BR text, separate sections, parcelamento, seller label |
| `src/components/QuoteShare.tsx` | Add `isOpa` prop for PT-BR translations |
| `src/pages/OpaSuite.tsx` | Pass `isOpa` to QuoteShare |

