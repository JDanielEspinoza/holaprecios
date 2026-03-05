import { useEffect, useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Loader2, ExternalLink, FileText, Search, Archive, ArchiveRestore,
  Filter, MessageSquare, CheckCircle2, CircleDot,
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
  items: any[];
  seller_name: string | null;
  created_at: string;
  archived: boolean;
  entry_payment_paid: boolean;
}

const Cotizaciones = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  const [quotes, setQuotes] = useState<QuoteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [agentFilter, setAgentFilter] = useState("all");
  const [showArchived, setShowArchived] = useState(false);
  const [sendingWhatsApp, setSendingWhatsApp] = useState<string | null>(null);

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

  const agents = useMemo(() => {
    const set = new Set(quotes.map((q) => q.seller_name).filter(Boolean));
    return Array.from(set) as string[];
  }, [quotes]);

  const filtered = useMemo(() => {
    let list = quotes.filter((q) => q.archived === showArchived);

    if (agentFilter !== "all") {
      list = list.filter((q) => q.seller_name === agentFilter);
    }

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
  }, [quotes, search, agentFilter, showArchived]);

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

  const togglePayment = async (q: QuoteRow) => {
    const newVal = !q.entry_payment_paid;
    await supabase
      .from("quotes")
      .update({ entry_payment_paid: newVal } as any)
      .eq("id", q.id);
    setQuotes((prev) =>
      prev.map((x) => (x.id === q.id ? { ...x, entry_payment_paid: newVal } : x))
    );
    toast({
      title: newVal ? "Pago de entrada marcado" : "Marca de pago removida",
    });
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
      const { data, error } = await supabase.functions.invoke("send-whatsapp", {
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
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 animate-fade-slide-up">
          <FileText className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Historial de Cotizaciones</h1>
          <Badge variant="secondary" className="ml-2">{filtered.length} resultados</Badge>
        </div>

        {/* Filters Bar */}
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

              <div className="flex gap-2 items-center">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={agentFilter} onValueChange={setAgentFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Agente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los agentes</SelectItem>
                    {agents.map((a) => (
                      <SelectItem key={a} value={a}>{a}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

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
                {showArchived ? "No hay cotizaciones archivadas." : "No hay cotizaciones que coincidan."}
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
                    <TableHead className="hidden md:table-cell">Agente</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="hidden md:table-cell text-center">Pago</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((q) => {
                    const finalTotal = q.discount > 0 ? q.discounted_total : q.total;
                    return (
                      <TableRow
                        key={q.id}
                        className="cursor-pointer hover:bg-muted/40 transition-colors"
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
                        <TableCell className="hidden md:table-cell text-sm">
                          {q.seller_name || "—"}
                        </TableCell>
                        <TableCell className="text-right font-bold text-primary whitespace-nowrap">
                          {fmt(finalTotal)}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-center" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => togglePayment(q)}
                            title={q.entry_payment_paid ? "Pago recibido" : "Marcar pago"}
                          >
                            {q.entry_payment_paid ? (
                              <CheckCircle2 className="h-5 w-5 text-primary" />
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
                              {q.archived ? (
                                <ArchiveRestore className="h-4 w-4" />
                              ) : (
                                <Archive className="h-4 w-4" />
                              )}
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
    </div>
  );
};

export default Cotizaciones;
