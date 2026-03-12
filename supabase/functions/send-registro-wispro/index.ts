/**
 * ============================================================
 * ARCHITECTURE DOCUMENTATION — send-registro-wispro
 * ============================================================
 *
 * Request path:
 *   Browser → supabase.functions.invoke("send-registro-wispro")
 *          → This Edge Function
 *          → n8n webhook at https://n8n.ixcsoft.com.br/webhook/enlace-registro
 *
 * Triggered by:
 *   - src/pages/MisCotizaciones.tsx (sendRegistroWispro function)
 *
 * Webhook URL: Hardcoded constant N8N_WEBHOOK_URL below.
 *
 * Proxy/middleware: n8n sits behind an nginx reverse proxy at n8n.ixcsoft.com.br.
 *
 * Intermittent 403 root cause:
 *   The 403 response is an nginx HTML page (not JSON), meaning the reverse proxy
 *   rejects the request before it reaches n8n. Likely causes:
 *   - Rate limiting rules on nginx
 *   - WAF rules triggering on payload patterns
 *   - Temporary IP-based throttling
 *   Solution: exponential backoff with jitter to space out retries.
 * ============================================================
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const N8N_WEBHOOK_URL = "https://n8n.ixcsoft.com.br/webhook/enlace-registro";

const RETRYABLE_STATUSES = new Set([403, 429, 500, 502, 503, 504]);

function classifyError(status: number): string {
  if (status === 429) return "RATE_LIMIT";
  if (status === 403) return "FORBIDDEN";
  if (status >= 500) return "SERVER_ERROR";
  return "UNKNOWN";
}

function redactUrl(url: string): string {
  try {
    const u = new URL(url);
    return `${u.protocol}//${u.host}${u.pathname}`;
  } catch {
    return url.split("?")[0];
  }
}

interface ResilientResult {
  ok: boolean;
  status: number;
  attempts: number;
  body: string;
  headers: Record<string, string>;
}

async function resilientFetch(
  url: string,
  options: RequestInit,
  maxRetries = 3
): Promise<ResilientResult> {
  let lastStatus = 0;
  let lastBody = "";
  let lastHeaders: Record<string, string> = {};

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);

      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeout);

      lastStatus = res.status;
      lastBody = await res.text();
      lastHeaders = Object.fromEntries(res.headers.entries());

      if (res.ok) {
        return { ok: true, status: lastStatus, attempts: attempt, body: lastBody, headers: lastHeaders };
      }

      if (!RETRYABLE_STATUSES.has(res.status) || attempt > maxRetries) {
        return { ok: false, status: lastStatus, attempts: attempt, body: lastBody, headers: lastHeaders };
      }
    } catch (err) {
      lastStatus = 0;
      lastBody = err instanceof Error ? err.message : String(err);
      lastHeaders = {};

      if (attempt > maxRetries) {
        return { ok: false, status: 0, attempts: attempt, body: lastBody, headers: lastHeaders };
      }
    }

    const delay = Math.pow(2, attempt - 1) * 1000 + Math.random() * 500;
    console.log(`[send-registro-wispro] Retry ${attempt}/${maxRetries}, waiting ${Math.round(delay)}ms`);
    await new Promise((r) => setTimeout(r, delay));
  }

  return { ok: false, status: lastStatus, attempts: maxRetries + 1, body: lastBody, headers: lastHeaders };
}

async function logWebhookError(
  result: ResilientResult,
  payloadSize: number,
  quoteId?: string
) {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, serviceKey);

    await sb.from("webhook_errors").insert({
      quote_id: quoteId || null,
      request_url: redactUrl(N8N_WEBHOOK_URL),
      payload_size_bytes: payloadSize,
      status_code: result.status,
      response_body_preview: result.body?.substring(0, 500) || null,
      response_headers: result.headers,
      retry_count: result.attempts,
      error_type: result.status === 0 ? "NETWORK_ERROR" : classifyError(result.status),
      user_agent: "Lovable-EdgeFunction/2.0 send-registro-wispro",
    });
  } catch (logErr) {
    console.error("[send-registro-wispro] Failed to log webhook error:", logErr);
  }
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

    const payload = JSON.stringify({
      phone,
      firstName: firstName || "",
      agentName: agentName || "Tu asesor",
    });

    const result = await resilientFetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Lovable-EdgeFunction/2.0",
        Accept: "application/json",
      },
      body: payload,
    });

    if (!result.ok) {
      await logWebhookError(result, payload.length);
    }

    return new Response(
      JSON.stringify({
        success: result.ok,
        webhook_response: result.body,
        attempts: result.attempts,
        status_code: result.status,
      }),
      {
        status: result.ok ? 200 : 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
