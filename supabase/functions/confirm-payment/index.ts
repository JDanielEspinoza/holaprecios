/**
 * ============================================================
 * ARCHITECTURE DOCUMENTATION — confirm-payment
 * ============================================================
 *
 * Request path:
 *   Browser → supabase.functions.invoke("confirm-payment")
 *          → This Edge Function
 *          → Zapier webhook (Pipedrive) at ZAPIER_WEBHOOK_URL
 *          → n8n webhook at N8N_WEBHOOK_URL (WhatsApp confirmation)
 *
 * Triggered by:
 *   - src/pages/MisCotizaciones.tsx (handleConfirmPayment function)
 *
 * Webhook URLs: Hardcoded constants below.
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

const ZAPIER_WEBHOOK_URL = "https://hooks.zapier.com/hooks/catch/26704853/uxo3v0o/";
const N8N_WEBHOOK_URL = "https://n8n.ixcsoft.com.br/webhook/pago-andinalink-confirmado";

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
    console.log(`[confirm-payment] Retry ${attempt}/${maxRetries}, waiting ${Math.round(delay)}ms`);
    await new Promise((r) => setTimeout(r, delay));
  }

  return { ok: false, status: lastStatus, attempts: maxRetries + 1, body: lastBody, headers: lastHeaders };
}

async function logWebhookError(
  targetUrl: string,
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
      request_url: redactUrl(targetUrl),
      payload_size_bytes: payloadSize,
      status_code: result.status,
      response_body_preview: result.body?.substring(0, 500) || null,
      response_headers: result.headers,
      retry_count: result.attempts,
      error_type: result.status === 0 ? "NETWORK_ERROR" : classifyError(result.status),
      user_agent: "Lovable-EdgeFunction/2.0 confirm-payment",
    });
  } catch (logErr) {
    console.error("[confirm-payment] Failed to log webhook error:", logErr);
  }
}

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

    const zapierPayload = JSON.stringify({
      company_name: company_name || "",
      cantidad_usuarios: String(cantidad_usuarios || "0"),
      products: products || "",
      agent_name: agent_name || "",
      numero_presupuesto: String(numero_presupuesto || ""),
      fecha: fecha || "",
      contacto: contacto || "",
      total: total || "$0,00",
      link_presupuesto: link_presupuesto || "",
    });

    const rawPhone = body.client_phone || contacto || "";
    const cleanPhone = rawPhone.replace(/[\s\-\+\(\)]/g, "");

    const userName = (body.client_name || company_name || "").split(" ")[0] || "Cliente";
    const agentName = agent_name || "Tu asesor";

    const n8nPayload = JSON.stringify({
      phone: cleanPhone,
      firstName: userName,
      agentName,
    });

    console.log("n8n payload:", n8nPayload);

    const [zapierRes, n8nRes] = await Promise.all([
      resilientFetch(ZAPIER_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: zapierPayload,
      }),
      resilientFetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: n8nPayload,
      }),
    ]);

    // Log failures
    const quoteId = String(numero_presupuesto || "");
    if (!zapierRes.ok) {
      await logWebhookError(ZAPIER_WEBHOOK_URL, zapierRes, zapierPayload.length, quoteId);
    }
    if (!n8nRes.ok) {
      await logWebhookError(N8N_WEBHOOK_URL, n8nRes, n8nPayload.length, quoteId);
    }

    return new Response(
      JSON.stringify({
        success: zapierRes.ok && n8nRes.ok,
        zapier: { status: zapierRes.status, response: zapierRes.body, attempts: zapierRes.attempts },
        n8n: { status: n8nRes.status, response: n8nRes.body, attempts: n8nRes.attempts },
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
