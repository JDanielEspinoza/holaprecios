import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, User, Briefcase, Phone, Mail, Loader2, Building } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import logoHola from "@/assets/logo-hola.png";
import logoWispro from "@/assets/logo-wispro.png";
import logoAcs from "@/assets/logo-acs.png";
import logoWisproIxc from "@/assets/logo-wispro-ixc.png";
import { supabase } from "@/integrations/supabase/client";

const fmt = (n: number) =>
  "$" + n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtClients = (n: number) => n.toLocaleString("es-AR");

interface LineItem {
  label: string;
  value: number;
  section: string;
  discount_pct?: number;
}

interface QuoteData {
  clients_count: number;
  items: LineItem[];
  discount: number;
  total: number;
  discounted_total: number;
  discount_amount: number;
  installation_cost: number;
  seller_name: string;
  seller_cargo: string;
  seller_numero: string;
  seller_email: string;
  seller_foto: string | null;
  client_name: string;
  client_company: string;
  client_phone: string;
  client_email: string;
  created_at: string;
}

const Cotizacion = () => {
  const [params] = useSearchParams();
  const [data, setData] = useState<QuoteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const id = params.get("id");
    if (!id) { setLoading(false); setError(true); return; }

    supabase.from("quotes" as any).select("*").eq("id", id).single()
      .then(({ data: row, error: err }) => {
        if (err || !row) { setError(true); }
        else { setData(row as any); }
        setLoading(false);
      });
  }, [params]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Cotización no encontrada.</p>
      </div>
    );
  }

  const items = (data.items || []) as LineItem[];
  const ecosystem = items.filter((i) => i.section === "eco");
  const hola = items.filter((i) => i.section === "hola");
  const cloud = items.filter((i) => i.section === "cloud");
  const hasDiscount = data.discount_amount > 0;
  const finalTotal = hasDiscount ? data.discounted_total : data.total;

  // Determine which product logos to show
  const hasWispro = ecosystem.some((i) => i.label === "Wispro");
  const hasAcs = ecosystem.some((i) => i.label === "ACS");
  const hasHola = ecosystem.some((i) => i.label.includes("Hola"));

  return (
    <>
      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          .print-container { padding: 0 !important; }
          .print-card { border: none !important; box-shadow: none !important; }
        }
      `}</style>
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 print-container">
        <Card className="w-full max-w-lg bg-white border border-gray-200 shadow-premium print-card animate-fade-slide-up">
          <CardHeader className="text-center pb-4">
            {/* Company logo */}
            <div className="flex justify-center mb-4">
              <img src={logoWisproIxc} alt="Wispro + IXC" className="h-10 w-auto object-contain" />
            </div>
            <CardTitle className="text-xl text-black-500">Resumen de Cotización</CardTitle>
            <p className="text-sm text-gray-500">
              Detalle para {fmtClients(data.clients_count)} clientes
            </p>
            {/* Product logos */}
            {(hasWispro || hasAcs || hasHola) && (
              <div className="flex justify-center items-center gap-3 mt-3 pt-3 border-t border-gray-200">
                <span className="text-xs text-gray-400 mr-1">Productos:</span>
                {hasWispro && <img src={logoWispro} alt="Wispro" className="h-8 w-auto object-contain" />}
                {hasAcs && <img src={logoAcs} alt="ACS" className="h-8 w-auto object-contain" />}
                {hasHola && <img src={logoHola} alt="Hola Suite" className="h-8 rounded-lg w-auto object-contain" />}
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Client info */}
            {(data.client_name || data.client_company) && (
              <div className="space-y-1 pb-2">
                {data.client_name && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <User className="h-3.5 w-3.5 text-gray-400" />
                    <span className="font-medium">{data.client_name}</span>
                  </div>
                )}
                {data.client_company && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Building className="h-3.5 w-3.5" />
                    <span>{data.client_company}</span>
                  </div>
                )}
              </div>
            )}

            {ecosystem.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Ecosistema</h3>
                {ecosystem.map((item) => (
                  <CotizacionLine key={item.label} label={item.label} value={item.value} />
                ))}
              </div>
            )}

            {hola.length > 0 && (
              <div className="border-t border-gray-200 pt-3 space-y-2">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Personalización Hola</h3>
                {hola.map((item) => <CotizacionLine key={item.label} label={item.label} value={item.value} />)}
              </div>
            )}

            {cloud.length > 0 && (
              <div className="border-t border-gray-200 pt-3 space-y-2">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Cloud</h3>
                {cloud.map((item) => <CotizacionLine key={item.label} label={item.label} value={item.value} />)}
              </div>
            )}

            <div className="border-t-2 border-orange-500/30 pt-4 space-y-3">
              {/* Discount banner */}
              {hasDiscount && (
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-center space-y-1">
                  <p className="text-sm font-medium text-emerald-700">
                    🎉 Descuentos especiales por cierre en Andina Link
                  </p>
                  <p className="text-xs text-emerald-600">
                    Wispro 20% · ACS 5% · Hola! Suite 5% — Válido por 1 año
                  </p>
                </div>
              )}

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xl font-bold text-black-500">Total Mensual</p>
                  <p className="text-xs text-gray-500">Ecosistema + Personalización + Cloud</p>
                </div>
                <div className="text-right">
                  {hasDiscount && (
                    <p className="text-lg text-gray-400 line-through">{fmt(data.total)}</p>
                  )}
                  <p className="text-4xl font-bold text-orange-500">{fmt(finalTotal)}</p>
                </div>
              </div>
            </div>

            {/* Implementation with feria discount */}
            <div className="border-t border-gray-200 pt-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Pago de Implementación (único pago)</p>
                  <p className="text-xs text-emerald-600">
                    Para clientes que cierren durante la feria, aplicamos una condición especial de 75% de descuento
                  </p>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p className="text-sm text-gray-400 line-through">{fmt(data.installation_cost * 4)}</p>
                  <p className="text-lg font-bold text-gray-700">{fmt(data.installation_cost)}</p>
                </div>
              </div>
            </div>

            {/* Seller profile footer */}
            {(data.seller_name || data.seller_cargo || data.seller_numero || data.seller_email) && (
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tu asesor</p>
                <div className="flex items-start gap-3">
                  <Avatar className="h-14 w-14 border-2 border-orange-500/20">
                    {data.seller_foto ? (
                      <AvatarImage src={data.seller_foto} alt={data.seller_name || "Asesor"} />
                    ) : null}
                    <AvatarFallback className="text-lg font-bold bg-orange-500/10 text-orange-600">
                      {(data.seller_name || "?").charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-0.5">
                    {data.seller_name && <p className="text-sm font-semibold text-gray-700">{data.seller_name}</p>}
                    {data.seller_cargo && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Briefcase className="h-3 w-3" /><span>{data.seller_cargo}</span>
                      </div>
                    )}
                    {data.seller_numero && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Phone className="h-3 w-3" /><span>{data.seller_numero}</span>
                      </div>
                    )}
                    {data.seller_email && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Mail className="h-3 w-3" /><span>{data.seller_email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="border-t border-gray-200 pt-4">
              <p className="text-xs text-center text-gray-500 italic">
                Cotización válida hasta el 12 de Marzo, mientras dure el evento Andina Link.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action buttons - moved to bottom */}
        <div className="w-full max-w-lg mt-4 no-print space-y-2 animate-fade-slide-up">
          <Button onClick={() => window.print()} className="w-full gap-2 bg-orange-500 hover:bg-orange-600 text-white" size="lg">
            <Download className="h-5 w-5" />
            Descargar PDF
          </Button>
          <Button
            onClick={() => {
              const id = params.get("id") || "";
              const quoteUrl = `https://holaprecios.lovable.app/cotizacion?id=${id}`;
              const sellerName = data?.seller_name || "tu asesor";
              const text = `Hola! Recibí esta cotización de parte de ${sellerName} en Andina Link y me gustaría confirmar el valor que recibí! ${quoteUrl}`;
              window.open(`https://api.whatsapp.com/send?phone=5492615783684&text=${encodeURIComponent(text)}`, "_blank");
            }}
            className="w-full gap-2 bg-[#25D366] hover:bg-[#1da851] text-white"
            size="lg"
          >
            <Phone className="h-5 w-5" />
            Deseo confirmar mi cotización
          </Button>
        </div>
      </div>
    </>
  );
};

function CotizacionLine({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between items-center text-sm py-1 text-foreground">
      <span>{label}</span>
      <span className="font-semibold">{fmt(value)}</span>
    </div>
  );
}

export default Cotizacion;
