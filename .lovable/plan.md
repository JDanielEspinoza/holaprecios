

## Plan: Resilient Webhook System for n8n Integration

### Phase 1 — Architecture (Investigation Complete)

The request path for all n8n calls is:

```text
Browser → supabase.functions.invoke() → Edge Function → n8n (nginx reverse proxy)
```

Three edge functions call n8n:
- `send-whatsapp` → `https://n8n.ixcsoft.com.br/webhook/cotizacion-andinalink`
- `send-registro-wispro` → `https://n8n.ixcsoft.com.br/webhook/enlace-registro`
- `confirm-payment` → `https://n8n.ixcsoft.com.br/webhook/pago-andinalink-confirmado`

One frontend call goes directly to Zapier (Pipedrive) via `fetch` with `mode: "no-cors"` in `MisCotizaciones.tsx:861`.

All three edge functions already have a basic `fetchWithRetry` (3 retries, 1s fixed delay) but it only checks `res.ok` — no exponential backoff, no jitter, no error logging, no differentiation of error types.

The 403 comes from nginx rejecting the request before it reaches n8n. Intermittent nature suggests rate limiting or WAF rules on the reverse proxy.

### Phase 2 — Architecture Documentation

Add a documentation comment block at the top of each of the 3 edge functions describing the request path and 403 root cause.

### Phase 3 — Resilient Retry in Edge Functions

Since the calls already happen server-side (edge functions), the retry logic belongs there — not in a frontend utility. Replace the existing `fetchWithRetry` in all 3 edge functions with an improved version:

- Exponential backoff: 1s, 2s, 4s
- Jitter: random 0-500ms added
- Retry on: 403, 429, 500, 502, 503, 504
- Do NOT retry: 400, 401, 404
- Timeout: 30s via `AbortController`
- Return structured response with `attempts` count

### Phase 4 — Error Logging Table

Create `webhook_errors` table via migration:

| Column | Type |
|---|---|
| id | uuid PK |
| created_at | timestamptz |
| quote_id | text |
| request_url | text (redacted) |
| payload_size_bytes | integer |
| status_code | integer |
| response_body_preview | text (500 chars) |
| response_headers | jsonb |
| retry_count | integer |
| error_type | text |
| user_agent | text |

RLS: authenticated users can INSERT. No SELECT/UPDATE/DELETE for regular users.

Each edge function will log to this table (using service role key) when all retries are exhausted.

### Phase 5 — User Experience

- During retries: edge functions return `{ success: false, retrying: true }` is not applicable since retries happen within the single edge function call.
- On final failure: the edge function returns error details. Frontend already shows error toasts via existing patterns in `QuoteShare.tsx` and `MisCotizaciones.tsx`. Add a "Reintentar" (retry) button to the toast in `MisCotizaciones.tsx` for the confirm-payment and send-whatsapp flows (QuoteShare already has retry).

### Phase 6 — Integration

- Replace `fetchWithRetry` in all 3 edge functions with the new resilient version
- Add error logging to `webhook_errors` on final failure
- No changes to quote creation logic
- No changes to payload structure (per memory constraint)

### Files to modify:
1. `supabase/functions/send-whatsapp/index.ts` — improved retry + docs + error logging
2. `supabase/functions/send-registro-wispro/index.ts` — improved retry + docs + error logging
3. `supabase/functions/confirm-payment/index.ts` — improved retry + docs + error logging
4. New migration — `webhook_errors` table with RLS
5. `src/pages/MisCotizaciones.tsx` — minor: add retry callbacks to error toasts for WhatsApp/payment flows

### NOT modified:
- No `src/utils/webhookClient.ts` (retry logic belongs in edge functions, not frontend)
- No changes to pricing, quote creation, or payload structures
- No changes to Zapier/Pipedrive integration

