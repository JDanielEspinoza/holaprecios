

## Plan: Create "Família Inmap" Product

### Overview
New Brazilian quotation product with 3 sub-products (Inmap Service, Sales, Fiberdocs), CNPJ input with config gear, and full integration into quotes, menu, and WhatsApp messaging. Uses real pricing from the uploaded CSV. The uploaded video will be converted to a GIF banner (blue section only).

### Pricing Data (from CSV)

**Inmap Sales** (by clientes ativos+prospects+leads):
| Plan | Range | Price |
|---|---|---|
| START | Até 3.000 | R$ 310,00 |
| ESSENCIAL | 3.001 - 6.000 | R$ 461,00 |
| MEDIUM | 6.001 - 12.000 | R$ 613,00 |
| BUSINESS | 12.001 - 24.000 | R$ 771,00 |
| PREMIUM | 24.001 - 48.000 | R$ 922,00 |
| FULL | Acima de 48.000 | R$ 1.079,00 |

**Inmap Service** (by logins ativos, includes Taxa de Implantação):
| Plan | Range | Price | Taxa Implantação |
|---|---|---|---|
| START | Até 500 | R$ 212,00 | gratuito |
| LITE | 501 - 1.000 | R$ 371,00 | gratuito |
| ESSENCIAL | 1.001 - 2.000 | R$ 636,00 | R$ 763,00 |
| STANDARD | 2.001 - 3.000 | R$ 795,00 | R$ 954,00 |
| MEDIUM | 3.001 - 4.000 | R$ 975,00 | R$ 1.170,00 |
| SMART | 4.001 - 5.000 | R$ 1.113,00 | R$ 1.336,00 |
| PRO | 5.001 - 8.000 | R$ 1.611,00 | R$ 1.933,00 |
| BUSINESS | 8.001 - 10.000 | R$ 1.908,00 | R$ 2.290,00 |
| PLUS | 10.001 - 15.000 | R$ 2.226,00 | R$ 2.671,00 |
| PREMIUM | 15.001 - 30.000 | R$ 3.180,00 | R$ 3.816,00 |
| ULTRA | 30.001 - 50.000 | R$ 4.240,00 | R$ 5.088,00 |
| ADVANCED | 50.001 - 80.000 | R$ 5.936,00 | R$ 7.123,00 |
| ULTIMATE | 80.001 - 100.000 | R$ 6.360,00 | R$ 7.632,00 |
| FULL | Acima de 100.001 | personalizado | personalizado |

**Inmap Fiberdocs** (by logins ativos):
| Plan | Range | Price |
|---|---|---|
| START | Até 1.000 | R$ 310,00 |
| ESSENCIAL | 1.001 - 3.000 | R$ 461,00 |
| MEDIUM | 3.001 - 8.000 | R$ 613,00 |
| BUSINESS | 8.001 - 15.000 | R$ 771,00 |
| PREMIUM | 15.001 - 30.000 | R$ 922,00 |
| FULL | Acima de 30.000 | R$ 1.079,00 |

**Taxa de Implantação note**: For Inmap Service, allows 10% discount with installments. Min installment R$ 530,00, max 6x. First payment required before implementation starts.

---

### Files to Create/Modify

#### 1. Copy uploaded logos → `src/assets/`
- `src/assets/inmap-service.png` ← InmapService.PNG
- `src/assets/inmap-sales.png` ← InmapSales.PNG
- `src/assets/inmap-fiberdocs.png` ← InmapFiberdocs.PNG

#### 2. Generate banner → `src/assets/inmap-banner.gif`
Extract only the blue section from the uploaded video (not the black part), convert to GIF, matching the same dimensions/proportions as the Opa! Suite banner (`opa-banner.jpg`). The banner will be displayed in a `rounded-2xl overflow-hidden shadow-2xl` container like OpaSuite.

#### 3. Create `src/data/inmapPricing.ts`
- Types and arrays for all 3 products with real pricing data from CSV
- Inmap Service includes `taxaImplantacao` field (0 for gratuito, numeric for others, -1 for personalizado)
- FULL tier for Inmap Service marked as `personalizado: true`

#### 4. Create `src/pages/FamiliaInmap.tsx`
Following OpaSuite/Index patterns:
- **Banner** at top (same layout as OpaSuite: `rounded-2xl overflow-hidden shadow-2xl`)
- **CNPJ input** with gear icon on right (temporary config gear opens a small popover/modal for GET endpoint config)
- **3 product cards** in a row (same visual style as Wispro/ACS/Hola cards in Index.tsx):
  - Inmap Service (with its logo)
  - Inmap Sales (with its logo)
  - Inmap Fiberdocs (with its logo)
  - Each toggleable via checkbox, showing selected plan price
- When a product is selected, show a **plan selector dropdown** below (based on the product's tiers)
- Inmap Service: when plan is selected, show Taxa de Implantação below with installment info
- Client data fields (Nome, Empresa, Telefone, Email) in Portuguese
- Generate quote button → saves to `quotes` table with `section: "inmap_service"`, `"inmap_sales"`, `"inmap_fiberdocs"`
- Success screen with banner, QR, share buttons
- `seller_numero`: `"5549920009215"`
- All text in Portuguese
- Uses `ASSINA_ABRINT26` template key for WhatsApp (shared with Assina)

#### 5. Update `src/components/AppMenu.tsx`
Add "Família Inmap" to the "Cotar" submenu children.

#### 6. Update `src/App.tsx`
Add route `/familia-inmap` → `<FamiliaInmap />`, import the component.

#### 7. Update `src/pages/Cotizacion.tsx`
- Import a logo for Inmap (e.g., `logo-inmap-sphere.png` already in assets)
- Detect Inmap quotes: `items.some(i => i.section?.startsWith("inmap_"))`
- When `isInmapQuote`: show Inmap logo, Portuguese text, BRL currency
- Show selected products with their plan names and prices
- Inmap Service: show Taxa de Implantação section with installment rules
- WhatsApp confirmation → phone `5549920009215`
- Same Portuguese message pattern as Assina

#### 8. Update `src/components/QuoteShare.tsx`
- Add `isInmap` prop
- When `isInmap`: use `ASSINA_ABRINT26` template key, Portuguese labels
- Hide "Registro Wispro" button for Inmap

#### 9. Update `src/pages/MisCotizaciones.tsx`
- Detect Inmap quotes for BRL formatting and Portuguese labels

### CNPJ + Config Gear
```text
┌──────────────────────────────────────────┐
│  CNPJ da Empresa                         │
│  ┌──────────────────────────────┐  ⚙️   │
│  │  00.000.000/0000-00          │        │
│  └──────────────────────────────┘        │
└──────────────────────────────────────────┘
```
Gear opens a popover to set GET endpoint URL (temporary, for testing).

### Product Cards Layout
Same 3-column grid as Index.tsx ProductCard component, with checkbox, logo, plan name, and price.

### Key Technical Decisions
- Items saved with `section: "inmap_service"`, `"inmap_sales"`, `"inmap_fiberdocs"`
- Reuses `ASSINA_ABRINT26` WhatsApp template config (same API, bearer, template, canal)
- Only ABRINT26 event supported initially
- Inmap Service Taxa de Implantação: installment rules (min R$ 530, max 6x, 10% discount available)
- FULL tier for Inmap Service is "personalizado" — shows "Sob consulta" instead of price

### Files Summary
| File | Action |
|---|---|
| `src/assets/inmap-service.png` | New — uploaded logo |
| `src/assets/inmap-sales.png` | New — uploaded logo |
| `src/assets/inmap-fiberdocs.png` | New — uploaded logo |
| `src/assets/inmap-banner.gif` | New — from video blue section |
| `src/data/inmapPricing.ts` | New — real pricing data |
| `src/pages/FamiliaInmap.tsx` | New — calculator page |
| `src/components/AppMenu.tsx` | Add menu entry |
| `src/App.tsx` | Add route + import |
| `src/pages/Cotizacion.tsx` | Detect + render Inmap quotes |
| `src/components/QuoteShare.tsx` | Add isInmap support |
| `src/pages/MisCotizaciones.tsx` | Detect Inmap for formatting |

