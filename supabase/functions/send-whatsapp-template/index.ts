import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Event-specific WhatsApp template configurations.
 * Each entry maps an event_code to its API credentials and template payload shape.
 * To add a new event, just add another entry here.
 */
interface EventTemplateConfig {
  apiUrl: string;
  bearerSecretName: string;
  templateId: string;
  canalId: string;
}

const EVENT_CONFIGS: Record<string, EventTemplateConfig> = {
  ABRINT26: {
    apiUrl: "https://suporte.ixcsoft.com.br/api/v1/template/send",
    bearerSecretName: "ABRINT_WHATSAPP_BEARER",
    templateId: "69c592e1f54228f9ef7f51db",
    canalId: "68b761d690667efeda7ae19b",
  },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { phone, agentName, linkPresupuesto, eventCode } = body;

    if (!phone) {
      return new Response(JSON.stringify({ error: "phone is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!eventCode || !EVENT_CONFIGS[eventCode]) {
      return new Response(
        JSON.stringify({ error: `No template config for event: ${eventCode}` }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const config = EVENT_CONFIGS[eventCode];
    const bearer = Deno.env.get(config.bearerSecretName);

    if (!bearer) {
      console.error(`[send-whatsapp-template] Missing secret: ${config.bearerSecretName}`);
      return new Response(
        JSON.stringify({ error: "API credentials not configured for this event" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const payload = {
      contato: {
        canalCliente: phone,
      },
      template: {
        _id: config.templateId,
        variaveis: [agentName || "Especialista Comercial", linkPresupuesto || ""],
      },
      canal: config.canalId,
    };

    console.log(`[send-whatsapp-template] Sending to ${config.apiUrl} for event ${eventCode}`);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const res = await fetch(config.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${bearer}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const responseText = await res.text();

    if (!res.ok) {
      console.error(`[send-whatsapp-template] API error ${res.status}: ${responseText}`);

      // Log to webhook_errors table
      try {
        const sb = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );
        await sb.from("webhook_errors").insert({
          request_url: config.apiUrl,
          payload_size_bytes: JSON.stringify(payload).length,
          status_code: res.status,
          response_body_preview: responseText.substring(0, 500),
          response_headers: Object.fromEntries(res.headers.entries()),
          retry_count: 1,
          error_type: res.status >= 500 ? "SERVER_ERROR" : "CLIENT_ERROR",
          user_agent: "Lovable-EdgeFunction/1.0 send-whatsapp-template",
        });
      } catch (logErr) {
        console.error("[send-whatsapp-template] Failed to log error:", logErr);
      }
    }

    return new Response(
      JSON.stringify({
        success: res.ok,
        webhook_response: responseText,
        status_code: res.status,
      }),
      {
        status: res.ok ? 200 : 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[send-whatsapp-template] Unhandled error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
