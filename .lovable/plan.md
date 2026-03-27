

## Plan: Fix missing columns + Update WhatsApp number for Opa! Suite

### Step 1 — Database Migration
Add the two missing columns to `quotes`:
```sql
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS adesao_payment_type text DEFAULT 'vista';
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS adesao_installments integer NULL;
```
This resolves the schema cache error.

### Step 2 — Update WhatsApp number in Cotizacion.tsx
In `src/pages/Cotizacion.tsx` (line 370), change the Opa! Suite WhatsApp phone from `5492615783684` to `554931991780` for the confirmation button. The number only changes for Opa quotes; Hola quotes keep the current number.

Current:
```typescript
window.open(`https://api.whatsapp.com/send?phone=5492615783684&text=...`)
```
Change to conditionally use `554931991780` when `isOpaQuote` is true.

### Step 3 — No UI changes needed for payment buttons
The payment type buttons (À Vista / Parcelado) and installment logic already exist in `OpaSuite.tsx` (lines 80-81, 118-128). The `handleGenerateQuote` already saves `adesao_payment_type` and `adesao_installments` (lines 201-202). Once the migration runs, this will work.

### Files modified
| File | Change |
|---|---|
| DB migration | Add `adesao_payment_type` and `adesao_installments` columns |
| `src/pages/Cotizacion.tsx` | Use `554931991780` for Opa quotes WhatsApp confirmation |

