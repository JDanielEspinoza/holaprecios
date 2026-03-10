

## Plan: Static seller phone + dark mode login glow

### 1. Revert seller_numero to static company number (`src/pages/Index.tsx`)

The WhatsApp "confirm" button in Cotizacion.tsx already uses the hardcoded company number `5492615783684` — that's correct. However, `seller_numero` stored in the quote (line 172) should also be the static company number so the seller contact card in the quote shows the company number, not the individual's personal number.

**Change line 172**: `seller_numero: "+5492615783684"` (static company number).

The seller NAME (`seller_name: profile?.nombre`) is already dynamic and correct. The screenshot showing "Jorthy Carvajal" was from quotes created before the profile-based name was implemented. New quotes will correctly show each seller's name.

### 2. Dark mode login woman — phone glow on face (`src/pages/Login.tsx`)

Enhance the existing dark mode effect:
- Reposition the glow overlay to be closer to the woman's face area (upper body, where the phone would illuminate)
- Use a warmer, more screen-like color (cool white-blue) with stronger opacity
- Add a second smaller, brighter glow spot near the phone position for realism
- Add a subtle CSS filter on the woman image in dark mode: slightly increased brightness on the face side

### Files to modify:
1. `src/pages/Index.tsx` — line 172: static seller_numero
2. `src/pages/Login.tsx` — enhanced dark mode glow near woman's face

