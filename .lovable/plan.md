

## Plan: Create IXC Assina Product

### Overview
New quotation product "IXC Assina" — Brazilian document signing service with two packages (Profissional and Especialista). Full integration: pricing data, calculator page, menu entry, WhatsApp template, public quote view, and banner.

### Pricing Data (from CSV)

**Pacote Profissional** (face detection only):
| Docs/mês | Unit price | Package price | Excess | Min value |
|---|---|---|---|---|
| 20 | R$ 3,40 | R$ 68,00 | R$ 3,17 | R$ 63,00 |
| 50 | R$ 2,72 | R$ 136,00 | R$ 2,61 | R$ 116,00 |
| 100 | R$ 2,27 | R$ 227,00 | R$ 2,20 | R$ 190,00 |
| 200 | R$ 2,14 | R$ 428,00 | R$ 2,09 | R$ 338,00 |
| 400 | R$ 2,02 | R$ 808,00 | R$ 1,96 | R$ 656,00 |
| 700 | R$ 1,91 | R$ 1.337,00 | R$ 1,85 | R$ 1.070,00 |
| 1000 | R$ 1,80 | R$ 1.800,00 | R$ 1,75 | R$ 1.356,00 |
| 1500 | R$ 1,70 | R$ 2.550,00 | R$ 1,61 | R$ 1.896,00 |
| 3000 | R$ 1,50 | R$ 4.500,00 | R$ 1,48 | R$ 3.730,00 |

**Pacote Especialista** (face detection + face comparison):
| Docs/mês | Unit price | Package price | Excess | Min value |
|---|---|---|---|---|
| 20 | R$ 4,45 | R$ 89,00 | R$ 4,23 | R$ 84,00 |
| 50 | R$ 3,78 | R$ 189,00 | R$ 3,67 | R$ 169,00 |
| 100 | R$ 3,33 | R$ 333,00 | R$ 3,26 | R$ 296,00 |
| 200 | R$ 3,20 | R$ 640,00 | R$ 3,14 | R$ 550,00 |
| 400 | R$ 3,08 | R$ 1.232,00 | R$ 3,02 | R$ 1.080,00 |
| 700 | R$ 2,97 | R$ 2.079,00 | R$ 2,91 | R$ 1.812,00 |
| 1000 | R$ 2,86 | R$ 2.860,00 | R$ 2,81 | R$ 2.416,00 |
| 1500 | R$ 2,75 | R$ 4.125,00 | R$ 2,67 | R$ 3.486,00 |
| 3000 | R$ 2,56 | R$ 7.680,00 | R$ 2,54 | R$ 6.910,00 |

Note: Packages 500 and 2000 are NOT available for sale.

---

### Files to Create/Modify

#### 1. Copy logo → `src/assets/ixc-assina-logo.png`
Copy the uploaded IXC Assina image.

#### 2. Generate banner → `src/assets/ixc-assina-banner.jpg`
Use AI image generation to create a banner matching the size/style of `opa-banner.jpg`, incorporating the IXC Assina branding (teal color `#2AACA1`, "IXC ASSINA" text).

#### 3. Create `src/data/assinaPricing.ts`
- Define `AssinaTier` type with fields: `docs`, `unitPrice`, `packagePrice`, `excess`, `minValue`
- Two arrays: `assinaProfissionalTiers` and `assinaEspecialistaTiers` with all rows above
- Export a type for the package type: `"profissional" | "especialista"`

#### 4. Create `src/pages/IxcAssina.tsx`
Calculator page following OpaSuite.tsx patterns but simpler:
- Banner at top (same size as Opa)
- Step 1: Select package type (Profissional / Especialista) — two prominent cards
- When Especialista is selected, the entire UI shifts to a VIP/premium aesthetic (dark theme, gold accents, premium card styles, subtle gradients)
- Step 2: Select document quantity from dropdown (filtered to available tiers for selected package)
- Shows: Unit price, Package price, Excess rate, Min value
- Client data fields (Nome, Empresa, Telefone, Email)
- Generate quote button → saves to `quotes` table with items using `section: "assina_profissional"` or `section: "assina_especialista"`
- Success screen with banner, QR, share buttons
- WhatsApp confirmation number: `5549920009215`
- Portuguese throughout
- `seller_numero` set to the IXC Assina WhatsApp number

#### 5. Update `src/components/AppMenu.tsx`
Add "IXC Assina" to the "Cotar" submenu children.

#### 6. Update `src/App.tsx`
Add route `/ixc-assina` → `<IxcAssina />`.

#### 7. Update `src/pages/Cotizacion.tsx`
- Detect IXC Assina quotes via `items.some(i => i.section?.startsWith("assina_"))`
- Use the IXC Assina logo
- Format in BRL / Portuguese
- WhatsApp confirmation button → phone `5549920009215`
- Message: `"Olá! Recebi esta cotação de ${sellerName}${eventSuffix} e gostaria de confirmar o valor! ${quoteUrl}"`
- Event name mapping already includes ABRINT26

#### 8. Update `src/components/QuoteShare.tsx`
- Detect `isAssina` prop (or detect from a new prop)
- Use event key `ASSINA_ABRINT26` for the template API call
- Portuguese labels

#### 9. Update `supabase/functions/send-whatsapp-template/index.ts`
Add new config entry:
```
ASSINA_ABRINT26: {
  apiUrl: "https://suporte.ixcsoft.com.br/api/v1/template/send",
  bearerSecretName: "ABRINT_WHATSAPP_BEARER",
  templateId: "69cac994960782d8c4c7e9fa",
  canalId: "67631010bda9205b3609811b",
}
```
Variables: `[agentName, linkPresupuesto]` (same pattern as existing Opa templates).

#### 10. Update `src/pages/MisCotizaciones.tsx`
Detect IXC Assina quotes for proper formatting (BRL, Portuguese labels) and WhatsApp template routing (use `ASSINA_` prefix).

### VIP Especialista Design
When the user selects "Pacote Especialista":
- Cards switch to dark backgrounds (`bg-gray-900`, `bg-slate-800`)
- Gold accent colors (`text-amber-400`, `border-amber-500`)
- Subtle gradient overlays
- Premium typography weight
- A small "VIP" or crown badge appears
- The package selection card for Especialista gets a gold border glow

### Key Technical Decisions
- Items saved with `section: "assina_profissional"` or `section: "assina_especialista"` to distinguish in Cotizacion.tsx
- Reuse existing `ABRINT_WHATSAPP_BEARER` secret (same IXC Soft API)
- Only ABRINT26 event supported for now — the calculator will use the active event but defaults to ABRINT26
- No installment/adesão logic needed — IXC Assina is monthly subscription only

