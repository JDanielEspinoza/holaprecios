

## Plan: WhatsApp Template Integration for Hola! Suite

### Overview
Add WhatsApp template sending for Hola! Suite quotes, similar to the existing Opa! Suite ABRINT integration but with its own API URL, Bearer token, canal ID, and event-dependent template IDs.

### Configuration

| Parameter | Value |
|---|---|
| API URL | `https://wispro.holasuite.com/api/v1/template/send` |
| Canal ID | `67cb3542f3823200bddecfd9` |
| Template — Sin Evento (NONE) | `69c59a4c721c69eda85b82d0` |
| Template — APTC26 | `69c59b3a315f1b682c3d340b` |
| Template — ABRINT26 | `69c59ba9315f1b682c3d352d` |

### Changes

**1. Store Bearer token as secret**
- Add secret `HOLA_WHATSAPP_BEARER` with the provided token.

**2. Update edge function `supabase/functions/send-whatsapp-template/index.ts`**
- Add three new entries to `EVENT_CONFIGS` for Hola! Suite, keyed by compound codes like `HOLA_NONE`, `HOLA_APTC26`, `HOLA_ABRINT26`:
  - All three share the same API URL, bearer secret name (`HOLA_WHATSAPP_BEARER`), and canal ID
  - Each has its own `templateId`

**3. Update `src/components/QuoteShare.tsx`**
- Currently the template API path is only triggered when `isOpa && eventCode === "ABRINT26"`
- Change logic: always use the template API for both Opa and Hola quotes
- For Hola quotes (`isOpa === false`), construct eventCode as `HOLA_${eventCode || "NONE"}` to match the new config keys
- For Opa quotes, keep existing `ABRINT26` key

**4. Update `src/pages/Index.tsx`**
- Pass `eventCode={eventCode}` to `<QuoteShare>` (currently missing)

### Files modified

| File | Change |
|---|---|
| `supabase/functions/send-whatsapp-template/index.ts` | Add 3 Hola! Suite event configs |
| `src/components/QuoteShare.tsx` | Route all quotes through template API with correct event key |
| `src/pages/Index.tsx` | Pass `eventCode` prop to QuoteShare |

