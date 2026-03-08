import { useEffect, useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Loader2, ExternalLink, FileText, Search, Archive, ArchiveRestore,
  MessageSquare, CheckCircle2, CircleDot,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import AppMenu from "@/components/AppMenu";
import { useToast } from "@/hooks/use-toast";

const PUBLISHED_DOMAIN = "https://holaprecios.lovable.app";

const fmt = (n: number) =>
  "$" + n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

interface QuoteRow {
  id: string;
  quote_number: number;
  client_name: string | null;
  client_company: string | null;
  client_email: string | null;
  client_phone: string | null;
  clients_count: number;
  total: number;
  discounted_total: number;
  discount: number;
  discount_amount: number;
  items: any[];
  seller_name: string | null;
  created_at: string;
  archived: boolean;
  entry_payment_paid: boolean;
  user_id: string;
}

const MisCotizaciones = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  const [quotes, setQuotes] = useState<QuoteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [sendingWhatsApp, setSendingWhatsApp] = useState<string | null>(null);
  const [confirmingPayment, setConfirmingPayment] = useState<QuoteRow | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  const fetchQuotes = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("quotes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setQuotes((data as any) || []);
    setLoading(false);
  };

  useEffect(() => { fetchQuotes(); }, [user]);

  const filtered = useMemo(() => {
    let list = quotes.filter((q) => q.archived === showArchived);
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter((q) =>
        (q.client_name || "").toLowerCase().includes(s) ||
        (q.client_company || "").toLowerCase().includes(s) ||
        (q.client_email || "").toLowerCase().includes(s) ||
        (q.client_phone || "").toLowerCase().includes(s) ||
        String(q.quote_number).includes(s)
      );
    }
    return list;
  }, [quotes, search, showArchived]);

  const toggleArchive = async (q: QuoteRow) => {
    await supabase
      .from("quotes")
      .update({ archived: !q.archived } as any)
      .eq("id", q.id);
    setQuotes((prev) =>
      prev.map((x) => (x.id === q.id ? { ...x, archived: !x.archived } : x))
    );
    toast({ title: q.archived ? "Cotización restaurada" : "Cotización archivada" });
  };

  const handleConfirmPayment = async (q: QuoteRow) => {
    setProcessingPayment(true);
    try {
      const finalTotal = q.discount_amount > 0 ? q.discounted_total : q.total;
      const quoteUrl = `${PUBLISHED_DOMAIN}/cotizacion?id=${q.id}`;

      const getPlatforms = (items: any[]) => {
        const sections = new Set(
          (items || [])
            .map((i: any) => {
              if (i.section === "eco") return i.label;
              if (i.section === "cloud") return "Cloud";
              return null;
            })
            .filter(Boolean)
        );
        return Array.from(sections).join(", ");
      };

      const formatDateStr = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
      };

      await supabase
        .from("quotes")
        .update({ entry_payment_paid: true } as any)
        .eq("id", q.id);

      const { error } = await supabase.functions.invoke("confirm-payment", {
        body: {
          company_name: q.client_company || q.client_name || "",
          cantidad_usuarios: String(q.clients_count),
          products: getPlatforms(q.items),
          agent_name: q.seller_name || "",
          numero_presupuesto: String(q.quote_number),
          fecha: formatDateStr(q.created_at),
          contacto: q.client_phone || q.client_email || "",
          total: fmt(finalTotal),
          link_presupuesto: quoteUrl,
          client_name: q.client_name || "",
          client_email: q.client_email || "",
          client_phone: q.client_phone || "",
        },
      });

      if (error) throw error;

      setQuotes((prev) =>
        prev.map((x) => (x.id === q.id ? { ...x, entry_payment_paid: true } : x))
      );
      toast({ title: "Pago confirmado", description: "Información enviada a Pipedrive y n8n." });
    } catch (err: any) {
      toast({ title: "Error al confirmar pago", description: err.message, variant: "destructive" });
    } finally {
      setProcessingPayment(false);
      setConfirmingPayment(null);
    }
  };

  const sendWhatsApp = async (q: QuoteRow) => {
    if (!q.client_phone) {
      toast({ title: "Sin número de teléfono", description: "Esta cotización no tiene teléfono del cliente.", variant: "destructive" });
      return;
    }
    setSendingWhatsApp(q.id);
    try {
      const cleanPhone = q.client_phone.replace(/[\s\-\+\(\)]/g, "");
      const quoteUrl = `${PUBLISHED_DOMAIN}/cotizacion?id=${q.id}`;
      const { error } = await supabase.functions.invoke("send-whatsapp", {
        body: {
          phone: cleanPhone,
          agentName: q.seller_name || profile?.nombre || "Tu asesor",
          linkPresupuesto: quoteUrl,
        },
      });
      if (error) throw error;
      toast({ title: "WhatsApp enviado", description: `Mensaje enviado a ${q.client_phone}` });
    } catch (err: any) {
      toast({ title: "Error al enviar WhatsApp", description: err.message, variant: "destructive" });
    } finally {
      setSendingWhatsApp(null);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const getPlatforms = (items: any[]) => {
    const sections = new Set(
      (items || [])
        .map((i: any) => {
          if (i.section === "eco") return i.label;
          if (i.section === "cloud") return "Cloud";
          return null;
        })
        .filter(Boolean)
    );
    return Array.from(sections).join(", ");
  };

  return (
    <div className="min-h-screen bg-premium-gradient">
      <div className="absolute top-4 left-4 z-10">
        <AppMenu />
      </div>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <div className="flex items-center gap-3 mb-6 animate-fade-slide-up">
          <FileText className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Mis Cotizaciones</h1>
          <Badge variant="secondary" className="ml-2">{filtered.length} resultados</Badge>
        </div>

        {/* Filters */}
        <Card className="card-premium mb-6 animate-fade-slide-up-1">
          <CardContent className="py-4">
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, empresa, email, teléfono o N°..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 input-premium"
                />
              </div>
              <Button
                variant={showArchived ? "default" : "outline"}
                size="sm"
                onClick={() => setShowArchived(!showArchived)}
                className="gap-1.5"
              >
                {showArchived ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                {showArchived ? "Archivadas" : "Activas"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <Card className="card-premium">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                {showArchived ? "No tenés cotizaciones archivadas." : "No tenés cotizaciones que coincidan."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="card-premium animate-fade-slide-up-2 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="w-[70px]">N°</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead className="hidden md:table-cell">Empresa</TableHead>
                    <TableHead className="hidden lg:table-cell">Contacto</TableHead>
                    <TableHead className="hidden lg:table-cell">Productos</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="hidden md:table-cell text-center">Pago</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((q) => {
                    const finalTotal = q.discount_amount > 0 ? q.discounted_total : q.total;
                    return (
                      <TableRow
                        key={q.id}
                        className={`cursor-pointer transition-colors ${
                          q.entry_payment_paid
                            ? "bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-100 dark:hover:bg-emerald-950/30"
                            : "hover:bg-muted/40"
                        }`}
                        onClick={() => window.open(`${PUBLISHED_DOMAIN}/cotizacion?id=${q.id}`, "_blank")}
                      >
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          #{q.quote_number}
                        </TableCell>
                        <TableCell className="text-sm whitespace-nowrap">
                          {formatDate(q.created_at)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {q.client_name || "—"}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                          {q.client_company || "—"}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                          <div>{q.client_email || ""}</div>
                          <div>{q.client_phone || ""}</div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-xs">
                          {getPlatforms(q.items)}
                        </TableCell>
                        <TableCell className="text-right font-bold text-primary whitespace-nowrap">
                          {fmt(finalTotal)}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-center" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (q.entry_payment_paid) return;
                              setConfirmingPayment(q);
                            }}
                            title={q.entry_payment_paid ? "Pago confirmado" : "Confirmar pago"}
                            disabled={q.entry_payment_paid}
                          >
                            {q.entry_payment_paid ? (
                              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                            ) : (
                              <CircleDot className="h-5 w-5 text-muted-foreground" />
                            )}
                          </Button>
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => window.open(`${PUBLISHED_DOMAIN}/cotizacion?id=${q.id}`, "_blank")}
                              title="Ver cotización"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleArchive(q)}
                              title={q.archived ? "Restaurar" : "Archivar"}
                            >
                              {q.archived ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => sendWhatsApp(q)}
                              disabled={sendingWhatsApp === q.id}
                              title="Enviar por WhatsApp"
                            >
                              {sendingWhatsApp === q.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <MessageSquare className="h-4 w-4 text-primary" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}
      </main>

      {/* Payment confirmation dialog */}
      <AlertDialog open={!!confirmingPayment} onOpenChange={(open) => { if (!open) setConfirmingPayment(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar pago de cliente</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Confirmar el pago de la cotización #{confirmingPayment?.quote_number} de{" "}
              <span className="font-semibold">{confirmingPayment?.client_name || confirmingPayment?.client_company || "cliente"}</span>?
              <br /><br />
              Esto enviará la información a Pipedrive y activará la confirmación de pago.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processingPayment}>No</AlertDialogCancel>
            <AlertDialogAction
              disabled={processingPayment}
              onClick={(e) => {
                e.preventDefault();
                if (confirmingPayment) handleConfirmPayment(confirmingPayment);
              }}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {processingPayment ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Procesando...</>
              ) : (
                "Sí, confirmar pago"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MisCotizaciones;
