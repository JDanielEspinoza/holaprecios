

## Plan: Dynamic seller name fix, dark mode login effects, compact language selector

### 1. Fix seller name + phone in quotes (src/pages/Index.tsx)

**Finding**: The WhatsApp "confirm" button in Cotizacion.tsx already uses `data?.seller_name` from the stored quote -- so it IS dynamic per quote. However, `seller_numero` on line 172 is **hardcoded** to `"+5492615783684"` instead of using the profile's phone number. This means all quotes show the same contact number regardless of who created them.

**Fix**: Change line 172 from hardcoded number to `profile?.numero || ""`. This ensures each quote stores the seller's actual phone number from their profile.

Also verify that the Cotizacion.tsx WhatsApp button constructs the link using `data.seller_name` (already confirmed -- line 278 uses `data?.seller_name || "tu asesor"`). The name is already dynamic; the issue the user saw was likely that the same person (Jorthy) created all test quotes.

### 2. Dark mode effects on login page (src/pages/Login.tsx)

When `darkMode` is true:
- Add a darker overlay on the background image (`bg-black/50` instead of `bg-black/15`)
- Add a subtle blue/white glow effect near where the woman holds the phone (CSS radial gradient overlay simulating phone screen light on her face)
- Make floating particles brighter and more visible (`opacity` values increased, larger glow with `box-shadow`)
- Add a CSS class toggle for the particles that increases their brightness in dark mode

### 3. Compact language selector (src/pages/Login.tsx)

Replace the current Globe + Select dropdown with a custom compact flag-only button:
- **Collapsed state**: Shows only the flag emoji of the current language inside a small rounded box (same size as the dark mode toggle ~36x36px)
- **Expanded state**: On click, shows a small dropdown/popover with 3 options, each showing flag + language name
- **On selection**: Closes the dropdown, updates language, shows only the new flag
- Remove the `Globe` icon and `Select` component; use a simple button + absolute-positioned dropdown

### Files to modify:
1. `src/pages/Index.tsx` -- Fix hardcoded `seller_numero` (line 172)
2. `src/pages/Login.tsx` -- Dark mode effects + compact language selector

