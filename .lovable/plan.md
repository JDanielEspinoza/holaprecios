

## Plan: Família Inmap — Image Paste OCR, Auto-Plan Selection, UI Polish

### Overview
Replace the CNPJ input with a paste-image area that uses AI OCR to extract 3 key metrics from screenshots. Auto-select plans based on extracted data. Add floating particles to the banner. Fix mobile responsiveness in the quote summary. Reduce product card sizes and sharpen logos.

---

### Changes

#### 1. Replace CNPJ Box with Image Paste Area
**File:** `src/pages/FamiliaInmap.tsx`

- Remove the CNPJ input, the `formatCNPJ` function, the Settings gear popover, and related state (`cnpj`, `configEndpoint`).
- Add a paste-detection zone: a styled card that listens to the `onPaste` event on the document. When the user pastes an image (Ctrl+V / Cmd+V), it captures the clipboard image.
- Display the pasted image as a thumbnail with a loading spinner while processing.
- Add 3 prominent data display fields above the product cards showing the extracted values:
  - **Total de clientes com CRM ativo**
  - **Total de logins ativos**
  - **Total de clientes ativos**
- These fields will have a professional "dashboard metric" style — large bold numbers with subtle labels, arranged in a responsive 3-column grid.

#### 2. AI-Powered OCR Extraction
**New file:** `supabase/functions/extract-inmap-data/index.ts`

- Edge function that receives a base64 image.
- Uses Lovable AI (Gemini Flash) to analyze the screenshot and extract the 3 numeric values: `clientes_crm_ativo`, `logins_ativos`, `clientes_ativos`.
- Returns structured JSON. The function uses the AI gateway with a structured prompt asking for exactly these 3 fields.

#### 3. Auto-Select Plans Based on Extracted Data
**File:** `src/pages/FamiliaInmap.tsx`

- When data is extracted and a product is toggled on, automatically match the correct plan tier:
  - **Inmap Service**: matched by `logins_ativos` against `inmapServiceTiers` ranges
  - **Inmap Sales**: matched by `clientes_crm_ativo` (CRM clients + prospects/leads) against `inmapSalesTiers` ranges
  - **Inmap Fiberdocs**: matched by `logins_ativos` against `inmapFiberdocsTiers` ranges
- The auto-selected plan can still be manually overridden by the seller.

#### 4. Floating Particles on Banner
**File:** `src/pages/FamiliaInmap.tsx`

- Add the same particle animation effect from `AppBanner.tsx` (white floating circles with `float1/2/3` keyframe animations) overlaid on the blue Inmap banner.

#### 5. Reduce Product Card Sizes, Sharpen Logos
**File:** `src/pages/FamiliaInmap.tsx` — `InmapProductCard` component

- Reduce the card padding (`pt-2 md:pt-3`).
- Increase logo sharpness by using `image-rendering: auto` and slightly larger rendered sizes while keeping card compact.
- Remove excess whitespace around logos.

#### 6. Fix Mobile Responsiveness in Quote Summary
**Files:** `src/pages/FamiliaInmap.tsx` (Resumo section) and `src/pages/Cotizacion.tsx` (Inmap quote section)

- In the Resumo card: use `flex-wrap` and `min-w-0` with `truncate` on labels to prevent text overlap on small screens.
- In the public quote (`Cotizacion.tsx`): apply responsive text sizing (`text-xs sm:text-sm`) and `break-words` to prevent numbers/text from stacking on top of each other on mobile.
- For the "Total Mensal" line: use `text-2xl sm:text-4xl` for the price to scale down on mobile.

---

### Technical Details

**Edge Function — `extract-inmap-data/index.ts`:**
- Accepts POST with `{ image: "<base64>" }`
- Calls Lovable AI with the image + prompt: "Extract these exact fields from the screenshot: Total de clientes com CRM ativo, Total de logins ativos, Total de clientes ativos. Return JSON."
- Uses `--schema` style structured output for reliable extraction
- Returns `{ clientes_crm_ativo: number, logins_ativos: number, clientes_ativos: number }`

**Plan auto-matching logic:**
```text
function findTier(tiers, value):
  for each tier in tiers:
    parse range min/max from tier.range
    if value falls within range → return tier.plan
  return last tier (largest)
```

**Files touched:**
| File | Action |
|---|---|
| `src/pages/FamiliaInmap.tsx` | Major edit — paste area, data display, auto-plan, particles, card sizing, summary responsiveness |
| `supabase/functions/extract-inmap-data/index.ts` | New — AI OCR edge function |
| `src/pages/Cotizacion.tsx` | Minor edit — mobile responsive fixes for Inmap quote section |

