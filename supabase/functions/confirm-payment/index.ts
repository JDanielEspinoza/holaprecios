const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ZAPIER_URL = "https://hooks.zapier.com/hooks/catch/26704853/uxo3v0o/";
const N8N_URL = "https://n8n.ixcsoft.com.br/webhook/pago-andinalink-confirmado";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      company_name,
      cantidad_usuarios,
      products,
      agent_name,
      numero_presupuesto,
      fecha,
      contacto,
      total,
      link_presupuesto,
    } = body;

    // Send to both webhooks simultaneously
    const zapierPayload = {
      company_name: company_name || "",
      cantidad_usuarios: String(cantidad_usuarios || "0"),
      products: products || "",
      agent_name: agent_name || "",
      numero_presupuesto: String(numero_presupuesto || ""),
      fecha: fecha || "",
      contacto: contacto || "",
      total: total || "$0,00",
      link_presupuesto: link_presupuesto || "",
    };

    const n8nPayload = {
      phone: body.client_phone || contacto || "",
      firstName: (body.client_name || company_name || "").split(" ")[0] || "Cliente",
      agentName: agent_name || "Tu asesor",
    };

    console.log("n8n payload:", JSON.stringify(n8nPayload));

    const [zapierRes, n8nRes] = await Promise.all([
      fetch(ZAPIER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(zapierPayload),
      }),
      fetch(N8N_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(n8nPayload),
      }),
    ]);

    const zapierText = await zapierRes.text();
    const n8nText = await n8nRes.text();

    return new Response(
      JSON.stringify({
        success: true,
        zapier: { status: zapierRes.status, response: zapierText },
        n8n: { status: n8nRes.status, response: n8nText },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
