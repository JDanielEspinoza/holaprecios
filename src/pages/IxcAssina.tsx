import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { QuoteShare } from "@/components/QuoteShare";
import AppMenu from "@/components/AppMenu";
import EventBadge from "@/components/EventBadge";
import assinaBanner from "@/assets/ixc-assina-banner.jpg";
import assinaLogo from "@/assets/ixc-assina-logo.png";
import { useAuth } from "@/hooks/useAuth";
import { useEvent } from "@/contexts/EventContext";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2, CheckCircle, ArrowLeft, User, Building, Phone, Mail, FileCheck, Crown, Shield,
} from "lucide-react";
import {
  type AssinaPackageType, type AssinaTier, getAssinaTiers,
} from "@/data/assinaPricing";

const PUBLISHED_DOMAIN = "https://holaprecios.lovable.app";

const fmtBRL = (n: number) =>
  "R$ " + n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

type ViewState = "form" | "loading" | "success";

const IxcAssina = () => {
  const { user } = useAuth();
  const { eventCode } = useEvent();
  const { profile } = useProfile();
  const { toast } = useToast();

  const [view, setView] = useState<ViewState>("form");
  const [selectedPackage, setSelectedPackage] = useState<AssinaPackageType | null>(null);
  const [selectedDocs, setSelectedDocs] = useState<string>("");
  const [clientName, setClientName] = useState("");
  const [clientCompany, setClientCompany] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [quoteId, setQuoteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const isEspecialista = selectedPackage === "especialista";

  const tiers = useMemo(() => {
    if (!selectedPackage) return [];
    return getAssinaTiers(selectedPackage);
  }, [selectedPackage]);

  const selectedTier: AssinaTier | null = useMemo(() => {
    if (!selectedDocs || !selectedPackage) return null;
    return tiers.find((t) => t.docs === Number(selectedDocs)) || null;
  }, [selectedDocs, tiers, selectedPackage]);

  const handleSelectPackage = (pkg: AssinaPackageType) => {
    setSelectedPackage(pkg);
    setSelectedDocs("");
    setQuoteId(null);
  };

  const buildItems = () => {
    if (!selectedTier || !selectedPackage) return [];
    const section = `assina_${selectedPackage}`;
    return [
      {
        label: `Pacote ${selectedPackage === "especialista" ? "Especialista" : "Profissional"} — ${selectedTier.docs} docs/mês`,
        value: selectedTier.packagePrice,
        section,
      },
      {
        label: `Valor unitário: ${fmtBRL(selectedTier.unitPrice)}/doc`,
        value: 0,
        section,
      },
      {
        label: `Excedente: ${fmtBRL(selectedTier.excess)}/doc`,
        value: 0,
        section,
      },
      {
        label: `Valor mínimo mensal: ${fmtBRL(selectedTier.minValue)}`,
        value: 0,
        section,
      },
    ];
  };

  const handleGenerateQuote = async () => {
    if (!user || !selectedTier) return;
    setSaving(true);
    setView("loading");
    try {
      const items = buildItems();
      const total = selectedTier.packagePrice;
      const usedEventCode = eventCode || "ABRINT26";

      const { data, error } = await supabase.from("quotes" as any).insert({
        user_id: user.id,
        client_name: clientName,
        client_company: clientCompany,
        client_phone: clientPhone,
        client_email: clientEmail,
        clients_count: selectedTier.docs,
        items: items as any,
        discount: 0,
        total,
        discounted_total: total,
        discount_amount: 0,
        installation_cost: 0,
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
    setSelectedPackage(null);
    setSelectedDocs("");
    setClientName("");
    setClientCompany("");
    setClientPhone("");
    setClientEmail("");
    setQuoteId(null);
    setView("form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const quoteUrl = quoteId ? `${PUBLISHED_DOMAIN}/cotizacion?id=${quoteId}` : "";

  // Loading screen
  if (view === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="text-center space-y-6 animate-fade-slide-up">
          <Loader2 className="h-16 w-16 animate-spin text-teal-600 mx-auto" />
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
          <img src={assinaBanner} alt="IXC Assina" className="w-full h-auto object-cover" />
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
              isAssina
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
    <div className={`min-h-screen transition-colors duration-500 ${isEspecialista ? "bg-gray-950" : "bg-gray-50"}`}>
      <header className="w-full max-w-5xl mx-auto px-4 pt-6">
        <div className="rounded-2xl overflow-hidden shadow-2xl">
          <img src={assinaBanner} alt="IXC Assina" className="w-full h-auto object-cover" />
        </div>
      </header>

      <div className="absolute top-4 left-4 z-10">
        <AppMenu />
      </div>
      <EventBadge />

      <main className="mx-auto max-w-4xl px-6 py-10 space-y-8">
        {/* Package selection */}
        <div className="space-y-4">
          <h2 className={`text-xl font-bold text-center transition-colors duration-500 ${isEspecialista ? "text-amber-400" : "text-gray-700"}`}>
            Selecione o Pacote
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Profissional */}
            <button
              onClick={() => handleSelectPackage("profissional")}
              className={`relative rounded-2xl border-2 p-6 text-left transition-all duration-300 ${
                selectedPackage === "profissional"
                  ? "border-teal-500 bg-teal-50 shadow-lg shadow-teal-500/20"
                  : isEspecialista
                    ? "border-gray-700 bg-gray-900 hover:border-gray-600"
                    : "border-gray-200 bg-white hover:border-teal-300 hover:shadow-md"
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  selectedPackage === "profissional" ? "bg-teal-500 text-white" : "bg-teal-100 text-teal-600"
                }`}>
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h3 className={`text-lg font-bold ${isEspecialista ? "text-gray-300" : "text-gray-800"}`}>
                    Profissional
                  </h3>
                  <p className={`text-xs ${isEspecialista ? "text-gray-500" : "text-gray-500"}`}>
                    Detecção facial
                  </p>
                </div>
              </div>
              <p className={`text-sm ${isEspecialista && selectedPackage !== "profissional" ? "text-gray-400" : "text-gray-600"}`}>
                Assinatura digital com detecção facial para validação de identidade.
              </p>
              {selectedPackage === "profissional" && (
                <div className="absolute top-3 right-3">
                  <CheckCircle className="h-6 w-6 text-teal-500" />
                </div>
              )}
            </button>

            {/* Especialista */}
            <button
              onClick={() => handleSelectPackage("especialista")}
              className={`relative rounded-2xl border-2 p-6 text-left transition-all duration-300 ${
                selectedPackage === "especialista"
                  ? "border-amber-500 bg-gray-900 shadow-lg shadow-amber-500/30"
                  : isEspecialista
                    ? "border-gray-700 bg-gray-900 hover:border-amber-500/50"
                    : "border-gray-200 bg-white hover:border-amber-400 hover:shadow-md"
              }`}
            >
              {selectedPackage === "especialista" && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-900 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                    <Crown className="h-3 w-3" /> VIP
                  </span>
                </div>
              )}
              <div className="flex items-center gap-3 mb-3">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  selectedPackage === "especialista"
                    ? "bg-gradient-to-br from-amber-500 to-yellow-400 text-gray-900"
                    : "bg-amber-100 text-amber-600"
                }`}>
                  <Crown className="h-5 w-5" />
                </div>
                <div>
                  <h3 className={`text-lg font-bold ${isEspecialista ? "text-amber-400" : "text-gray-800"}`}>
                    Especialista
                  </h3>
                  <p className={`text-xs ${isEspecialista ? "text-amber-500/70" : "text-gray-500"}`}>
                    Detecção + Comparação facial
                  </p>
                </div>
              </div>
              <p className={`text-sm ${isEspecialista ? "text-gray-400" : "text-gray-600"}`}>
                Assinatura digital com detecção e comparação facial — máxima segurança.
              </p>
              {selectedPackage === "especialista" && (
                <div className="absolute top-3 right-3">
                  <CheckCircle className="h-6 w-6 text-amber-400" />
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Tier selection */}
        {selectedPackage && (
          <Card className={`animate-fade-slide-up transition-all duration-500 ${
            isEspecialista
              ? "bg-gray-900 border-amber-500/30 shadow-lg shadow-amber-500/10"
              : "bg-white border-gray-200"
          }`}>
            <CardHeader>
              <CardTitle className={`text-lg flex items-center gap-2 ${isEspecialista ? "text-amber-400" : "text-gray-700"}`}>
                <FileCheck className={`h-5 w-5 ${isEspecialista ? "text-amber-400" : "text-teal-600"}`} />
                Quantidade de documentos/mês
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={selectedDocs} onValueChange={(v) => { setSelectedDocs(v); setQuoteId(null); }}>
                <SelectTrigger className={`h-12 text-base ${
                  isEspecialista ? "bg-gray-800 border-amber-500/30 text-amber-100" : ""
                }`}>
                  <SelectValue placeholder="Selecione a quantidade de documentos" />
                </SelectTrigger>
                <SelectContent>
                  {tiers.map((t) => (
                    <SelectItem key={t.docs} value={String(t.docs)}>
                      {t.docs.toLocaleString("pt-BR")} documentos/mês — {fmtBRL(t.packagePrice)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedTier && (
                <div className={`rounded-xl p-5 space-y-3 transition-all duration-500 ${
                  isEspecialista
                    ? "bg-gradient-to-br from-gray-800 to-gray-900 border border-amber-500/20"
                    : "bg-gray-50 border border-gray-200"
                }`}>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className={`text-xs font-medium uppercase tracking-wide ${isEspecialista ? "text-amber-500/70" : "text-gray-500"}`}>
                        Valor unitário
                      </p>
                      <p className={`text-lg font-bold ${isEspecialista ? "text-amber-400" : "text-teal-600"}`}>
                        {fmtBRL(selectedTier.unitPrice)}
                        <span className={`text-xs font-normal ml-1 ${isEspecialista ? "text-gray-500" : "text-gray-400"}`}>/doc</span>
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className={`text-xs font-medium uppercase tracking-wide ${isEspecialista ? "text-amber-500/70" : "text-gray-500"}`}>
                        Valor do pacote
                      </p>
                      <p className={`text-lg font-bold ${isEspecialista ? "text-amber-400" : "text-teal-600"}`}>
                        {fmtBRL(selectedTier.packagePrice)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className={`text-xs font-medium uppercase tracking-wide ${isEspecialista ? "text-amber-500/70" : "text-gray-500"}`}>
                        Excedente
                      </p>
                      <p className={`text-sm font-semibold ${isEspecialista ? "text-gray-300" : "text-gray-700"}`}>
                        {fmtBRL(selectedTier.excess)}
                        <span className={`text-xs font-normal ml-1 ${isEspecialista ? "text-gray-500" : "text-gray-400"}`}>/doc</span>
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className={`text-xs font-medium uppercase tracking-wide ${isEspecialista ? "text-amber-500/70" : "text-gray-500"}`}>
                        Valor mínimo
                      </p>
                      <p className={`text-sm font-semibold ${isEspecialista ? "text-gray-300" : "text-gray-700"}`}>
                        {fmtBRL(selectedTier.minValue)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Summary */}
        {selectedTier && (
          <Card className={`animate-fade-slide-up transition-all duration-500 ${
            isEspecialista
              ? "bg-gray-900 border-amber-500/30 shadow-lg shadow-amber-500/10"
              : "bg-white border-gray-200"
          }`}>
            <CardHeader>
              <CardTitle className={`text-xl ${isEspecialista ? "text-amber-400" : "text-gray-700"}`}>
                Resumo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={`flex justify-between items-center text-sm py-1 ${isEspecialista ? "text-gray-300" : "text-gray-700"}`}>
                <span>
                  Pacote {selectedPackage === "especialista" ? "Especialista" : "Profissional"} — {selectedTier.docs.toLocaleString("pt-BR")} docs/mês
                </span>
                <span className="font-semibold">{fmtBRL(selectedTier.packagePrice)}</span>
              </div>
              <div className={`border-t pt-3 ${isEspecialista ? "border-amber-500/20" : "border-gray-200"}`}>
                <div className="flex justify-between items-center">
                  <span className={`text-lg font-bold ${isEspecialista ? "text-amber-400" : "text-gray-800"}`}>Total Mensal</span>
                  <span className={`text-2xl font-bold ${isEspecialista ? "text-amber-400" : "text-teal-600"}`}>
                    {fmtBRL(selectedTier.packagePrice)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Client fields */}
        {selectedTier && (
          <Card className={`animate-fade-slide-up transition-all duration-500 ${
            isEspecialista
              ? "bg-gray-900 border-amber-500/30"
              : "bg-white border-gray-200"
          }`}>
            <CardHeader>
              <CardTitle className={`text-lg ${isEspecialista ? "text-amber-400" : "text-gray-700"}`}>
                Dados do destinatário (opcional)
              </CardTitle>
              <p className={`text-sm ${isEspecialista ? "text-gray-500" : "text-gray-500"}`}>
                Preencha os dados do cliente para personalizar a cotação
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clientName" className={isEspecialista ? "text-gray-300" : ""}>Nome</Label>
                  <Input
                    id="clientName"
                    placeholder="Nome do cliente"
                    value={clientName}
                    onChange={(e) => { setClientName(e.target.value); setQuoteId(null); }}
                    className={isEspecialista ? "bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-500" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientCompany" className={isEspecialista ? "text-gray-300" : ""}>Empresa</Label>
                  <Input
                    id="clientCompany"
                    placeholder="Nome da empresa"
                    value={clientCompany}
                    onChange={(e) => { setClientCompany(e.target.value); setQuoteId(null); }}
                    className={isEspecialista ? "bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-500" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientPhone" className={isEspecialista ? "text-gray-300" : ""}>Telefone</Label>
                  <Input
                    id="clientPhone"
                    placeholder="Telefone de contato"
                    value={clientPhone}
                    onChange={(e) => { setClientPhone(e.target.value); setQuoteId(null); }}
                    className={isEspecialista ? "bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-500" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientEmail" className={isEspecialista ? "text-gray-300" : ""}>Email</Label>
                  <Input
                    id="clientEmail"
                    placeholder="Email de contato"
                    type="email"
                    value={clientEmail}
                    onChange={(e) => { setClientEmail(e.target.value); setQuoteId(null); }}
                    className={isEspecialista ? "bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-500" : ""}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Generate button */}
        {selectedTier && (
          <Button
            onClick={handleGenerateQuote}
            disabled={saving}
            className={`w-full h-14 text-lg transition-all duration-500 ${
              isEspecialista
                ? "bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-gray-900 font-bold"
                : "bg-teal-600 hover:bg-teal-700 text-white"
            }`}
            size="lg"
          >
            Gerar Cotação
          </Button>
        )}
      </main>
    </div>
  );
};

export default IxcAssina;
