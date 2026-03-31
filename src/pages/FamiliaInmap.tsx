import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { QuoteShare } from "@/components/QuoteShare";
import AppMenu from "@/components/AppMenu";
import EventBadge from "@/components/EventBadge";
import inmapBannerImg from "@/assets/inmap-banner.png";
import inmapServiceLogo from "@/assets/inmap-service.png";
import inmapSalesLogo from "@/assets/inmap-sales.png";
import inmapFiberdocsLogo from "@/assets/inmap-fiberdocs.png";
import { useAuth } from "@/hooks/useAuth";
import { useEvent } from "@/contexts/EventContext";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2, CheckCircle, ArrowLeft, User, Building, Phone, Mail, Settings,
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

const FamiliaInmap = () => {
  const { user } = useAuth();
  const { eventCode } = useEvent();
  const { profile } = useProfile();
  const { toast } = useToast();

  const [view, setView] = useState<ViewState>("form");
  const [cnpj, setCnpj] = useState("");
  const [configEndpoint, setConfigEndpoint] = useState("");

  // Product selections
  const [selectedProducts, setSelectedProducts] = useState({
    service: false,
    sales: false,
    fiberdocs: false,
  });

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

  const formatCNPJ = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 14);
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
    if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
    if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
  };

  const toggleProduct = (key: keyof typeof selectedProducts) => {
    setSelectedProducts((p) => {
      const next = { ...p, [key]: !p[key] };
      if (!next[key]) {
        if (key === "service") setServicePlan("");
        if (key === "sales") setSalesPlan("");
        if (key === "fiberdocs") setFiberdocsPlan("");
      }
      return next;
    });
    setQuoteId(null);
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
    setCnpj("");
    setSelectedProducts({ service: false, sales: false, fiberdocs: false });
    setServicePlan("");
    setSalesPlan("");
    setFiberdocsPlan("");
    setClientName("");
    setClientCompany("");
    setClientPhone("");
    setClientEmail("");
    setQuoteId(null);
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
          <div className="relative w-full overflow-hidden rounded-2xl shadow-2xl aspect-[5/1] md:aspect-[6/1] bg-[#1B6AAA]">
            <video src={inmapBannerVideo} className="absolute inset-0 h-[200%] w-[200%] object-cover object-[70%_75%] scale-[0.7]" autoPlay muted playsInline />
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
      <header className="w-full max-w-5xl mx-auto px-4 pt-6">
        <div className="relative w-full overflow-hidden rounded-2xl shadow-2xl aspect-[5/1] md:aspect-[6/1] bg-[#1B6AAA]">
          <video src={inmapBannerVideo} className="absolute inset-0 h-[200%] w-[200%] object-cover object-[70%_75%] scale-[0.7]" autoPlay muted playsInline />
        </div>
      </header>

      <div className="absolute top-4 left-4 z-10">
        <AppMenu />
      </div>
      <EventBadge />

      <main className="mx-auto max-w-6xl px-6 py-10 space-y-8">
        {/* CNPJ input with config gear */}
        <Card className="border-2 border-blue-500/20 bg-gradient-to-r from-blue-500/5 via-white to-blue-500/5 shadow-sm animate-fade-slide-up">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center gap-3">
              <div className="flex-1 space-y-2">
                <Label htmlFor="cnpj" className="text-sm font-medium text-gray-600">
                  CNPJ da Empresa
                </Label>
                <Input
                  id="cnpj"
                  placeholder="00.000.000/0000-00"
                  value={cnpj}
                  onChange={(e) => setCnpj(formatCNPJ(e.target.value))}
                  className="h-12 text-lg font-mono"
                />
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10 text-gray-400 hover:text-gray-600 mt-6">
                    <Settings className="h-5 w-5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-gray-700">Configuração do GET</p>
                    <p className="text-xs text-gray-500">Endpoint para consulta de CNPJ (temporário)</p>
                    <Input
                      placeholder="https://api.example.com/cnpj/"
                      value={configEndpoint}
                      onChange={(e) => setConfigEndpoint(e.target.value)}
                      className="text-xs"
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>

        {/* 3 Product cards */}
        <div className="grid grid-cols-3 gap-3 md:gap-6 animate-fade-slide-up-1">
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

        {/* Plan selectors */}
        {selectedProducts.service && (
          <Card className="animate-fade-slide-up border-green-500/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <img src={inmapServiceLogo} alt="Inmap Service" className="h-6 w-6 rounded" />
                Inmap Service — Selecione o plano
              </CardTitle>
              <p className="text-sm text-gray-500">Por logins ativos</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={servicePlan} onValueChange={(v) => { setServicePlan(v); setQuoteId(null); }}>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Selecione o plano" />
                </SelectTrigger>
                <SelectContent>
                  {inmapServiceTiers.map((t) => (
                    <SelectItem key={t.plan} value={t.plan}>
                      {t.plan} — {t.range} logins — {t.personalizado ? "Sob consulta" : fmtBRL(t.price)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedServiceTier && !selectedServiceTier.personalizado && (
                <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Mensalidade</span>
                    <span className="text-lg font-bold text-green-600">{fmtBRL(selectedServiceTier.price)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Taxa de Implantação</span>
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
              )}
              {selectedServiceTier?.personalizado && (
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-center">
                  <p className="text-sm font-semibold text-amber-700">Plano personalizado — Sob consulta</p>
                  <p className="text-xs text-amber-600 mt-1">Entre em contato para um orçamento customizado.</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {selectedProducts.sales && (
          <Card className="animate-fade-slide-up border-orange-500/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <img src={inmapSalesLogo} alt="Inmap Sales" className="h-6 w-6 rounded" />
                Inmap Sales — Selecione o plano
              </CardTitle>
              <p className="text-sm text-gray-500">Por clientes ativos + prospects + leads</p>
            </CardHeader>
            <CardContent>
              <Select value={salesPlan} onValueChange={(v) => { setSalesPlan(v); setQuoteId(null); }}>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Selecione o plano" />
                </SelectTrigger>
                <SelectContent>
                  {inmapSalesTiers.map((t) => (
                    <SelectItem key={t.plan} value={t.plan}>
                      {t.plan} — {t.range} clientes — {fmtBRL(t.price)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedSalesTier && (
                <div className="mt-4 rounded-xl bg-gray-50 border border-gray-200 p-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Mensalidade</span>
                    <span className="text-lg font-bold text-orange-600">{fmtBRL(selectedSalesTier.price)}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {selectedProducts.fiberdocs && (
          <Card className="animate-fade-slide-up border-blue-500/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <img src={inmapFiberdocsLogo} alt="Inmap Fiberdocs" className="h-6 w-6 rounded" />
                Inmap Fiberdocs — Selecione o plano
              </CardTitle>
              <p className="text-sm text-gray-500">Por logins ativos</p>
            </CardHeader>
            <CardContent>
              <Select value={fiberdocsPlan} onValueChange={(v) => { setFiberdocsPlan(v); setQuoteId(null); }}>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="Selecione o plano" />
                </SelectTrigger>
                <SelectContent>
                  {inmapFiberdocsTiers.map((t) => (
                    <SelectItem key={t.plan} value={t.plan}>
                      {t.plan} — {t.range} logins — {fmtBRL(t.price)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedFiberdocsTier && (
                <div className="mt-4 rounded-xl bg-gray-50 border border-gray-200 p-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Mensalidade</span>
                    <span className="text-lg font-bold text-blue-600">{fmtBRL(selectedFiberdocsTier.price)}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Summary */}
        {hasAnySelection && (
          <Card className="border-2 border-blue-500/30 bg-blue-50/30 animate-fade-slide-up">
            <CardHeader>
              <CardTitle className="text-xl">Resumo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedProducts.service && selectedServiceTier && (
                <div className="flex justify-between items-center text-sm">
                  <span>Inmap Service — {selectedServiceTier.plan}</span>
                  <span className="font-semibold">
                    {selectedServiceTier.personalizado ? "Sob consulta" : fmtBRL(selectedServiceTier.price)}
                  </span>
                </div>
              )}
              {selectedProducts.sales && selectedSalesTier && (
                <div className="flex justify-between items-center text-sm">
                  <span>Inmap Sales — {selectedSalesTier.plan}</span>
                  <span className="font-semibold">{fmtBRL(selectedSalesTier.price)}</span>
                </div>
              )}
              {selectedProducts.fiberdocs && selectedFiberdocsTier && (
                <div className="flex justify-between items-center text-sm">
                  <span>Inmap Fiberdocs — {selectedFiberdocsTier.plan}</span>
                  <span className="font-semibold">{fmtBRL(selectedFiberdocsTier.price)}</span>
                </div>
              )}
              <div className="border-t border-blue-200 pt-3 flex justify-between items-center">
                <span className="text-xl font-bold text-gray-700">Total Mensal</span>
                <span className="text-3xl font-bold text-blue-600">
                  {hasPersonalizado && totalMensal === 0 ? "Sob consulta" : fmtBRL(totalMensal)}
                </span>
              </div>
              {taxaImplantacao > 0 && (
                <div className="border-t border-blue-200 pt-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Taxa de Implantação (Inmap Service)</span>
                    <span className="font-bold text-gray-700">{fmtBRL(taxaImplantacao)}</span>
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
      <CardContent className="pt-3 md:pt-5 text-center">
        <div className="flex items-center justify-center mb-1.5 md:mb-2">
          <Checkbox
            checked={checked}
            className={`pointer-events-none h-4 w-4 md:h-5 md:w-5 ${
              checked ? "border-blue-500 data-[state=checked]:bg-gray-800 data-[state=checked]:border-gray-800" : ""
            }`}
          />
        </div>
        <div className="flex items-center justify-center mb-2 md:mb-3">
          <img src={logo} alt={title} className="h-20 md:h-28 w-auto object-contain rounded-2xl" />
        </div>
        {price !== null && !personalizado && (
          <>
            <p className="text-lg md:text-2xl font-bold text-foreground">{fmtBRL(price)}</p>
            <p className="text-xs text-muted-foreground mt-0.5 md:mt-1">/ mês</p>
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
