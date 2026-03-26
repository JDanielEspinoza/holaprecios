const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Event-specific webhook configuration
// When event_code is null/NONE, uses the default webhookUrl passed from the client
const EVENT_WEBHOOK_URLS: Record<string, string> = {
  // Future: add per-event webhook URLs here
  // APTC26: "https://...",
  // ABRINT26: "https://...",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, quoteHtml, webhookUrl, event_code } = await req.json();

    if (!to || !quoteHtml || !webhookUrl) {
      return new Response(JSON.stringify({ error: "Faltan campos requeridos (to, quoteHtml, webhookUrl)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Determine the actual webhook URL: use event-specific override if available
    const resolvedWebhookUrl =
      event_code && event_code !== "NONE" && EVENT_WEBHOOK_URLS[event_code]
        ? EVENT_WEBHOOK_URLS[event_code]
        : webhookUrl;

    const response = await fetch(resolvedWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to,
        subject: subject || "Tu Cotización - Hola Suite",
        html_body: quoteHtml,
        event_code: event_code || null,
        timestamp: new Date().toISOString(),
      }),
    });

    // Zapier webhooks return "success" as text
    const text = await response.text();

    return new Response(JSON.stringify({ success: true, zapier_response: text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
