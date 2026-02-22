import { Resend } from "npm:resend@4.0.0";

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
    const { to, subject, quoteHtml } = await req.json();

    if (!to || !quoteHtml) {
      return new Response(JSON.stringify({ error: "Missing 'to' or 'quoteHtml'" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resend = new Resend(resendKey);

    const { data, error } = await resend.emails.send({
      from: "Cotizador Hola <onboarding@resend.dev>",
      to: [to],
      subject: subject || "Tu Cotización - Hola Suite",
      html: quoteHtml,
    });

    if (error) {
      const msg = error.message || "";
      if (msg.includes("only send testing emails")) {
        return new Response(JSON.stringify({ 
          error: "Resend está en modo sandbox. Solo podés enviar emails a tu propia cuenta verificada. Para enviar a cualquier destinatario, verificá un dominio en resend.com/domains." 
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: msg }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, id: data?.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
