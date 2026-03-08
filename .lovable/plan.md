

## Plan: Create "Hola! Suite IA" page

### What
A new page mirroring the Opa! Suite IA calculator but for LATAM markets — prices in USD, with a country selector that changes per-message rates based on WhatsApp API costs by country.

### Pricing data (from image)

**Per-message costs by country (USD) — used as base multipliers for AI interaction pricing:**

| Country | Marketing | Utility |
|---------|-----------|---------|
| Argentina | $0.0618 | $0.0260 |
| Colombia | $0.0125 | $0.0008 |
| México | $0.0305 | $0.0085 |
| Perú | $0.0703 | $0.0200 |
| Resto de LATAM | $0.0740 | $0.0113 |

The AI per-interaction rates will be derived similarly to Opa but in USD, scaled by country messaging costs. I'll create comparable USD rates per provider per country (text, voz padrón, voz clonada).

### Files to create/modify

1. **`src/pages/HolaSuiteIA.tsx`** — New page:
   - Same dark theme, background effects, animated cards as OpaSuiteIA
   - Banner: `holabanner.jpg` (already exists in assets)
   - Country dropdown (Select component) with: Argentina, Colombia, México, Perú, Resto de LATAM
   - Atendimientos input (same as Opa)
   - 3 provider cards (Gemini, OpenAI, Claude) with USD pricing that changes per country
   - Format: `$ X.XX` USD
   - Footer: same Meta Partners badge, Google Play, App Store badges
   - All text in Spanish (not Portuguese)

2. **`src/components/AppMenu.tsx`** — Add menu item:
   - New entry: `{ title: "Hola! Suite IA", path: "/hola-suite-ia", icon: Bot }`

3. **`src/App.tsx`** — Add route:
   - Import HolaSuiteIA, add protected route `/hola-suite-ia`

### Country-based pricing structure

Each country gets a cost multiplier applied to base USD rates per provider. The rates per provider per interaction type will be structured as:

```text
providers = [
  { name: "Gemini",  rates: { AR: {text, voz, clonada}, CO: {...}, MX: {...}, PE: {...}, LATAM: {...} } },
  { name: "OpenAI",  rates: { ... } },
  { name: "Claude",  rates: { ... } },
]
```

Base USD rates (derived from BRL rates / ~5.5 exchange + country adjustment):
- Gemini: text ~$0.048, voz ~$0.062, clonada ~$0.102
- OpenAI: text ~$0.065, voz ~$0.080, clonada ~$0.120
- Claude: text ~$0.093, voz ~$0.107, clonada ~$0.147

Country multipliers based on Meta messaging costs from the image (Argentina highest, Colombia lowest).

### UI layout
- Same glass-card dark aesthetic
- Input section: row with "Atendimientos / mes" + number input + country Select dropdown
- Cards: 3 columns on desktop, 1 on mobile
- No phone mockup (Hola doesn't have the Opa mockup asset)
- Same animated values with USD formatter

