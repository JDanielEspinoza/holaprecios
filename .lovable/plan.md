

# Plan: WhatsApp sharing, firma completa, banner fix

## 1. Boton "Compartir por WhatsApp" en QuoteShare

Add a "Compartir por WhatsApp" button in `QuoteShare.tsx` that:
- Takes the `clientPhone` prop (from the recipient fields already in Index)
- Strips spaces, dashes, and `+` from the phone number
- Opens `https://wa.me/{cleanPhone}?text={encodedMessage}` in a new tab
- The message will include a greeting and the quote URL
- Button disabled if no client phone provided, with helper text

## 2. Firma completa del vendedor en Cotizacion.tsx

Currently the quote stores `seller_name`, `seller_cargo`, `seller_numero`, `seller_email` but NOT `seller_foto`. 

**DB migration**: Add `seller_foto` column (text, nullable) to `quotes` table.

**Index.tsx**: Include `profile?.foto_url` as `seller_foto` when inserting the quote.

**Cotizacion.tsx**: Update the "Tu asesor" footer section to show:
- Profile photo (circular avatar) if available
- Name, Cargo, Numero, Email — all with icons (already partially there, just ensure all 4 show)

## 3. Banner fix for widescreen

The current banner uses `max-h-32` and `h-32` which stretches on wide screens. Fix by wrapping in a container with `max-w-screen` and using a fixed aspect ratio or capping width, and centering the image. Use a dark background behind so edges don't look broken.

Change approach: use a full-width div with `h-28 bg-[#5B2FBE]` as background, and render the banner image with `max-w-6xl mx-auto h-28 object-cover object-center` so it stays contained and elegant on any screen size.

## 4. QuoteShare receives clientPhone

Pass `clientPhone` from Index.tsx to `QuoteShare` component.

## Files to modify

| File | Change |
|---|---|
| New migration SQL | Add `seller_foto` text column to `quotes` |
| `src/pages/Index.tsx` | Pass `seller_foto` on insert, pass `clientPhone` to QuoteShare, fix banner |
| `src/pages/Cotizacion.tsx` | Show full seller profile with photo in footer |
| `src/components/QuoteShare.tsx` | Add WhatsApp button, accept `clientPhone` prop |

