const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, quoteHtml, webhookUrl } = await req.json();

    if (!to || !quoteHtml || !webhookUrl) {
      return new Response(JSON.stringify({ error: "Faltan campos requeridos (to, quoteHtml, webhookUrl)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to,
        subject: subject || "Tu Cotización - Hola Suite",
        html_body: quoteHtml,
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
