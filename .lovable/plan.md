

## Plan: Multiple improvements across the app

### 1. Phone number locked to +5492615783684
- In `Perfil.tsx`: Remove the phone input field and replace with a read-only display showing the fixed number `+5492615783684`.
- In `handleGenerateQuote` (Index.tsx line ~171): Hard-code `seller_numero: "+5492615783684"` instead of reading from profile.
- In `Cotizacion.tsx`: The seller phone already comes from the saved quote data, so new quotes will have the correct number.

### 2. Delete user "Larissa Elizabeth" (sucu1985@gmail.com)
- Run a database query to find and delete this user's profile and auth record. Will use the migration tool to delete from `profiles` where `email_contacto = 'sucu1985@gmail.com'`, and a backend function to delete the auth user.

### 3. Fix AppMenu position on Perfil page
- Currently the hamburger is inside a flex container with no fixed positioning. Will change it to `fixed top-4 left-4 z-50` like other pages (Index.tsx pattern), so it's always accessible.

### 4. Add particle effect to the banner/header
- Apply the same floating particle animation from Login.tsx over the banner image in Index.tsx (both form and success views). Will overlay the particles on the header area with `position: relative` and the same keyframes.

### 5. Fix "Enlace de Registro Wispro" in QuoteShare component
- The `handleRegistroWispro` in `QuoteShare.tsx` calls the n8n webhook directly (CORS issue). Replace with `supabase.functions.invoke("send-registro-wispro", ...)` — same fix that was applied to MisCotizaciones.

### 6. Update footer text in Cotizacion.tsx
- Change line 249 from "Cotización válida hasta el 12 de Marzo, mientras dure el evento Andina Link." to "Cotización válida durante todo el mes de Marzo."

### 7. Add Wispro + IXC logo above product emblems in Cotizacion.tsx
- The `logoWisproIxc` is already imported and displayed (line 106). Will make it larger (`h-20` or bigger) and ensure it's centered and prominent on both mobile and desktop. It's already above the product logos section.

### 8. Copy uploaded Wispro + IXC logo
- Copy `user-uploads://logo_w_i-3.png` to `src/assets/logo-wispro-ixc.png` to use the updated logo the user provided.

### Files to modify:
- `src/pages/Perfil.tsx` — Remove phone field, fix menu position
- `src/pages/Index.tsx` — Hard-code phone, add particle effect to header
- `src/pages/Cotizacion.tsx` — Update footer text, enlarge top logo
- `src/components/QuoteShare.tsx` — Fix registro link to use edge function
- `src/assets/logo-wispro-ixc.png` — Replace with uploaded logo
- Database migration to delete "Larissa Elizabeth" user

