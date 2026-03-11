const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const N8N_WEBHOOK_URL = "https://n8n.ixcsoft.com.br/webhook/enlace-registro";

// ✅ NUEVO: función de reintento automático
async function fetchWithRetry(url: string, options: RequestInit, retries = 3, delay = 1000): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, options);
    if (res.ok) return res;
    if (i < retries - 1) await new Promise((r) => setTimeout(r, delay));
  }
  return await fetch(url, options);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const body = await req.json();
    const { phone, firstName, agentName } = body;
    if (!phone) {
      return new Response(JSON.stringify({ error: "phone is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    // ✅ CAMBIO: usamos fetchWithRetry en lugar de fetch
    const response = await fetchWithRetry(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Lovable-EdgeFunction/1.0",
        Accept: "application/json",
      },
      body: JSON.stringify({
        phone,
        firstName: firstName || "",
        agentName: agentName || "Tu asesor",
      }),
    });
    const text = await response.text();
    return new Response(JSON.stringify({ success: true, webhook_response: text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
