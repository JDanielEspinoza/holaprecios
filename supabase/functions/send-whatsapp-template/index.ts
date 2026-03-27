import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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
  HOLA_NONE: {
    apiUrl: "https://wispro.holasuite.com/api/v1/template/send",
    bearerSecretName: "HOLA_WHATSAPP_BEARER",
    templateId: "69c59a4c721c69eda85b82d0",
    canalId: "67cb3542f3823200bddecfd9",
  },
  HOLA_APTC26: {
    apiUrl: "https://wispro.holasuite.com/api/v1/template/send",
    bearerSecretName: "HOLA_WHATSAPP_BEARER",
    templateId: "69c59b3a315f1b682c3d340b",
    canalId: "67cb3542f3823200bddecfd9",
  },
  HOLA_ABRINT26: {
    apiUrl: "https://wispro.holasuite.com/api/v1/template/send",
    bearerSecretName: "HOLA_WHATSAPP_BEARER",
    templateId: "69c59ba9315f1b682c3d352d",
    canalId: "67cb3542f3823200bddecfd9",
  },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" };

  try {
    const body = await req.json();
    const { phone, agentName, linkPresupuesto, eventCode } = body;

    if (!phone) {
      return new Response(JSON.stringify({ success: false, error: "phone is required" }), {
        status: 400, headers: jsonHeaders,
      });
    }

    if (!eventCode || !EVENT_CONFIGS[eventCode]) {
      return new Response(
        JSON.stringify({ success: false, error: `No template config for event: ${eventCode}` }),
        { status: 400, headers: jsonHeaders },
      );
    }

    const config = EVENT_CONFIGS[eventCode];
    const bearer = Deno.env.get(config.bearerSecretName);

    if (!bearer) {
      console.error(`[send-whatsapp-template] ERROR: Missing secret ${config.bearerSecretName}`);
      return new Response(
        JSON.stringify({ success: false, error: "API credentials not configured for this event" }),
        { status: 500, headers: jsonHeaders },
      );
    }

    const payload = {
      contato: { canalCliente: phone },
      template: {
        _id: config.templateId,
        variaveis: [agentName || "Especialista Comercial", linkPresupuesto || ""],
      },
      canal: config.canalId,
    };

    const phoneSuffix = phone.slice(-4);
    console.log(`[send-whatsapp-template] Sending to ${config.apiUrl} for event ${eventCode} with phone ...${phoneSuffix}`);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    let res: Response;
    try {
      res = await fetch(config.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${bearer}`,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
    } catch (fetchErr) {
      clearTimeout(timeout);
      const isTimeout = fetchErr instanceof DOMException && fetchErr.name === "AbortError";
      const errMsg = isTimeout
        ? "Request timed out after 20s"
        : (fetchErr instanceof Error ? fetchErr.message : String(fetchErr));
      const stack = fetchErr instanceof Error ? fetchErr.stack : undefined;
      console.error(`[send-whatsapp-template] ERROR: ${errMsg}`, stack || "");
      return new Response(
        JSON.stringify({ success: false, error: errMsg }),
        { status: 504, headers: jsonHeaders },
      );
    }

    clearTimeout(timeout);

    const responseText = await res.text();
    const preview = responseText.length > 1000 ? responseText.substring(0, 1000) + "…" : responseText;

    if (res.ok) {
      console.log(`[send-whatsapp-template] SUCCESS status=${res.status} body=${preview}`);
    } else {
      console.error(`[send-whatsapp-template] ERROR status=${res.status} body=${preview}`);
    }

    // Try to extract messageSentId from response
    let messageSentId: string | undefined;
    try {
      const parsed = JSON.parse(responseText);
      messageSentId = parsed?._id || parsed?.id || parsed?.messageSentId;
    } catch { /* not JSON, ignore */ }

    if (!res.ok) {
      // Log to webhook_errors
      try {
        const sb = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
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

    const result: Record<string, unknown> = {
      success: res.ok,
      statusCode: res.status,
    };
    if (messageSentId) result.messageSentId = messageSentId;
    if (!res.ok) result.error = preview;

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: jsonHeaders,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    console.error(`[send-whatsapp-template] ERROR: ${message}`, stack || "");
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500, headers: jsonHeaders,
    });
  }
});
