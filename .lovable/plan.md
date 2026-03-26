

## Plan: Opa! Suite UI Refinements

### Change 1 — Banner: use only the uploaded image
Replace the gradient header with the uploaded banner image (`opasuite-banner-cmm7nPpz-2.jpeg`). Copy to `src/assets/opa-banner.jpg` (overwrite). Render as a full-width banner image, no logos overlaid, no gradient. Apply to all three views (form, loading, success).

### Change 2 — Auto-collapse groups on selection
In the collapsible groups (Treinamento, Retreinamento, Banco de Templates), when the user clicks an option, automatically close the group by setting `openGroups[gi] = false`.

### Change 3 — Rename addon
In `src/data/opaPricing.ts`, change `"WhatsApp Direct Tech Partner (broker IXC)"` → `"Whatsapp Partner - Broker IXC"`.

### Change 4 — Move Adesão out of Resumo into its own card
Remove the entire Adesão section (lines ~540-591) from the Resumo card. Create a new white Card between the Cloud card row and the Resumo card, titled "Adesão (pagamento único)". This card contains:
- Adesão Básica (always on, not toggleable)
- Fluxo Básico toggle
- All extra adesão items with toggles
- Total Adesão at bottom

### Change 5 — Resumo shows only chosen items
Resumo already filters by value > 0 via `OpaSummaryLine`. Remove the Adesão section from Resumo entirely (it's in its own card now). Keep showing: Licença base, addons with qty > 0, group selections, cloud selection, subtotals, and Total Mensal. Add a small "Adesão" line at the bottom of Resumo showing the total one-time payment (if > base price, i.e. if extras were toggled).

### Files modified

| File | Change |
|---|---|
| `src/assets/opa-banner.jpg` | Overwrite with uploaded image |
| `src/data/opaPricing.ts` | Rename WhatsApp addon |
| `src/pages/OpaSuite.tsx` | Banner image, auto-collapse, move Adesão to own card, clean Resumo |

