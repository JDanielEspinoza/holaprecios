

## Plan: Multi-fix batch (Auth, Webhooks, UI, InMap logo)

This plan addresses 8 distinct items in a single implementation pass.

---

### 1. Fix `onAuthStateChange` deadlock risk (`src/hooks/useAuth.tsx`)
- The current callback is already synchronous (no `async`), which is correct per Supabase docs.
- Ensure `onAuthStateChange` is set up BEFORE `getSession()` (already the case).
- No changes needed here -- the current implementation is safe.

### 2. Signup redirects to login (`src/pages/Login.tsx`)
- After successful `signUp`, reset form to login mode (`setIsRegister(false)`) and show the confirmation toast.
- Do NOT auto-login after signup (email confirmation required).

### 3. Centralize webhook URLs as constants

**Edge functions** (3 files):
- `send-whatsapp/index.ts`: Replace `Deno.env.get("N8N_WEBHOOK_URL")` with hardcoded constant `https://n8n.ixcsoft.com.br/webhook/cotizacion-andinalink`
- `send-registro-wispro/index.ts`: Already hardcodes `https://n8n.ixcsoft.com.br/webhook/enlace-registro` -- move to top-level constant.
- `confirm-payment/index.ts`: Already hardcodes both URLs -- move to top-level constants.

**Client-side** (`src/pages/MisCotizaciones.tsx`):
- The Zapier URL `https://hooks.zapier.com/hooks/catch/26704853/uxo3v0o/` is hardcoded inline at line 860. Move to a constant at the top of the file.

Each file will have its own constants block at the top. The URLs will not be duplicated across files.

### 4. Fullscreen onboarding (`src/components/WelcomeTutorial.tsx`)
- Replace the `Dialog` component with a fullscreen overlay (`fixed inset-0 z-50 bg-background`).
- Keep the slide carousel and progress bar, but render them centered in the full viewport.

### 5. Responsive "Personaliza tu Hola" section (`src/pages/Index.tsx`)
- The Hola customization card (lines 340-448) uses a 2-column grid that breaks on mobile.
- Fix the addon row layout: on small screens, stack the service name above the quantity/price controls instead of using `flex justify-between` in a single row.
- Adjust the header columns to hide on mobile.

### 6. White hamburger menu icon (`src/components/AppMenu.tsx`)
- Change the `Menu` icon button to use `text-white` class.

### 7. Login woman image -- looking at phone, relaxed, leaning right
- This requires replacing the `login-woman.png` asset. Since I cannot generate photographic images, I will adjust the CSS to mirror/transform the existing image so she appears to lean toward the login card. Apply a subtle `scaleX(-1)` transform if needed to change gaze direction, or adjust positioning.
- Alternative: Note to user that a new image asset would be needed for a true pose change.

### 8. Cotizacion page -- Summary items left-aligned in column (`src/pages/Cotizacion.tsx`)
- Below "Total Mensual", add a summary list of selected items in a single column, left-aligned (text-left, items stacked vertically).

### 9. Replace InMap sphere with uploaded image (`src/components/FloatingLogos.tsx`)
- Copy `user-uploads://inmaplogo.jpg` to `src/assets/logo-inmap-sphere.png` (overwrite).
- Set InMap's `bg` to `"transparent"` (the uploaded image already has the green circle).
- Reposition InMap to the right side, around 2-3 o'clock position: `top: "20%"`, `left: "72%"`.

---

### Files to modify:
1. `src/pages/Login.tsx` -- signup flow reset
2. `supabase/functions/send-whatsapp/index.ts` -- webhook constant
3. `supabase/functions/send-registro-wispro/index.ts` -- webhook constant
4. `supabase/functions/confirm-payment/index.ts` -- webhook constants
5. `src/pages/MisCotizaciones.tsx` -- Zapier URL constant
6. `src/components/WelcomeTutorial.tsx` -- fullscreen onboarding
7. `src/pages/Index.tsx` -- responsive Hola section + summary layout
8. `src/components/AppMenu.tsx` -- white menu icon
9. `src/components/FloatingLogos.tsx` -- InMap position + new asset
10. `src/pages/Cotizacion.tsx` -- summary items column
11. `src/assets/logo-inmap-sphere.png` -- replaced with uploaded image

