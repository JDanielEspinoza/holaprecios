

## Plan: Update MisCotizaciones WhatsApp sending to use template API

### Single Change

**File: `src/pages/MisCotizaciones.tsx` (lines 366-374)**

Replace the `send-whatsapp` invocation with the template-aware version:

```typescript
const cleanPhone = q.client_phone.replace(/[\s\-\+\(\)]/g, "");
const quoteUrl = `${PUBLISHED_DOMAIN}/cotizacion?id=${q.id}`;

const isOpaQuote = (q.items || []).some((i: any) => 
  i.section === "mensalidade" || i.section === "opa_cloud"
);
const templateEventKey = isOpaQuote
  ? (q.event_code || "ABRINT26")
  : `HOLA_${q.event_code || "NONE"}`;

const { error } = await supabase.functions.invoke("send-whatsapp-template", {
  body: {
    phone: cleanPhone,
    agentName: q.seller_name || profile?.nombre || (isOpaQuote ? "Especialista Comercial" : "Tu asesor"),
    linkPresupuesto: quoteUrl,
    eventCode: templateEventKey,
  },
});
```

No other files modified.

