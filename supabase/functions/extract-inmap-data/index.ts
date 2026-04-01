import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { image } = await req.json();
    if (!image) {
      return new Response(JSON.stringify({ error: "No image provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a data extraction assistant. You analyze screenshots from IXC Provedor system dashboards and extract specific numeric values. Always return structured data via the provided tool."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract these 3 numeric values from the screenshot:\n1. 'Total de clientes com CRM ativo' (or similar wording about active CRM clients)\n2. 'Total de logins ativos' (or similar wording about active logins)\n3. 'Total de clientes ativos' (or similar wording about active clients)\n\nReturn only the numbers, without dots or commas. If a value is not found, return 0."
              },
              {
                type: "image_url",
                image_url: { url: `data:image/png;base64,${image}` }
              }
            ]
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_metrics",
              description: "Extract the 3 metrics from the IXC dashboard screenshot",
              parameters: {
                type: "object",
                properties: {
                  clientes_crm_ativo: {
                    type: "number",
                    description: "Total de clientes com CRM ativo"
                  },
                  logins_ativos: {
                    type: "number",
                    description: "Total de logins ativos"
                  },
                  clientes_ativos: {
                    type: "number",
                    description: "Total de clientes ativos"
                  }
                },
                required: ["clientes_crm_ativo", "logins_ativos", "clientes_ativos"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "extract_metrics" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI processing failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ error: "No data extracted" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const extracted = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(extracted), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("extract-inmap-data error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
