import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { pricingTiers } from "@/data/pricing";
import {
  opaBasePrice, opaAddons, opaCloudPlans, getMinOpaCloudPlanIndex,
  adesaoBasicaPrice, fluxoBasicoPrice, opaAdesaoExtras, opaMensalidadeGroups,
  opaHourlyAdesaoItems,
} from "@/data/opaPricing";
import { Users, Cloud, Plus, Minus, Check, RotateCcw, Settings2, Loader2, CheckCircle, ArrowLeft, User, Building, Phone, Mail, ChevronDown, Server } from "lucide-react";
import { QuoteShare } from "@/components/QuoteShare";
import AppMenu from "@/components/AppMenu";
import EventBadge from "@/components/EventBadge";
import logoOpa from "@/assets/logo-opa-suite.png";
import logoIxc from "@/assets/logo-ixcsoft.png";
import opaBanner from "@/assets/opa-banner.jpg";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useEvent } from "@/contexts/EventContext";
import { useProfile } from "@/hooks/useProfile";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/components/ui/collapsible";

const PUBLISHED_DOMAIN = "https://holaprecios.lovable.app";

const fmtBRL = (n: number) =>
  "R$ " + n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtClients = (n: number) => n.toLocaleString("pt-BR");

type ViewState = "form" | "loading" | "success";

const OpaSuite = () => {
  const { user } = useAuth();
  const { eventCode } = useEvent();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [view, setView] = useState<ViewState>("form");
  const [clientCount, setClientCount] = useState<number | null>(null);
  const [addonQty, setAddonQty] = useState<Record<string, number>>(
    Object.fromEntries(opaAddons.map((a) => [a.name, 0]))
  );
  const [selectedCloud, setSelectedCloud] = useState<string | null>(null);
  const [cloudFlipped, setCloudFlipped] = useState(false);

  // Collapsible group selections (group index -> selected option index, or null)
  const [groupSelections, setGroupSelections] = useState<Record<number, number | null>>(
    Object.fromEntries(opaMensalidadeGroups.map((_, i) => [i, null]))
  );
  const [openGroups, setOpenGroups] = useState<Record<number, boolean>>({});

  // Adesão toggles
  const [fluxoBasicoEnabled, setFluxoBasicoEnabled] = useState(false);
  const [adesaoExtrasEnabled, setAdesaoExtrasEnabled] = useState<Record<string, boolean>>(
    Object.fromEntries(opaAdesaoExtras.map((a) => [a.name, false]))
  );
  const [hourlyQty, setHourlyQty] = useState<Record<string, number>>(
    Object.fromEntries(opaHourlyAdesaoItems.map((a) => [a.name, 0]))
  );

  const [clientName, setClientName] = useState("");
  const [clientCompany, setClientCompany] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");

  const [quoteId, setQuoteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [paymentType, setPaymentType] = useState<'vista' | 'parcelado'>('vista');
  const [selectedInstallments, setSelectedInstallments] = useState<number | null>(null);

  const addonTotal = useMemo(() => {
    return opaAddons.reduce((sum, a) => sum + (addonQty[a.name] || 0) * a.unitPrice, 0);
  }, [addonQty]);

  const groupsTotal = useMemo(() => {
    return opaMensalidadeGroups.reduce((sum, group, gi) => {
      const sel = groupSelections[gi];
      if (sel !== null && sel !== undefined) {
        return sum + group.options[sel].price;
      }
      return sum;
    }, 0);
  }, [groupSelections]);

  const mensalidadeTotal = opaBasePrice + addonTotal + groupsTotal;

  const cloudPrice = useMemo(() => {
    if (!selectedCloud) return 0;
    return opaCloudPlans.find((p) => p.name === selectedCloud)?.price || 0;
  }, [selectedCloud]);

  const totalMensal = mensalidadeTotal + cloudPrice;

  const adesaoTotal = useMemo(() => {
    let total = adesaoBasicaPrice;
    if (fluxoBasicoEnabled) total += fluxoBasicoPrice;
    opaAdesaoExtras.forEach((item) => {
      if (adesaoExtrasEnabled[item.name] && item.price > 0) total += item.price;
    });
    opaHourlyAdesaoItems.forEach((item) => {
      total += (hourlyQty[item.name] || 0) * item.unitPrice;
    });
    return total;
  }, [fluxoBasicoEnabled, adesaoExtrasEnabled, hourlyQty]);

  const maxInstallments = useMemo(() => {
    if (adesaoTotal <= 854) return 2;
    if (adesaoTotal <= 1590) return 3;
    if (adesaoTotal <= 2650) return 4;
    return 6;
  }, [adesaoTotal]);

  const installmentValue = useMemo(() => {
    if (!selectedInstallments || selectedInstallments <= 0) return 0;
    return adesaoTotal / selectedInstallments;
  }, [adesaoTotal, selectedInstallments]);

  const resetAll = () => {
    setClientCount(null);
    setAddonQty(Object.fromEntries(opaAddons.map((a) => [a.name, 0])));
    setSelectedCloud(null);
    setGroupSelections(Object.fromEntries(opaMensalidadeGroups.map((_, i) => [i, null])));
    setOpenGroups({});
    setFluxoBasicoEnabled(false);
    setAdesaoExtrasEnabled(Object.fromEntries(opaAdesaoExtras.map((a) => [a.name, false])));
    setHourlyQty(Object.fromEntries(opaHourlyAdesaoItems.map((a) => [a.name, 0])));
    setClientName("");
    setClientCompany("");
    setClientPhone("");
    setClientEmail("");
    setQuoteId(null);
    setPaymentType('vista');
    setSelectedInstallments(null);
  };

  const buildItems = () => {
    const items: { label: string; value: number; section: string }[] = [];
    items.push({ label: "Licença Opa! Suite", value: opaBasePrice, section: "mensalidade" });
    opaAddons.forEach((a) => {
      const qty = addonQty[a.name] || 0;
      if (qty > 0) items.push({ label: `${a.name} (x${qty})`, value: qty * a.unitPrice, section: "mensalidade" });
    });
    // Group selections
    opaMensalidadeGroups.forEach((group, gi) => {
      const sel = groupSelections[gi];
      if (sel !== null && sel !== undefined) {
        items.push({ label: group.options[sel].label, value: group.options[sel].price, section: "mensalidade" });
      }
    });
    if (selectedCloud) items.push({ label: selectedCloud, value: cloudPrice, section: "cloud" });
    items.push({ label: "Adesão Básica", value: adesaoBasicaPrice, section: "adesao" });
    if (fluxoBasicoEnabled) {
      items.push({ label: "Fluxo Básico entregue e configurado", value: fluxoBasicoPrice, section: "adesao" });
    }
    opaAdesaoExtras.forEach((item) => {
      if (adesaoExtrasEnabled[item.name]) {
        items.push({ label: item.name, value: item.price, section: "adesao" });
      }
    });
    opaHourlyAdesaoItems.forEach((item) => {
      const qty = hourlyQty[item.name] || 0;
      if (qty > 0) {
        items.push({ label: `${item.name} (x${qty})`, value: qty * item.unitPrice, section: "adesao" });
      }
    });
    return items;
  };

  const handleGenerateQuote = async () => {
    if (!user) return;
    setSaving(true);
    setView("loading");
    try {
      const items = buildItems();
      const { data, error } = await supabase.from("quotes" as any).insert({
        user_id: user.id,
        client_name: clientName,
        client_company: clientCompany,
        client_phone: clientPhone,
        client_email: clientEmail,
        clients_count: clientCount || 0,
        items: items as any,
        discount: 0,
        total: totalMensal,
        discounted_total: totalMensal,
        discount_amount: 0,
        installation_cost: adesaoTotal,
        adesao_payment_type: paymentType,
        adesao_installments: paymentType === 'parcelado' ? selectedInstallments : null,
        seller_name: profile?.nombre || "",
        seller_cargo: profile?.cargo || "",
        seller_numero: "+5492615783684",
        seller_email: profile?.email_contacto || "",
        seller_foto: profile?.foto_url || null,
        event_code: eventCode,
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
    resetAll();
    setView("form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const quoteUrl = quoteId ? `${PUBLISHED_DOMAIN}/cotizacion?id=${quoteId}` : "";

  // Loading screen
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

  // Success screen
  if (view === "success" && quoteId) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="w-full">
          <img src={opaBanner} alt="Opa! Suite" className="w-full h-auto object-cover" />
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

            <QuoteShare quoteUrl={quoteUrl} clientPhone={clientPhone} clientName={clientName} agentName={profile?.nombre} isOpa eventCode={eventCode} />

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
    <div className="min-h-screen bg-premium-gradient">
      <header className="w-full max-w-5xl mx-auto px-4 pt-6">
        <div className="rounded-2xl overflow-hidden shadow-2xl">
          <img src={opaBanner} alt="Opa! Suite" className="w-full h-auto object-cover" />
        </div>
      </header>

      <div className="absolute top-4 left-4 z-10">
        <AppMenu />
      </div>
      <EventBadge />

      <main className="mx-auto max-w-6xl px-6 py-10 space-y-10">
        {/* Client count selector */}
        <Card className="border-2 border-blue-500/20 bg-gradient-to-r from-blue-500/5 via-background to-blue-500/5 card-premium animate-fade-slide-up">
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Quantidade de clientes</p>
                  <p className="text-xs text-muted-foreground">Selecione a faixa para calcular</p>
                </div>
              </div>
              <div className="flex-1 w-full md:w-auto">
                <Select value={clientCount?.toString() || ""} onValueChange={(v) => {
                  const count = Number(v);
                  setClientCount(count);
                  setQuoteId(null);
                  const minIdx = getMinOpaCloudPlanIndex(count);
                  setSelectedCloud(opaCloudPlans[minIdx].name);
                }}>
                  <SelectTrigger className="h-12 text-lg font-semibold">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {pricingTiers.map((t) => (
                      <SelectItem key={t.clients} value={t.clients.toString()}>
                        {fmtClients(t.clients)} clientes
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-destructive" onClick={resetAll} title="Resetar tudo">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {clientCount && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-slide-up-1">
              {/* Mensalidade */}
              <Card className="card-premium">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Settings2 className="h-5 w-5" />
                    Mensalidade
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Licença Opa! Suite: 1 WhatsApp Oficial + Hospedagem Meta + 3 acessos
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="hidden md:flex justify-between text-sm font-medium text-muted-foreground border-b border-border pb-2">
                    <span>Serviço</span>
                    <div className="flex gap-8">
                      <span>Qtd.</span>
                      <span>P/U</span>
                      <span className="w-20 text-right">Subtotal</span>
                    </div>
                  </div>

                  {/* Base license - always shown */}
                  <div className="flex justify-between items-center text-sm py-1">
                    <span className="font-medium text-foreground">Licença base</span>
                    <span className="font-semibold text-foreground w-20 text-right">{fmtBRL(opaBasePrice)}</span>
                  </div>

                  {/* Addon items */}
                  <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-x-2 sm:gap-x-3 gap-y-2 text-sm">
                    {opaAddons.map((addon) => {
                      const qty = addonQty[addon.name] || 0;
                      const subtotal = qty * addon.unitPrice;
                      return (
                        <React.Fragment key={addon.name}>
                          <span className="text-foreground font-medium sm:font-normal py-1 text-xs sm:text-sm truncate">{addon.name}</span>
                          <div className="flex items-center gap-1">
                            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setAddonQty((p) => ({ ...p, [addon.name]: Math.max(0, (p[addon.name] || 0) - 1) }))}>
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-6 text-center font-mono">{qty}</span>
                            <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setAddonQty((p) => ({ ...p, [addon.name]: (p[addon.name] || 0) + 1 }))}>
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <span className="text-muted-foreground text-right text-xs sm:text-sm whitespace-nowrap">{fmtBRL(addon.unitPrice)}</span>
                          <span className="font-semibold text-right text-foreground w-16 text-xs sm:text-sm whitespace-nowrap">{fmtBRL(subtotal)}</span>
                        </React.Fragment>
                      );
                    })}
                  </div>

                  {/* Collapsible groups */}
                  <div className="border-t border-border pt-3 space-y-2">
                    {opaMensalidadeGroups.map((group, gi) => (
                      <Collapsible
                        key={gi}
                        open={openGroups[gi] || false}
                        onOpenChange={(open) => setOpenGroups((prev) => ({ ...prev, [gi]: open }))}
                      >
                        <CollapsibleTrigger className="w-full flex justify-between items-center text-sm font-medium text-foreground hover:bg-accent/50 rounded-md px-2 py-2 transition-colors">
                          <div className="flex items-center gap-2">
                            <ChevronDown className={`h-4 w-4 transition-transform ${openGroups[gi] ? "rotate-180" : ""}`} />
                            <span>{group.groupName}</span>
                          </div>
                          {groupSelections[gi] !== null && groupSelections[gi] !== undefined && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                              {fmtBRL(group.options[groupSelections[gi]!].price)}
                            </span>
                          )}
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pl-6 space-y-1 pt-1">
                          {/* None option */}
                          <button
                            onClick={() => {
                              setGroupSelections((prev) => ({ ...prev, [gi]: null }));
                              setOpenGroups((prev) => ({ ...prev, [gi]: false }));
                            }}
                            className={`w-full flex justify-between items-center rounded-md px-3 py-2 text-sm transition-colors text-left ${
                              groupSelections[gi] === null ? "bg-blue-600/10 border border-blue-600/30" : "hover:bg-accent/50"
                            }`}
                          >
                            <span className="text-muted-foreground">Nenhum</span>
                            <span className="text-muted-foreground">{fmtBRL(0)}</span>
                          </button>
                          {group.options.map((opt, oi) => {
                            const isSelected = groupSelections[gi] === oi;
                            return (
                              <button
                                key={oi}
                                onClick={() => {
                                  setGroupSelections((prev) => ({ ...prev, [gi]: oi }));
                                  setOpenGroups((prev) => ({ ...prev, [gi]: false }));
                                }}
                                className={`w-full flex justify-between items-center rounded-md px-3 py-2 text-sm transition-colors text-left ${
                                  isSelected ? "bg-blue-600/10 border border-blue-600/30" : "hover:bg-accent/50"
                                }`}
                              >
                                <span className="text-foreground">{opt.label}</span>
                                <span className="font-semibold text-foreground whitespace-nowrap ml-2">{fmtBRL(opt.price)}</span>
                              </button>
                            );
                          })}
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </div>

                  <div className="border-t border-border pt-3 flex justify-between items-center">
                    <span className="font-semibold text-foreground">Subtotal Mensalidade</span>
                    <span className="text-xl font-bold text-blue-600">{fmtBRL(mensalidadeTotal)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Opa! Cloud - Flip Card */}
              <div className="[perspective:1200px]">
                <div
                  className={`relative transition-transform duration-700 [transform-style:preserve-3d] ${cloudFlipped ? "[transform:rotateX(180deg)]" : ""}`}
                >
                  {/* Front: Cloud plans */}
                  <Card className="card-premium flex flex-col [backface-visibility:hidden]">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Cloud className="h-5 w-5" />
                        Opa! Cloud
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Plano atribuído automaticamente conforme clientes. Você pode fazer upgrade.
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-2 flex flex-col flex-1">
                      <div className="space-y-2">
                        {(() => {
                          const minIdx = clientCount ? getMinOpaCloudPlanIndex(clientCount) : 0;
                          return opaCloudPlans.map((plan, idx) => {
                            const isSelected = selectedCloud === plan.name;
                            return (
                              <button
                                key={plan.name}
                                onClick={() => setSelectedCloud(plan.name)}
                                className={`w-full flex justify-between items-center rounded-lg border px-4 py-3 transition-colors text-left ${
                                  isSelected
                                    ? "border-blue-600 bg-blue-600/10 ring-2 ring-blue-600/30"
                                    : "border-border hover:bg-accent/50"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? "border-blue-600 bg-blue-600" : "border-muted-foreground"}`}>
                                    {isSelected && <Check className="h-3 w-3 text-white" />}
                                  </div>
                                  <span className="font-medium text-foreground text-sm">{plan.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {idx === minIdx && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium whitespace-nowrap">Recomendado</span>}
                                  <span className="font-bold text-foreground">{fmtBRL(plan.price)}</span>
                                </div>
                              </button>
                            );
                          });
                        })()}
                      </div>
                      <div className="mt-auto pt-4 space-y-3">
                        <div className="border-t border-border pt-3 flex justify-between items-center">
                          <span className="font-semibold text-foreground">Cloud selecionado</span>
                          <span className="text-xl font-bold text-blue-600">{fmtBRL(cloudPrice)}</span>
                        </div>
                        <Button
                          variant="ghost"
                          className="w-full text-muted-foreground hover:text-foreground gap-2"
                          onClick={() => { setSelectedCloud(null); setCloudFlipped(true); }}
                        >
                          <Server className="h-4 w-4" />
                          Sem nuvem (servidor próprio)
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Back: Server requirements table */}
                  <Card className="card-premium absolute inset-0 [backface-visibility:hidden] [transform:rotateX(180deg)] overflow-auto flex flex-col">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Server className="h-5 w-5" />
                        Pré-requisitos de instalação em servidor próprio
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col flex-1">
                      <div className="overflow-x-auto flex-1">
                        <table className="w-full text-sm border-collapse">
                          <thead>
                            <tr className="border-b border-border">
                              <th className="text-left py-2 px-2 font-semibold text-foreground">Atendimentos/mês</th>
                              <th className="text-center py-2 px-2 font-semibold text-foreground">Core</th>
                              <th className="text-center py-2 px-2 font-semibold text-foreground">SSD</th>
                              <th className="text-center py-2 px-2 font-semibold text-foreground">Memória</th>
                              <th className="text-center py-2 px-2 font-semibold text-foreground">IP Público</th>
                              <th className="text-center py-2 px-2 font-semibold text-foreground">SSL</th>
                              <th className="text-center py-2 px-2 font-semibold text-foreground">Domínio</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              { range: "Até 5.000", core: "2", ssd: "200 GB", mem: "6 GB" },
                              { range: "Até 20.000", core: "4", ssd: "1 TERA", mem: "12 GB" },
                              { range: "Até 40.000", core: "4", ssd: "1 TERA", mem: "16 GB" },
                              { range: "Até 60.000", core: "8", ssd: "2 TERA", mem: "32 GB" },
                              { range: "Até 100.000", core: "16", ssd: "2 TERA", mem: "64 GB" },
                            ].map((row) => (
                              <tr key={row.range} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                                <td className="py-2.5 px-2 font-medium text-foreground whitespace-nowrap">{row.range}</td>
                                <td className="py-2.5 px-2 text-center text-muted-foreground">{row.core}</td>
                                <td className="py-2.5 px-2 text-center text-muted-foreground">{row.ssd}</td>
                                <td className="py-2.5 px-2 text-center text-muted-foreground">{row.mem}</td>
                                <td className="py-2.5 px-2 text-center text-blue-600">✓</td>
                                <td className="py-2.5 px-2 text-center text-blue-600">✓</td>
                                <td className="py-2.5 px-2 text-center text-blue-600">✓</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="mt-auto pt-4">
                        <Button
                          variant="outline"
                          className="w-full gap-2"
                          onClick={() => {
                            setCloudFlipped(false);
                            const minIdx = clientCount ? getMinOpaCloudPlanIndex(clientCount) : 0;
                            setSelectedCloud(opaCloudPlans[minIdx].name);
                          }}
                        >
                          <Cloud className="h-4 w-4" />
                          Voltar para Opa! Cloud
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Adesão (own card) - only show when clientCount is set */}
        {clientCount && (
          <Card className="card-premium animate-fade-slide-up-2">
            <CardHeader>
              <CardTitle className="text-lg">Adesão (pagamento único)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Adesão Básica — always on */}
              <div className="flex justify-between items-center text-sm">
                <div>
                  <span className="text-foreground font-medium">Adesão Básica</span>
                  <span className="block text-xs text-muted-foreground">
                    Configuração básica, canais, 3h treinamento, suporte, fluxo básico
                  </span>
                </div>
                <span className="font-bold text-foreground">{fmtBRL(adesaoBasicaPrice)}</span>
              </div>

              {/* Fluxo Básico entregue e configurado */}
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-3">
                  <Switch checked={fluxoBasicoEnabled} onCheckedChange={setFluxoBasicoEnabled} />
                  <span className="text-foreground font-medium">Fluxo Básico entregue e configurado</span>
                </div>
                <span className={`font-bold ${fluxoBasicoEnabled ? "text-foreground" : "text-muted-foreground"}`}>
                  {fmtBRL(fluxoBasicoPrice)}
                </span>
              </div>

              {/* Hourly adesão items */}
              <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-x-2 sm:gap-x-3 gap-y-2 text-sm">
                {opaHourlyAdesaoItems.map((item) => {
                  const qty = hourlyQty[item.name] || 0;
                  const subtotal = qty * item.unitPrice;
                  return (
                    <React.Fragment key={item.name}>
                      <span className="text-foreground font-medium text-xs sm:text-sm truncate">{item.name}</span>
                      <div className="flex items-center gap-1">
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setHourlyQty((p) => ({ ...p, [item.name]: Math.max(0, (p[item.name] || 0) - 1) }))}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-6 text-center font-mono">{qty}</span>
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setHourlyQty((p) => ({ ...p, [item.name]: (p[item.name] || 0) + 1 }))}>
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <span className="text-muted-foreground text-right text-xs sm:text-sm whitespace-nowrap">{fmtBRL(item.unitPrice)}</span>
                      <span className="font-semibold text-right text-foreground w-16 text-xs sm:text-sm whitespace-nowrap">{fmtBRL(subtotal)}</span>
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Extra adesão items */}
              {opaAdesaoExtras.map((item) => (
                <div key={item.name} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={adesaoExtrasEnabled[item.name] || false}
                      onCheckedChange={(v) => setAdesaoExtrasEnabled((prev) => ({ ...prev, [item.name]: v }))}
                    />
                    <div>
                      <span className="text-foreground font-medium text-xs sm:text-sm">{item.name}</span>
                      {item.description && <span className="block text-xs text-muted-foreground">{item.description}</span>}
                      {item.sobAnalise && <span className="block text-xs text-muted-foreground">Sob avaliação</span>}
                    </div>
                  </div>
                  <span className={`font-bold whitespace-nowrap ml-2 ${adesaoExtrasEnabled[item.name] ? "text-foreground" : "text-muted-foreground"}`}>
                    {item.sobAnalise ? "Sob avaliação" : fmtBRL(item.price)}
                  </span>
                </div>
              ))}

              <div className="border-t border-border pt-3 flex justify-between items-center">
                <span className="font-semibold text-foreground">Total Adesão</span>
                <span className="text-xl font-bold text-blue-600">{fmtBRL(adesaoTotal)}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Resumo */}
        <Card className="border-2 border-blue-600/30 bg-blue-600/5 card-premium animate-fade-slide-up-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Resumo</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {clientCount ? `Para ${fmtClients(clientCount)} clientes` : "Selecione a quantidade de clientes"}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <OpaSummaryLine label="Licença Opa! Suite" value={opaBasePrice} />
              {opaAddons.map((a) => {
                const qty = addonQty[a.name] || 0;
                return <OpaSummaryLine key={a.name} label={`${a.name} (x${qty})`} value={qty * a.unitPrice} />;
              })}
              {opaMensalidadeGroups.map((group, gi) => {
                const sel = groupSelections[gi];
                if (sel === null || sel === undefined) return null;
                return <OpaSummaryLine key={gi} label={group.options[sel].label} value={group.options[sel].price} />;
              })}
              <OpaSummaryLine label={selectedCloud || "Cloud"} value={cloudPrice} />
            </div>

            <div className="border-t border-border pt-3 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Subtotal Mensalidade</span>
                <span className="font-semibold text-foreground">{fmtBRL(mensalidadeTotal)}</span>
              </div>
              {cloudPrice > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Opa! Cloud</span>
                  <span className="font-semibold text-foreground">{fmtBRL(cloudPrice)}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-1">
                <span className="text-lg font-bold text-foreground">Total Mensal</span>
                <span className="text-2xl font-bold text-blue-600">{fmtBRL(totalMensal)}</span>
              </div>
            </div>

            {adesaoTotal > 0 && (
              <div className="border-t border-border pt-3 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground text-sm">Adesão (pagamento único)</span>
                    <span className="font-semibold text-foreground text-lg">{fmtBRL(adesaoTotal)}</span>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant={paymentType === 'vista' ? 'default' : 'outline'}
                      className={paymentType === 'vista' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                      size="lg"
                      onClick={() => { setPaymentType('vista'); setSelectedInstallments(null); }}
                    >
                      À Vista
                    </Button>
                    <Button
                      variant={paymentType === 'parcelado' ? 'default' : 'outline'}
                      className={paymentType === 'parcelado' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                      size="lg"
                      onClick={() => { setPaymentType('parcelado'); setSelectedInstallments(maxInstallments); }}
                    >
                      Parcelado
                    </Button>
                  </div>
                </div>

                {paymentType === 'parcelado' && (
                  <div className="space-y-3 pl-1">
                    <span className="text-sm font-medium text-foreground">Número de parcelas:</span>
                    <div className="flex flex-wrap gap-2">
                      {Array.from({ length: maxInstallments - 1 }, (_, i) => i + 2).map((n) => (
                        <Button
                          key={n}
                          variant={selectedInstallments === n ? 'default' : 'outline'}
                          className={selectedInstallments === n ? 'bg-blue-600 hover:bg-blue-700' : ''}
                          size="sm"
                          onClick={() => setSelectedInstallments(n)}
                        >
                          {n}x
                        </Button>
                      ))}
                    </div>
                    {selectedInstallments && (
                      <p className="text-sm text-muted-foreground">
                        Valor de cada parcela: <span className="font-semibold text-foreground">{fmtBRL(installmentValue)}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Client fields */}
        <Card className="card-premium animate-fade-slide-up-4">
          <CardHeader>
            <CardTitle className="text-lg">Dados do destinatário (opcional)</CardTitle>
            <p className="text-sm text-muted-foreground">Preencha os dados do cliente para personalizar a cotação</p>
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
        <Button onClick={handleGenerateQuote} disabled={saving || !clientCount} className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700 text-white" size="lg">
          Gerar Cotação
        </Button>
      </main>
    </div>
  );
};

function OpaSummaryLine({ label, value }: { label: string; value: number }) {
  if (value <= 0) return null;
  return (
    <div className="flex justify-between items-center text-sm py-1 text-foreground">
      <span>{label}</span>
      <span className="font-semibold">{fmtBRL(value)}</span>
    </div>
  );
}

export default OpaSuite;
