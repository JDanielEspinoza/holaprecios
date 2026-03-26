

## Plan: Fix Opa! Suite Cotação — Logo, Translations, and Validity Text

### Problem
The generated cotação page (`/cotizacion?id=...`) opened via "Baixar Cotação" still shows:
- Wrong logo (Wispro + IXC instead of OpaSuite-3.png)
- Spanish text throughout (Resumen de Cotización, Total Mensual, Tu asesor, Descargar PDF, etc.)
- "$" currency format instead of "R$"
- Validity text ("Cotización válida hasta...")
- "Pago de Implementación" section mixing with Opa layout

### Root Cause
The current `Cotizacion.tsx` code has conditional `isOpaQuote` logic, but the screenshot shows it is not activating correctly or the deployed version doesn't match. The plan ensures all Opa! quote text is unambiguously in Portuguese and the correct logo is used.

### Changes

**File: `src/pages/Cotizacion.tsx`**

1. **Logo** — Verify import of `logo-opa-suite-3.png` is correct and rendered for Opa quotes (already in code at line 11/126 — will re-verify the asset exists and is the correct file).

2. **Remove all remaining Spanish text for Opa context** — Audit every string in the file and ensure the `isOpaQuote` ternary uses Portuguese:
   - "Resumo da Cotação" (not "Resumen de Cotización")
   - "Detalhe para X clientes" (not "Detalle para")
   - "Total Mensal" (not "Total Mensual")
   - "Mensalidade + Cloud" (not "Ecosistema + Personalización + Cloud")
   - "Especialista Comercial" (not "Tu asesor")
   - "Baixar PDF" (not "Descargar PDF")
   - "Desejo confirmar minha cotação" (not "Deseo confirmar mi cotización")
   - WhatsApp message text in Portuguese

3. **Remove validity date text** — Search for any "Cotización válida" or date text (currently not found in code — may be rendered from data or a cached deployment). Add explicit check to ensure no such footer appears for Opa quotes.

4. **Currency format** — Ensure `fmt()` with `isOpa=true` uses "R$" format. Already in code; will verify the `f()` helper correctly passes `isOpaQuote`.

5. **Opa layout sections** — Ensure for Opa quotes, only the Opa-specific sections render (Mensalidade, Cloud, Total Mensal, Adesão) and NOT the Wispro sections (Ecosistema, Personalización, Pago de Implementación).

**File: `src/components/QuoteShare.tsx`**
- Already has `isOpa` prop with PT-BR text — verify it's being passed correctly from `OpaSuite.tsx`.

**File: `src/pages/OpaSuite.tsx`**
- Verify `isOpa={true}` is passed to `QuoteShare` component.

### Files modified

| File | Change |
|---|---|
| `src/pages/Cotizacion.tsx` | Re-verify and fix all PT-BR translations, logo, remove validity text |
| `src/pages/OpaSuite.tsx` | Verify isOpa prop passed to QuoteShare |
| `src/components/QuoteShare.tsx` | Verify PT-BR translations (may need minor fixes) |

