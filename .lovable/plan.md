

## Plan: Fix Summary + New Opa! Suite Calculator

### CAMBIO 1 — Fix Summary (hide $0 items)

**File: `src/pages/Index.tsx`**

Modify the `SummaryLine` component: instead of rendering with `line-through opacity-50` when inactive, simply return `null` when `!active || value <= 0`. This removes all $0 items from the summary entirely.

Lines affected: ~578-584 (SummaryLine function).

---

### CAMBIO 2 — Opa! Suite Calculator

**New file: `src/data/opaPricing.ts`** — pricing data extracted from the CSV:

**Mensalidade items (addons with +/- quantity selectors):**
| Item | Unit Price (R$) |
|---|---|
| Licença Opa! Suite | 212.00 (base, always included) |
| Usuário avulso | 30.00 |
| WhatsApp Direct Tech Partner (broker IXC) | 201.00 |
| Instagram | 148.00 |
| WebChat | 148.00 |
| Messenger | 148.00 |
| Telefonia | 509.00 |
| Telegram | 148.00 |
| Ambiente de IA | 265.00 |

**Opa! Cloud plans (single selection, like Hola Cloud):**
| Plan | Price (R$) | Max clients |
|---|---|---|
| Hospedagem até 2.000 atendimentos/mês | 99.00 | 2,000 |
| Hospedagem até 5.000 atendimentos/mês | 233.00 | 5,000 |
| Hospedagem até 10.000 atendimentos/mês | 478.00 | 10,000 |
| Hospedagem até 20.000 atendimentos/mês | 618.00 | 20,000 |
| Hospedagem até 40.000 atendimentos/mês | 1,283.00 | 40,000 |
| Hospedagem até 60.000 atendimentos/mês | 1,982.00 | 60,000 |
| Hospedagem até 100.000 atendimentos/mês | 2,565.00 | 100,000 |

**Adesão (one-time payment, at bottom of summary):**
- Adesão Básica: R$ 854.00 — always active, not editable. Includes: configuração básica da licença, canais, 3h treinamento, suporte, fluxo básico, configurações básicas.
- Fluxo Personalizado: optional toggle — price TBD (R$ 0.00 in CSV, marked "sob análise"). Will show as toggle but with R$ 0.00 for now.

**New file: `src/pages/OpaSuite.tsx`**

Structure mirrors `Index.tsx` exactly:
1. Banner — replace AppBanner with a static gradient header using the Opa! Suite banner image (`channels4_banner.jpg`) and Opa! Suite logo (`OpaSuite.png`), IXCsoft logo (`logoixc.png`)
2. Client count selector (same dropdown using `pricingTiers` client counts)
3. Left card: "Mensalidade" — Licença base (R$ 212.00, always shown) + addon items with +/- buttons
4. Right card: "Opa! Cloud" — single-select plan list, auto-recommended by client count
5. Summary card: only items with value > R$ 0. Subtotal Mensalidade + Opa! Cloud + Total Mensal (R$)
6. Adesão section: Adesão Básica (always on) + Fluxo Personalizado (toggle)
7. Client data form + "Gerar Cotação" button
8. Loading + success screens (same flow, Portuguese labels)
9. All text in Portuguese (BR)
10. Currency formatter: `R$` with Brazilian locale
11. `event_code` from context auto-attached on save

**Assets to copy:**
- `user-uploads://OpaSuite.png` → `src/assets/logo-opa-suite.png`
- `user-uploads://logoixc.png` → `src/assets/logo-ixcsoft.png`
- `user-uploads://channels4_banner.jpg` → `src/assets/opa-banner.jpg`

**File: `src/App.tsx`** — Change route `/coming-soon` to `/opa-suite` pointing to `OpaSuite`

**File: `src/components/AppMenu.tsx`** — Update "Opa! Suite" menu item: path → `/opa-suite`, remove `comingSoon: true`

### Files modified/created

| File | Action |
|---|---|
| `src/pages/Index.tsx` | Fix SummaryLine to hide $0 items |
| `src/data/opaPricing.ts` | NEW — Opa! Suite pricing data |
| `src/pages/OpaSuite.tsx` | NEW — Opa! Suite calculator page |
| `src/assets/logo-opa-suite.png` | NEW — copied from upload |
| `src/assets/logo-ixcsoft.png` | NEW — copied from upload |
| `src/assets/opa-banner.jpg` | NEW — copied from upload |
| `src/App.tsx` | Update route for /opa-suite |
| `src/components/AppMenu.tsx` | Update menu item |

### NOT changed
- No database migration needed (uses same `quotes` table)
- Edge function unchanged
- HolaSuiteIA / OpaSuiteIA untouched
- CotizacionesAndina / MisCotizaciones untouched

