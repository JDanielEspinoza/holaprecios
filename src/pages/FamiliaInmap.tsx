import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { QuoteShare } from "@/components/QuoteShare";
import AppMenu from "@/components/AppMenu";
import EventBadge from "@/components/EventBadge";
import ixcProvedorLogo from "@/assets/ixc-provedor-branco.png";
import inmapServiceLogo from "@/assets/inmap-service.png";
import inmapSalesLogo from "@/assets/inmap-sales.png";
import inmapFiberdocsLogo from "@/assets/inmap-fiberdocs.png";
import { useAuth } from "@/hooks/useAuth";
import { useEvent } from "@/contexts/EventContext";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2, CheckCircle, ArrowLeft, User, Building, Phone, Mail, ClipboardPaste, Users, LogIn, UserCheck, ImageIcon,
} from "lucide-react";
import {
  inmapSalesTiers, inmapServiceTiers, inmapFiberdocsTiers,
  TAXA_MIN_PARCELA, TAXA_MAX_PARCELAS, TAXA_DESCONTO_PCT,
  type InmapSalesTier, type InmapServiceTier, type InmapFiberdocsTier,
} from "@/data/inmapPricing";

const PUBLISHED_DOMAIN = "https://holaprecios.lovable.app";

const fmtBRL = (n: number) =>
  "R$ " + n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

type ViewState = "form" | "loading" | "success";

/* ── Particle effect data ── */
const particles = Array.from({ length: 15 }, (_, i) => ({
  size: 3 + (i * 7 % 5),
  left: (i * 17 + 5) % 100,
  top: (i * 23 + 10) % 100,
  duration: 8 + (i % 4) * 3,
  delay: (i * 0.7) % 5,
  variant: (i % 3) + 1,
}));

/* ── Auto-plan matching ── */
function parseRange(range: string): [number, number] {
  const cleaned = range.replace(/\./g, "").replace(/,/g, "");
  const ateMatch = cleaned.match(/Até\s+(\d+)/i);
  if (ateMatch) return [0, parseInt(ateMatch[1])];
  const acimaMatch = cleaned.match(/Acima\s+de\s+(\d+)/i);
  if (acimaMatch) return [parseInt(acimaMatch[1]), Infinity];
  const rangeMatch = cleaned.match(/(\d+)\s*-\s*(\d+)/);
  if (rangeMatch) return [parseInt(rangeMatch[1]), parseInt(rangeMatch[2])];
  return [0, Infinity];
}

function findTierPlan(tiers: { plan: string; range: string }[], value: number): string {
  for (const t of tiers) {
    const [min, max] = parseRange(t.range);
    if (value >= min && value <= max) return t.plan;
  }
  return tiers[tiers.length - 1].plan;
}

const FamiliaInmap = () => {
  const { user } = useAuth();
  const { eventCode } = useEvent();
  const { profile } = useProfile();
  const { toast } = useToast();

  const [view, setView] = useState<ViewState>("form");

  // Extracted metrics
  const [extractedData, setExtractedData] = useState<{
    clientes_crm_ativo: number;
    logins_ativos: number;
    clientes_ativos: number;
  } | null>(null);
  const [pastedImage, setPastedImage] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);

  // Product selections
  const [selectedProducts, setSelectedProducts] = useState({
    service: false,
    sales: false,
    fiberdocs: false,
  });

  const [activeProduct, setActiveProduct] = useState<"service" | "sales" | "fiberdocs" | null>(null);

  // Plan selections
  const [servicePlan, setServicePlan] = useState("");
  const [salesPlan, setSalesPlan] = useState("");
  const [fiberdocsPlan, setFiberdocsPlan] = useState("");

  // Client data
  const [clientName, setClientName] = useState("");
  const [clientCompany, setClientCompany] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");

  const [quoteId, setQuoteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  /* ── Paste handler ── */
  const handlePaste = useCallback(async (e: ClipboardEvent) => {
    const items = Array.from(e.clipboardData?.items || []);
    const imageItem = items.find(i => i.type.startsWith("image"));
    if (!imageItem) return;

    e.preventDefault();
    const file = imageItem.getAsFile();
    if (!file) return;

    // Convert to base64
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setPastedImage(dataUrl);
      setExtracting(true);

      try {
        const base64 = dataUrl.split(",")[1];
        const { data, error } = await supabase.functions.invoke("extract-inmap-data", {
          body: { image: base64 },
        });

        if (error) throw error;
        if (data?.error) throw new Error(data.error);

        setExtractedData({
          clientes_crm_ativo: Number(data.clientes_crm_ativo) || 0,
          logins_ativos: Number(data.logins_ativos) || 0,
          clientes_ativos: Number(data.clientes_ativos) || 0,
        });

        toast({ title: "Dados extraídos!", description: "Os valores foram detectados automaticamente." });
      } catch (err: any) {
        toast({ title: "Erro na extração", description: err.message || "Não foi possível extrair os dados.", variant: "destructive" });
        setExtractedData(null);
      } finally {
        setExtracting(false);
      }
    };
    reader.readAsDataURL(file);
  }, [toast]);

  useEffect(() => {
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [handlePaste]);

  /* ── Auto-select plans when data is extracted ── */
  useEffect(() => {
    if (!extractedData) return;
    // Auto-select for each enabled product
    if (selectedProducts.service) {
      const plan = findTierPlan(inmapServiceTiers, extractedData.logins_ativos);
      setServicePlan(plan);
    }
    if (selectedProducts.sales) {
      const plan = findTierPlan(inmapSalesTiers, extractedData.clientes_crm_ativo);
      setSalesPlan(plan);
    }
    if (selectedProducts.fiberdocs) {
      const plan = findTierPlan(inmapFiberdocsTiers, extractedData.logins_ativos);
      setFiberdocsPlan(plan);
    }
  }, [extractedData, selectedProducts.service, selectedProducts.sales, selectedProducts.fiberdocs]);

  const selectedServiceTier = useMemo(() => {
    if (!servicePlan) return null;
    return inmapServiceTiers.find((t) => t.plan === servicePlan) || null;
  }, [servicePlan]);

  const selectedSalesTier = useMemo(() => {
    if (!salesPlan) return null;
    return inmapSalesTiers.find((t) => t.plan === salesPlan) || null;
  }, [salesPlan]);

  const selectedFiberdocsTier = useMemo(() => {
    if (!fiberdocsPlan) return null;
    return inmapFiberdocsTiers.find((t) => t.plan === fiberdocsPlan) || null;
  }, [fiberdocsPlan]);

  const totalMensal = useMemo(() => {
    let total = 0;
    if (selectedProducts.service && selectedServiceTier && !selectedServiceTier.personalizado) {
      total += selectedServiceTier.price;
    }
    if (selectedProducts.sales && selectedSalesTier) {
      total += selectedSalesTier.price;
    }
    if (selectedProducts.fiberdocs && selectedFiberdocsTier) {
      total += selectedFiberdocsTier.price;
    }
    return total;
  }, [selectedProducts, selectedServiceTier, selectedSalesTier, selectedFiberdocsTier]);

  const taxaImplantacao = useMemo(() => {
    if (!selectedProducts.service || !selectedServiceTier) return 0;
    return selectedServiceTier.taxaImplantacao;
  }, [selectedProducts.service, selectedServiceTier]);

  const taxaMaxParcelas = useMemo(() => {
    if (taxaImplantacao <= 0) return 0;
    return Math.min(TAXA_MAX_PARCELAS, Math.floor(taxaImplantacao / TAXA_MIN_PARCELA) || 1);
  }, [taxaImplantacao]);

  const toggleProduct = (key: keyof typeof selectedProducts) => {
    setSelectedProducts((p) => {
      const next = { ...p, [key]: !p[key] };
      if (!next[key]) {
        if (key === "service") setServicePlan("");
        if (key === "sales") setSalesPlan("");
        if (key === "fiberdocs") setFiberdocsPlan("");
        if (activeProduct === key) setActiveProduct(null);
      } else {
        setActiveProduct(key);
        // Auto-select plan if data is available
        if (extractedData) {
          if (key === "service") setServicePlan(findTierPlan(inmapServiceTiers, extractedData.logins_ativos));
          if (key === "sales") setSalesPlan(findTierPlan(inmapSalesTiers, extractedData.clientes_crm_ativo));
          if (key === "fiberdocs") setFiberdocsPlan(findTierPlan(inmapFiberdocsTiers, extractedData.logins_ativos));
        }
      }
      return next;
    });
    setQuoteId(null);
  };

  const expandProduct = (key: "service" | "sales" | "fiberdocs") => {
    setActiveProduct(key);
  };

  const buildItems = () => {
    const items: { label: string; value: number; section: string }[] = [];
    if (selectedProducts.service && selectedServiceTier) {
      items.push({
        label: `Inmap Service — Plano ${selectedServiceTier.plan} (${selectedServiceTier.range} logins)`,
        value: selectedServiceTier.personalizado ? 0 : selectedServiceTier.price,
        section: "inmap_service",
      });
      if (selectedServiceTier.taxaImplantacao > 0) {
        items.push({
          label: `Taxa de Implantação — ${fmtBRL(selectedServiceTier.taxaImplantacao)}`,
          value: selectedServiceTier.taxaImplantacao,
          section: "inmap_service_taxa",
        });
      } else if (selectedServiceTier.taxaImplantacao === 0) {
        items.push({
          label: "Taxa de Implantação — Gratuito",
          value: 0,
          section: "inmap_service_taxa",
        });
      }
    }
    if (selectedProducts.sales && selectedSalesTier) {
      items.push({
        label: `Inmap Sales — Plano ${selectedSalesTier.plan} (${selectedSalesTier.range} clientes)`,
        value: selectedSalesTier.price,
        section: "inmap_sales",
      });
    }
    if (selectedProducts.fiberdocs && selectedFiberdocsTier) {
      items.push({
        label: `Inmap Fiberdocs — Plano ${selectedFiberdocsTier.plan} (${selectedFiberdocsTier.range} logins)`,
        value: selectedFiberdocsTier.price,
        section: "inmap_fiberdocs",
      });
    }
    return items;
  };

  const hasAnySelection = (selectedProducts.service && servicePlan) ||
    (selectedProducts.sales && salesPlan) ||
    (selectedProducts.fiberdocs && fiberdocsPlan);

  const hasPersonalizado = selectedProducts.service && selectedServiceTier?.personalizado;

  const handleGenerateQuote = async () => {
    if (!user) return;
    setSaving(true);
    setView("loading");
    try {
      const items = buildItems();
      const usedEventCode = eventCode || "ABRINT26";

      const { data, error } = await supabase.from("quotes" as any).insert({
        user_id: user.id,
        client_name: clientName,
        client_company: clientCompany,
        client_phone: clientPhone,
        client_email: clientEmail,
        clients_count: 0,
        items: items as any,
        discount: 0,
        total: totalMensal,
        discounted_total: totalMensal,
        discount_amount: 0,
        installation_cost: taxaImplantacao > 0 ? taxaImplantacao : 0,
        seller_name: profile?.nombre || "",
        seller_cargo: profile?.cargo || "",
        seller_numero: "5549920009215",
        seller_email: profile?.email_contacto || "",
        seller_foto: profile?.foto_url || null,
        event_code: usedEventCode,
      } as any).select("id").single();

      if (error) throw error;
      setQuoteId((data as any).id);
      await new Promise((r) => setTimeout(r, 2500));
      setView("success");
      toast({ title: "Cotação gerada", description: "O QR está pronto para compartilhar." });
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
      setView("form");
    } finally {
      setSaving(false);
    }
  };

  const handleNewQuote = () => {
    setSelectedProducts({ service: false, sales: false, fiberdocs: false });
    setServicePlan("");
    setSalesPlan("");
    setFiberdocsPlan("");
    setClientName("");
    setClientCompany("");
    setClientPhone("");
    setClientEmail("");
    setQuoteId(null);
    setExtractedData(null);
    setPastedImage(null);
    setView("form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const quoteUrl = quoteId ? `${PUBLISHED_DOMAIN}/cotizacion?id=${quoteId}` : "";

  if (view === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="text-center space-y-6 animate-fade-slide-up">
          <Loader2 className="h-16 w-16 animate-spin text-blue-600 mx-auto" />
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-700">Gerando cotação...</h2>
            <p className="text-gray-500">Isso levará apenas alguns segundos</p>
          </div>
        </div>
      </div>
    );
  }

  if (view === "success" && quoteId) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="w-full max-w-5xl mx-auto px-4 pt-6">
          <div className="relative w-full overflow-hidden rounded-2xl shadow-2xl aspect-[5/1] md:aspect-[6/1] bg-[#1565a8] flex items-center">
            <img src={ixcProvedorLogo} alt="IXC Provedor" className="h-[50%] w-auto ml-8 md:ml-12" />
          </div>
        </header>
        <div className="absolute top-4 left-4 z-10">
          <AppMenu />
        </div>
        <EventBadge />

        <main className="flex-1 flex flex-col items-center justify-center px-6 py-8 max-w-lg mx-auto w-full">
          <div className="w-full space-y-6 animate-fade-slide-up">
            <div className="text-center space-y-2">
              <CheckCircle className="h-14 w-14 text-emerald-500 mx-auto" />
              <h2 className="text-2xl font-bold text-gray-700">Cotação gerada!</h2>
              <p className="text-gray-500 text-sm">Compartilhe com seu cliente via WhatsApp ou escaneando o QR</p>
            </div>

            {(clientName || clientCompany || clientPhone || clientEmail) && (
              <Card className="border border-gray-200 bg-white">
                <CardContent className="pt-4 space-y-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Destinatário</p>
                  {clientName && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <User className="h-3.5 w-3.5 text-gray-400" /><span>{clientName}</span>
                    </div>
                  )}
                  {clientCompany && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Building className="h-3.5 w-3.5" /><span>{clientCompany}</span>
                    </div>
                  )}
                  {clientPhone && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Phone className="h-3.5 w-3.5" /><span>{clientPhone}</span>
                    </div>
                  )}
                  {clientEmail && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Mail className="h-3.5 w-3.5" /><span>{clientEmail}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <QuoteShare
              quoteUrl={quoteUrl}
              clientPhone={clientPhone}
              clientName={clientName}
              agentName={profile?.nombre}
              isOpa={false}
              isAssina={false}
              isInmap
              eventCode={eventCode || "ABRINT26"}
            />

            <Button onClick={handleNewQuote} variant="outline" className="w-full gap-2 border-gray-300 text-gray-600 hover:bg-gray-50" size="lg">
              <ArrowLeft className="h-5 w-5" />
              Criar outra cotação
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // Form view
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Particle keyframes */}
      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.15; }
          25% { transform: translate(15px, -20px) scale(1.2); opacity: 0.3; }
          50% { transform: translate(-10px, -35px) scale(1); opacity: 0.2; }
          75% { transform: translate(20px, -15px) scale(0.8); opacity: 0.25; }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.1; }
          33% { transform: translate(-20px, -25px) scale(1.3); opacity: 0.25; }
          66% { transform: translate(15px, -40px) scale(0.9); opacity: 0.2; }
        }
        @keyframes float3 {
          0%, 100% { transform: translate(0, 0) scale(0.8); opacity: 0.2; }
          50% { transform: translate(25px, -30px) scale(1.1); opacity: 0.35; }
        }
      `}</style>

      <header className="w-full max-w-5xl mx-auto px-4 pt-6">
        <div className="relative w-full overflow-hidden rounded-2xl shadow-2xl aspect-[5/1] md:aspect-[6/1] bg-[#1565a8] flex items-center">
          <img src={ixcProvedorLogo} alt="IXC Provedor" className="h-[50%] w-auto ml-8 md:ml-12" />
          {/* Floating particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {particles.map((p, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white"
                style={{
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  left: `${p.left}%`,
                  top: `${p.top}%`,
                  animation: `float${p.variant} ${p.duration}s ease-in-out infinite`,
                  animationDelay: `${p.delay}s`,
                }}
              />
            ))}
          </div>
        </div>
      </header>

      <div className="absolute top-4 left-4 z-10">
        <AppMenu />
      </div>
      <EventBadge />

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-10 space-y-8">
        {/* Image Paste Area */}
        <Card className="border-2 border-blue-500/20 bg-gradient-to-r from-blue-500/5 via-white to-blue-500/5 shadow-sm animate-fade-slide-up">
          <CardContent className="pt-6 pb-6">
            {!pastedImage && !extractedData && (
              <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
                <div className="h-16 w-16 rounded-2xl bg-blue-100 flex items-center justify-center">
                  <ClipboardPaste className="h-8 w-8 text-blue-500" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-700">Cole um print do painel IXC</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Use <kbd className="px-1.5 py-0.5 rounded bg-gray-200 text-xs font-mono">Ctrl+V</kbd> ou <kbd className="px-1.5 py-0.5 rounded bg-gray-200 text-xs font-mono">⌘+V</kbd> para colar a imagem
                  </p>
                </div>
              </div>
            )}

            {extracting && (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                <p className="text-sm text-gray-600 font-medium">Extraindo dados da imagem...</p>
                {pastedImage && (
                  <img src={pastedImage} alt="Screenshot colado" className="max-h-32 rounded-lg border border-gray-200 shadow-sm" />
                )}
              </div>
            )}

            {!extracting && pastedImage && extractedData && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <img src={pastedImage} alt="Screenshot" className="h-16 w-auto rounded-lg border border-gray-200 shadow-sm" />
                  <div>
                    <p className="text-sm font-medium text-emerald-600 flex items-center gap-1.5">
                      <CheckCircle className="h-4 w-4" /> Dados extraídos com sucesso
                    </p>
                    <button
                      className="text-xs text-blue-500 hover:underline mt-1"
                      onClick={() => { setPastedImage(null); setExtractedData(null); }}
                    >
                      Colar nova imagem
                    </button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Extracted Metrics Dashboard */}
        {extractedData && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 animate-fade-slide-up">
            <MetricCard
              icon={<Users className="h-5 w-5 text-blue-500" />}
              label="Total de clientes com CRM ativo"
              value={extractedData.clientes_crm_ativo}
              color="blue"
            />
            <MetricCard
              icon={<LogIn className="h-5 w-5 text-emerald-500" />}
              label="Total de logins ativos"
              value={extractedData.logins_ativos}
              color="emerald"
            />
            <MetricCard
              icon={<UserCheck className="h-5 w-5 text-violet-500" />}
              label="Total de clientes ativos"
              value={extractedData.clientes_ativos}
              color="violet"
            />
          </div>
        )}

        {/* 3 Product cards */}
        <div className="grid grid-cols-3 gap-3 md:gap-5 animate-fade-slide-up">
          <InmapProductCard
            title="Inmap Service"
            logo={inmapServiceLogo}
            checked={selectedProducts.service}
            onToggle={() => toggleProduct("service")}
            price={selectedServiceTier && !selectedServiceTier.personalizado ? selectedServiceTier.price : null}
            personalizado={!!selectedServiceTier?.personalizado}
          />
          <InmapProductCard
            title="Inmap Sales"
            logo={inmapSalesLogo}
            checked={selectedProducts.sales}
            onToggle={() => toggleProduct("sales")}
            price={selectedSalesTier?.price || null}
          />
          <InmapProductCard
            title="Inmap Fiberdocs"
            logo={inmapFiberdocsLogo}
            checked={selectedProducts.fiberdocs}
            onToggle={() => toggleProduct("fiberdocs")}
            price={selectedFiberdocsTier?.price || null}
          />
        </div>

        {/* Plan selectors — active product expanded, others collapsed */}
        {(() => {
          const productConfigs = [
            {
              key: "service" as const,
              selected: selectedProducts.service,
              plan: servicePlan,
              tier: selectedServiceTier,
              logo: inmapServiceLogo,
              title: "Inmap Service",
              subtitle: "Por logins ativos",
              borderColor: "border-green-500/20",
              accentColor: "text-green-600",
              tiers: inmapServiceTiers,
              setPlan: (v: string) => { setServicePlan(v); setQuoteId(null); },
              renderDetails: () => selectedServiceTier && !selectedServiceTier.personalizado ? (
                <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 space-y-3">
                  <div className="flex flex-wrap justify-between items-center gap-2 text-sm">
                    <span className="text-gray-600 min-w-0">Mensalidade</span>
                    <span className="text-lg font-bold text-green-600">{fmtBRL(selectedServiceTier.price)}</span>
                  </div>
                  <div className="flex flex-wrap justify-between items-center gap-2 text-sm">
                    <span className="text-gray-600 min-w-0">Taxa de Implantação</span>
                    <span className={`font-semibold ${selectedServiceTier.taxaImplantacao === 0 ? "text-emerald-600" : "text-gray-700"}`}>
                      {selectedServiceTier.taxaImplantacao === 0 ? "Gratuito ✨" : fmtBRL(selectedServiceTier.taxaImplantacao)}
                    </span>
                  </div>
                  {selectedServiceTier.taxaImplantacao > 0 && taxaMaxParcelas > 1 && (
                    <div className="text-xs text-blue-600 bg-blue-50 rounded-lg p-2">
                      Parcelamento em até {taxaMaxParcelas}x de {fmtBRL(selectedServiceTier.taxaImplantacao / taxaMaxParcelas)}
                      {" · "}Desconto de {TAXA_DESCONTO_PCT}% disponível
                    </div>
                  )}
                </div>
              ) : selectedServiceTier?.personalizado ? (
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-center">
                  <p className="text-sm font-semibold text-amber-700">Plano personalizado — Sob consulta</p>
                  <p className="text-xs text-amber-600 mt-1">Entre em contato para um orçamento customizado.</p>
                </div>
              ) : null,
              renderItem: (t: any) => `${t.plan} — ${t.range} logins — ${t.personalizado ? "Sob consulta" : fmtBRL(t.price)}`,
              getPrice: () => selectedServiceTier && !selectedServiceTier.personalizado ? selectedServiceTier.price : null,
              getPlanLabel: () => selectedServiceTier ? selectedServiceTier.plan : "",
            },
            {
              key: "sales" as const,
              selected: selectedProducts.sales,
              plan: salesPlan,
              tier: selectedSalesTier,
              logo: inmapSalesLogo,
              title: "Inmap Sales",
              subtitle: "Por clientes ativos + prospects + leads",
              borderColor: "border-orange-500/20",
              accentColor: "text-orange-600",
              tiers: inmapSalesTiers,
              setPlan: (v: string) => { setSalesPlan(v); setQuoteId(null); },
              renderDetails: () => selectedSalesTier ? (
                <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
                  <div className="flex flex-wrap justify-between items-center gap-2 text-sm">
                    <span className="text-gray-600 min-w-0">Mensalidade</span>
                    <span className="text-lg font-bold text-orange-600">{fmtBRL(selectedSalesTier.price)}</span>
                  </div>
                </div>
              ) : null,
              renderItem: (t: any) => `${t.plan} — ${t.range} clientes — ${fmtBRL(t.price)}`,
              getPrice: () => selectedSalesTier?.price ?? null,
              getPlanLabel: () => selectedSalesTier ? selectedSalesTier.plan : "",
            },
            {
              key: "fiberdocs" as const,
              selected: selectedProducts.fiberdocs,
              plan: fiberdocsPlan,
              tier: selectedFiberdocsTier,
              logo: inmapFiberdocsLogo,
              title: "Inmap Fiberdocs",
              subtitle: "Por logins ativos",
              borderColor: "border-blue-500/20",
              accentColor: "text-blue-600",
              tiers: inmapFiberdocsTiers,
              setPlan: (v: string) => { setFiberdocsPlan(v); setQuoteId(null); },
              renderDetails: () => selectedFiberdocsTier ? (
                <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
                  <div className="flex flex-wrap justify-between items-center gap-2 text-sm">
                    <span className="text-gray-600 min-w-0">Mensalidade</span>
                    <span className="text-lg font-bold text-blue-600">{fmtBRL(selectedFiberdocsTier.price)}</span>
                  </div>
                </div>
              ) : null,
              renderItem: (t: any) => `${t.plan} — ${t.range} logins — ${fmtBRL(t.price)}`,
              getPrice: () => selectedFiberdocsTier?.price ?? null,
              getPlanLabel: () => selectedFiberdocsTier ? selectedFiberdocsTier.plan : "",
            },
          ];

          const activeConfig = activeProduct ? productConfigs.find(c => c.key === activeProduct && c.selected) : null;
          const collapsedConfigs = productConfigs.filter(c => c.selected && c.plan && c.key !== activeProduct);
          const unselectedWithoutPlan = productConfigs.filter(c => c.selected && !c.plan && c.key !== activeProduct);

          return (
            <>
              {activeConfig && (
                <Card className={`animate-fade-slide-up ${activeConfig.borderColor}`}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <img src={activeConfig.logo} alt={activeConfig.title} className="h-6 w-6 rounded" />
                      {activeConfig.title} — Selecione o plano
                    </CardTitle>
                    <p className="text-sm text-gray-500">{activeConfig.subtitle}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Select value={activeConfig.plan} onValueChange={activeConfig.setPlan}>
                      <SelectTrigger className="h-12 text-base bg-white border-gray-300 shadow-sm hover:border-gray-400 transition-colors">
                        <SelectValue placeholder="Selecione o plano" />
                      </SelectTrigger>
                      <SelectContent className="max-h-80">
                        {activeConfig.tiers.map((t: any) => (
                          <SelectItem key={t.plan} value={t.plan} className="py-3 px-4 cursor-pointer">
                            <div className="flex items-center justify-between w-full gap-4">
                              <span className="font-semibold text-gray-800 min-w-[90px]">{t.plan}</span>
                              <span className="text-gray-500 text-sm flex-1">{t.range} {activeConfig.key === "sales" ? "clientes" : "logins"}</span>
                              <span className={`font-bold ${activeConfig.accentColor} ml-auto`}>
                                {t.personalizado ? "Sob consulta" : fmtBRL(t.price)}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {activeConfig.renderDetails()}
                  </CardContent>
                </Card>
              )}

              {unselectedWithoutPlan.map(cfg => (
                <Card key={cfg.key} className={`animate-fade-slide-up ${cfg.borderColor}`} onClick={() => expandProduct(cfg.key)}>
                  <CardHeader className="cursor-pointer">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <img src={cfg.logo} alt={cfg.title} className="h-6 w-6 rounded" />
                      {cfg.title} — Selecione o plano
                    </CardTitle>
                    <p className="text-sm text-gray-500">{cfg.subtitle}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Select value={cfg.plan} onValueChange={(v) => { cfg.setPlan(v); setActiveProduct(cfg.key); }}>
                      <SelectTrigger className="h-12 text-base bg-white border-gray-300 shadow-sm hover:border-gray-400 transition-colors">
                        <SelectValue placeholder="Selecione o plano" />
                      </SelectTrigger>
                      <SelectContent className="max-h-80">
                        {cfg.tiers.map((t: any) => (
                          <SelectItem key={t.plan} value={t.plan} className="py-3 px-4 cursor-pointer">
                            <div className="flex items-center justify-between w-full gap-4">
                              <span className="font-semibold text-gray-800 min-w-[90px]">{t.plan}</span>
                              <span className="text-gray-500 text-sm flex-1">{t.range} {cfg.key === "sales" ? "clientes" : "logins"}</span>
                              <span className={`font-bold ${cfg.accentColor} ml-auto`}>
                                {(t as any).personalizado ? "Sob consulta" : fmtBRL(t.price)}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              ))}

              {collapsedConfigs.length > 0 && (
                <div className="space-y-2">
                  {collapsedConfigs.map(cfg => (
                    <div
                      key={cfg.key}
                      onClick={() => expandProduct(cfg.key)}
                      className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl cursor-pointer hover:border-blue-400 hover:shadow-sm transition-all group"
                    >
                      <img src={cfg.logo} alt={cfg.title} className="h-7 w-7 rounded-lg" />
                      <span className="font-medium text-gray-700 text-sm truncate">{cfg.title}</span>
                      <span className="text-gray-400 text-sm">—</span>
                      <span className="text-gray-500 text-sm truncate">{cfg.getPlanLabel()}</span>
                      <span className={`ml-auto font-bold text-sm whitespace-nowrap ${cfg.accentColor}`}>
                        {cfg.getPrice() !== null ? fmtBRL(cfg.getPrice()!) : "Sob consulta"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </>
          );
        })()}

        {/* Summary */}
        {hasAnySelection && (
          <Card className="border-2 border-blue-500/30 bg-blue-50/30 animate-fade-slide-up">
            <CardHeader>
              <CardTitle className="text-xl">Resumo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedProducts.service && selectedServiceTier && (
                <div className="flex flex-wrap justify-between items-center gap-1 text-xs sm:text-sm">
                  <span className="min-w-0 truncate">Inmap Service — {selectedServiceTier.plan}</span>
                  <span className="font-semibold whitespace-nowrap">
                    {selectedServiceTier.personalizado ? "Sob consulta" : fmtBRL(selectedServiceTier.price)}
                  </span>
                </div>
              )}
              {selectedProducts.sales && selectedSalesTier && (
                <div className="flex flex-wrap justify-between items-center gap-1 text-xs sm:text-sm">
                  <span className="min-w-0 truncate">Inmap Sales — {selectedSalesTier.plan}</span>
                  <span className="font-semibold whitespace-nowrap">{fmtBRL(selectedSalesTier.price)}</span>
                </div>
              )}
              {selectedProducts.fiberdocs && selectedFiberdocsTier && (
                <div className="flex flex-wrap justify-between items-center gap-1 text-xs sm:text-sm">
                  <span className="min-w-0 truncate">Inmap Fiberdocs — {selectedFiberdocsTier.plan}</span>
                  <span className="font-semibold whitespace-nowrap">{fmtBRL(selectedFiberdocsTier.price)}</span>
                </div>
              )}
              <div className="border-t border-blue-200 pt-3 flex flex-wrap justify-between items-center gap-2">
                <span className="text-lg sm:text-xl font-bold text-gray-700">Total Mensal</span>
                <span className="text-2xl sm:text-3xl font-bold text-blue-600 whitespace-nowrap">
                  {hasPersonalizado && totalMensal === 0 ? "Sob consulta" : fmtBRL(totalMensal)}
                </span>
              </div>
              {taxaImplantacao > 0 && (
                <div className="border-t border-blue-200 pt-3">
                  <div className="flex flex-wrap justify-between items-center gap-1 text-xs sm:text-sm">
                    <span className="text-gray-600 min-w-0">Taxa de Implantação (Inmap Service)</span>
                    <span className="font-bold text-gray-700 whitespace-nowrap">{fmtBRL(taxaImplantacao)}</span>
                  </div>
                  {taxaMaxParcelas > 1 && (
                    <p className="text-xs text-blue-600 mt-1">
                      Parcelamento em até {taxaMaxParcelas}x de {fmtBRL(taxaImplantacao / taxaMaxParcelas)}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Client fields */}
        <Card className="animate-fade-slide-up">
          <CardHeader>
            <CardTitle className="text-lg">Dados do destinatário (opcional)</CardTitle>
            <p className="text-sm text-gray-500">Preencha os dados do cliente para personalizar a cotação</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Nome</Label>
                <Input id="clientName" placeholder="Nome do cliente" value={clientName} onChange={(e) => { setClientName(e.target.value); setQuoteId(null); }} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientCompany">Empresa</Label>
                <Input id="clientCompany" placeholder="Nome da empresa" value={clientCompany} onChange={(e) => { setClientCompany(e.target.value); setQuoteId(null); }} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientPhone">Telefone</Label>
                <Input id="clientPhone" placeholder="Telefone de contato" value={clientPhone} onChange={(e) => { setClientPhone(e.target.value); setQuoteId(null); }} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clientEmail">Email</Label>
                <Input id="clientEmail" placeholder="Email de contato" type="email" value={clientEmail} onChange={(e) => { setClientEmail(e.target.value); setQuoteId(null); }} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Generate */}
        <Button
          onClick={handleGenerateQuote}
          disabled={saving || !hasAnySelection}
          className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700 text-white"
          size="lg"
        >
          Gerar Cotação
        </Button>
      </main>
    </div>
  );
};

/* ── Metric Card component ── */
function MetricCard({ icon, label, value, color }: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: "blue" | "emerald" | "violet";
}) {
  const bgColor = color === "blue" ? "bg-blue-50" : color === "emerald" ? "bg-emerald-50" : "bg-violet-50";
  const textColor = color === "blue" ? "text-blue-700" : color === "emerald" ? "text-emerald-700" : "text-violet-700";

  return (
    <Card className={`${bgColor} border-0 shadow-sm`}>
      <CardContent className="pt-4 pb-4 px-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">{icon}</div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-500 leading-tight">{label}</p>
            <p className={`text-2xl sm:text-3xl font-bold ${textColor} mt-1`}>
              {value.toLocaleString("pt-BR")}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Product Card ── */
function InmapProductCard({
  title, logo, checked, onToggle, price, personalizado = false,
}: {
  title: string;
  logo: string;
  checked: boolean;
  onToggle: () => void;
  price: number | null;
  personalizado?: boolean;
}) {
  return (
    <Card
      className={`cursor-pointer transition-all shadow-sm hover:shadow-md ${
        checked ? "ring-2 ring-blue-500 border-blue-500" : ""
      }`}
      onClick={onToggle}
    >
      <CardContent className="pt-2 md:pt-3 pb-3 text-center">
        <div className="flex items-center justify-center mb-1 md:mb-1.5">
          <Checkbox
            checked={checked}
            className={`pointer-events-none h-4 w-4 md:h-5 md:w-5 ${
              checked ? "border-blue-500 data-[state=checked]:bg-gray-800 data-[state=checked]:border-gray-800" : ""
            }`}
          />
        </div>
        <div className="flex items-center justify-center mb-1.5 md:mb-2">
          <img
            src={logo}
            alt={title}
            className="h-16 sm:h-20 md:h-24 w-auto object-contain rounded-2xl"
            style={{ imageRendering: "auto" }}
          />
        </div>
        {price !== null && !personalizado && (
          <>
            <p className="text-base sm:text-lg md:text-2xl font-bold text-foreground">{fmtBRL(price)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">/ mês</p>
          </>
        )}
        {personalizado && (
          <p className="text-sm font-semibold text-amber-600">Sob consulta</p>
        )}
      </CardContent>
    </Card>
  );
}

export default FamiliaInmap;
