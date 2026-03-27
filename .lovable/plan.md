

## Plan: Multiple Opa! Suite and Menu Updates

### 1. Hamburger icon color (AppMenu.tsx)
Change the Menu icon button from `text-white` to `text-gray-700` so it's visible on white backgrounds.

### 2. Add "Ambientes IA" submenu (AppMenu.tsx)
Add a new top-level menu item "Ambientes IA" with children:
- "Hola! Suite IA" → `/hola-suite-ia`
- "Opa! Suite IA" → `/opa-suite-ia`

This is separate from the existing "Cotar" submenu. Uses `Bot` icon for children and a suitable parent icon (e.g. `Cpu` or `Bot`).

### 3. Move Treinamento/Retreinamento/Banco de Templates to Adesão (opaPricing.ts + OpaSuite.tsx)
- Remove `opaMensalidadeGroups` from the Mensalidade section UI
- Remove `groupsTotal` from `mensalidadeTotal` calculation
- Add the collapsible groups UI into the Adesão card instead
- Add `groupsTotal` to `adesaoTotal` calculation
- Update `buildItems()` so group selections use `section: "adesao"` instead of `"mensalidade"`

### 4. Add "Serviço de Página Web" addon (opaPricing.ts)
Add `{ name: "Serviço de Página Web", unitPrice: 79.50 }` to the `opaAddons` array in Mensalidade.

### 5. Fix installment auto-selection display
The installment logic is already correct per the rules. Ensure when switching to "Parcelado", the max installments button is auto-selected (already implemented at line 758). No changes needed here — the rules match what's coded.

### Files Modified
| File | Change |
|---|---|
| `src/components/AppMenu.tsx` | Icon color + Ambientes IA submenu |
| `src/data/opaPricing.ts` | Add Serviço de Página Web addon |
| `src/pages/OpaSuite.tsx` | Move collapsible groups from Mensalidade to Adesão, update totals |

