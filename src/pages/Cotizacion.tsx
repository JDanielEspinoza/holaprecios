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
import logoOpa from "@/assets/logo-opa-suite-3.png";
import { supabase } from "@/integrations/supabase/client";

const fmt = (n: number, isOpa: boolean = false) =>
  isOpa
    ? "R$ " + n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : "$" + n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtClients = (n: number, isOpa: boolean = false) =>
  n.toLocaleString(isOpa ? "pt-BR" : "es-AR");

const getMaxInstallments = (val: number) => {
  if (val <= 854) return 2;
  if (val <= 1590) return 3;
  if (val <= 2650) return 4;
  return 6;
};

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
  event_code: string | null;
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
        <p className="text-muted-foreground">Cotação não encontrada.</p>
      </div>
    );
  }

  const items = (data.items || []) as LineItem[];
  const ecosystem = items.filter((i) => i.section === "eco");
  const hola = items.filter((i) => i.section === "hola");
  const cloud = items.filter((i) => i.section === "cloud");
  const mensalidade = items.filter((i) => i.section === "mensalidade");
  const adesao = items.filter((i) => i.section === "adesao");
  const hasDiscount = data.discount_amount > 0;
  const finalTotal = hasDiscount ? data.discounted_total : data.total;
  const hasWispro = ecosystem.some((i) => i.label === "Wispro");
  const hasAcs = ecosystem.some((i) => i.label === "ACS");
  const hasHola = ecosystem.some((i) => i.label.includes("Hola"));
  const isOpaQuote = items.some((i) => i.section === "mensalidade");
  const f = (n: number) => fmt(n, isOpaQuote);
  const fc = (n: number) => fmtClients(n, isOpaQuote);

  // For Opa: compute monthly total (mensalidade + cloud only)
  const opaMonthlyTotal = isOpaQuote
    ? [...mensalidade, ...cloud].reduce((sum, i) => sum + i.value, 0)
    : 0;

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
              {isOpaQuote ? (
                <img src={logoOpa} alt="Opa! Suite" className="h-24 md:h-28 w-auto object-contain mb-2 rounded-xl" />
              ) : (
                <img src={logoWisproIxc} alt="Wispro + IXC" className="h-24 md:h-28 w-auto object-contain mb-2" />
              )}
            </div>
            <CardTitle className="text-xl text-black-500">
              {isOpaQuote ? "Resumo da Cotação" : "Resumen de Cotización"}
            </CardTitle>
            <p className="text-sm text-gray-500">
              {isOpaQuote
                ? `Detalhe para ${fc(data.clients_count)} clientes`
                : `Detalle para ${fc(data.clients_count)} clientes`}
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

            {/* Opa! sections */}
            {isOpaQuote && (
              <>
                {mensalidade.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Mensalidade</h3>
                    {mensalidade.map((item) => (
                      <CotizacionLine key={item.label} label={item.label} value={item.value} isOpa />
                    ))}
                  </div>
                )}
                {cloud.length > 0 && (
                  <div className="border-t border-gray-200 pt-3 space-y-2">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Opa! Cloud</h3>
                    {cloud.map((item) => <CotizacionLine key={item.label} label={item.label} value={item.value} isOpa />)}
                  </div>
                )}

                {/* Total Mensal */}
                <div className="border-t-2 border-orange-500/30 pt-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xl font-bold text-black-500">Total Mensal</p>
                      <p className="text-xs text-gray-500">Mensalidade + Cloud</p>
                    </div>
                    <p className="text-4xl font-bold text-orange-500">{f(opaMonthlyTotal)}</p>
                  </div>
                  {/* Summary of monthly items */}
                  <div className="mt-3 space-y-1">
                    {[...mensalidade, ...cloud].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="h-1 w-1 rounded-full bg-orange-400 flex-shrink-0" />
                        <span>{item.label}</span>
                        <span className="ml-auto font-medium text-gray-600">{f(item.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Adesão section - separate */}
                {adesao.length > 0 && (
                  <div className="border-t-2 border-gray-300 pt-4 space-y-2">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Adesão (pagamento único)</p>
                    {adesao.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm py-0.5">
                        <span className="text-gray-700">{item.label}</span>
                        <span className="font-semibold text-gray-700">{item.value > 0 ? f(item.value) : "Sob avaliação"}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                      <span className="font-semibold text-gray-700">Total Adesão</span>
                      <span className="text-lg font-bold text-gray-700">{f(data.installation_cost)}</span>
                    </div>
                    {data.installation_cost > 0 && (
                      <p className="text-sm text-orange-600 font-medium text-center mt-1">
                        Parcelamento em até {getMaxInstallments(data.installation_cost)}x de {f(data.installation_cost / getMaxInstallments(data.installation_cost))}
                      </p>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Wispro sections */}
            {!isOpaQuote && (
              <>
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
                  {hasDiscount && (
                    <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-center space-y-1">
                      <p className="text-sm font-medium text-emerald-700">
                        🎉 Tu Asesor te ha otorgado un <span className="font-bold text-emerald-800">{data.discount}%</span> de descuento
                      </p>
                      <p className="text-xs text-emerald-600">
                        Paquete integrado con {ecosystem.length} {ecosystem.length === 1 ? "producto" : "productos"} — Válido por 1 año
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
                        <p className="text-lg text-gray-400 line-through">{f(data.total)}</p>
                      )}
                      <p className="text-4xl font-bold text-orange-500">{f(finalTotal)}</p>
                    </div>
                  </div>

                  {items.filter(i => i.section !== "adesao").length > 0 && (
                    <div className="mt-3 space-y-1">
                      {items.filter(i => i.section !== "adesao").map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="h-1 w-1 rounded-full bg-orange-400 flex-shrink-0" />
                          <span>{item.label}</span>
                          <span className="ml-auto font-medium text-gray-600">{f(item.value)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Implementation */}
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">Pago de Implementación (único pago)</p>
                      {(() => {
                        const appCount = ecosystem.length;
                        return appCount > 0 ? (
                          <p className="text-xs text-emerald-600">
                            {appCount} {appCount === 1 ? "aplicación" : "aplicaciones"} × $50 (75% dto. sobre $200/app)
                          </p>
                        ) : null;
                      })()}
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <p className="text-sm text-gray-400 line-through">{f(data.installation_cost * 4)}</p>
                      <p className="text-lg font-bold text-gray-700">{f(data.installation_cost)}</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Seller profile footer */}
            {(data.seller_name || data.seller_cargo || data.seller_numero || data.seller_email) && (
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {isOpaQuote ? "Especialista Comercial" : "Tu asesor"}
                </p>
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

          </CardContent>
        </Card>

        {/* Action buttons */}
        <div className="w-full max-w-lg mt-4 no-print space-y-2 animate-fade-slide-up">
          <Button onClick={() => window.print()} className="w-full gap-2 bg-orange-500 hover:bg-orange-600 text-white" size="lg">
            <Download className="h-5 w-5" />
            {isOpaQuote ? "Baixar PDF" : "Descargar PDF"}
          </Button>
          <Button
            onClick={() => {
              const id = params.get("id") || "";
              const quoteUrl = `https://holaprecios.lovable.app/cotizacion?id=${id}`;
              const sellerName = data?.seller_name || (isOpaQuote ? "seu especialista" : "tu asesor");
              const eventName = data?.event_code && data.event_code !== "NONE"
                ? ({"ANDINA26":"Andina Link 2026","APTC26":"APTC Cumbre 2026","ABRINT26":"Abrint 2026"} as Record<string,string>)[data.event_code] || data.event_code
                : null;
              const eventSuffix = eventName
                ? (isOpaQuote ? ` no evento ${eventName}` : ` en el evento ${eventName}`)
                : "";
              const text = isOpaQuote
                ? `Olá! Recebi esta cotação de ${sellerName}${eventSuffix} e gostaria de confirmar o valor! ${quoteUrl}`
                : `Hola! Recibí esta cotización de parte de ${sellerName}${eventSuffix} y me gustaría confirmar el valor que recibí! ${quoteUrl}`;
              const whatsappPhone = isOpaQuote ? "554931991780" : "5492615783684";
              window.open(`https://api.whatsapp.com/send?phone=${whatsappPhone}&text=${encodeURIComponent(text)}`, "_blank");
            }}
            className="w-full gap-2 bg-[#25D366] hover:bg-[#1da851] text-white"
            size="lg"
          >
            <Phone className="h-5 w-5" />
            {isOpaQuote ? "Desejo confirmar minha cotação" : "Deseo confirmar mi cotización"}
          </Button>
        </div>
      </div>
    </>
  );
};

function CotizacionLine({ label, value, isOpa = false }: { label: string; value: number; isOpa?: boolean }) {
  return (
    <div className="flex justify-between items-center text-sm py-1 text-foreground">
      <span>{label}</span>
      <span className="font-semibold">{fmt(value, isOpa)}</span>
    </div>
  );
}

export default Cotizacion;
