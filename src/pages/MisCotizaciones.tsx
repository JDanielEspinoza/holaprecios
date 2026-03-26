import { useEffect, useState, useMemo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EVENT_LIST } from "@/data/events";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Loader2, ExternalLink, FileText, Search, Archive, ArchiveRestore,
  CheckCircle2, CircleDot, MessageCircle, ChevronLeft, ChevronRight,
  Download, Trash2, Copy, Check, Linkedin,
} from "lucide-react";
import pipedriveIcon from "@/assets/pipedrive-icon.png";
import hubspotIcon from "@/assets/hubspot-icon.png";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import AppMenu from "@/components/AppMenu";
import AppBanner from "@/components/AppBanner";
import { useToast } from "@/hooks/use-toast";

const PUBLISHED_DOMAIN = "https://holaprecios.lovable.app";
const ZAPIER_WEBHOOK_URL = "https://hooks.zapier.com/hooks/catch/26704853/uxo3v0o/";

const fmt = (n: number) =>
  "$" + n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

interface QuoteRow {
  id: string;
  quote_number: number;
  event_code: string | null;
  event_quote_label: string | null;
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
  pipedrive_sent: boolean;
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
  const [confirmingPipedrive, setConfirmingPipedrive] = useState<QuoteRow | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [sendingRegistro, setSendingRegistro] = useState<string | null>(null);
  const [sentRegistros, setSentRegistros] = useState<Set<string>>(new Set());

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Archive/Delete dialogs
  const [archiveDialog, setArchiveDialog] = useState<{ mode: "single" | "bulk"; quotes: QuoteRow[] } | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ mode: "single" | "bulk"; quotes: QuoteRow[] } | null>(null);
  const [archiveReason, setArchiveReason] = useState("");
  const [deleteReason, setDeleteReason] = useState("");
  const [processingBulk, setProcessingBulk] = useState(false);

  // Contact drawer
  const [drawerQuote, setDrawerQuote] = useState<QuoteRow | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopyField = useCallback(async (field: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast({ title: "Error al copiar", variant: "destructive" });
    }
  }, [toast]);

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

  useEffect(() => { setCurrentPage(1); setSelectedIds(new Set()); }, [search, showArchived, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginatedQuotes = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  // Selection helpers
  const pageIds = paginatedQuotes.map((q) => q.id);
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));
  const somePageSelected = pageIds.some((id) => selectedIds.has(id));
  const allFilteredSelected = filtered.length > 0 && filtered.every((q) => selectedIds.has(q.id));

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectPage = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allPageSelected) {
        pageIds.forEach((id) => next.delete(id));
      } else {
        pageIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const selectAll = () => setSelectedIds(new Set(filtered.map((q) => q.id)));
  const clearSelection = () => setSelectedIds(new Set());

  const getSelectedQuotes = () => quotes.filter((q) => selectedIds.has(q.id));

  // ── Archive with reason ──
  const handleArchive = async (targetQuotes: QuoteRow[], reason: string) => {
    setProcessingBulk(true);
    try {
      for (const q of targetQuotes) {
        await supabase
          .from("quotes")
          .update({ archived: true, archive_reason: reason } as any)
          .eq("id", q.id);
      }
      setQuotes((prev) =>
        prev.map((x) =>
          targetQuotes.some((t) => t.id === x.id) ? { ...x, archived: true } : x
        )
      );
      setSelectedIds(new Set());
      toast({ title: "Cotizaciones archivadas", description: `${targetQuotes.length} cotización(es) archivada(s).`, duration: 2000 });
    } catch (err: any) {
      toast({ title: "Error al archivar", description: err.message, variant: "destructive" });
    } finally {
      setProcessingBulk(false);
      setArchiveDialog(null);
      setArchiveReason("");
    }
  };

  // ── Restore ──
  const handleRestore = async (q: QuoteRow) => {
    await supabase
      .from("quotes")
      .update({ archived: false, archive_reason: "" } as any)
      .eq("id", q.id);
    setQuotes((prev) =>
      prev.map((x) => (x.id === q.id ? { ...x, archived: false } : x))
    );
    toast({ title: "Cotización restaurada", duration: 2000 });
  };

  // ── Delete with reason ──
  const handleDelete = async (targetQuotes: QuoteRow[], reason: string) => {
    setProcessingBulk(true);
    try {
      const ids = targetQuotes.map((q) => q.id);
      // Note: archive_reason stores the delete reason before deletion for audit
      for (const q of targetQuotes) {
        await supabase
          .from("quotes")
          .update({ archive_reason: `[BORRADO] ${reason}` } as any)
          .eq("id", q.id);
      }
      const { error } = await supabase
        .from("quotes")
        .delete()
        .in("id", ids);
      if (error) throw error;
      setQuotes((prev) => prev.filter((x) => !ids.includes(x.id)));
      setSelectedIds(new Set());
      toast({ title: "Cotizaciones eliminadas", description: `${targetQuotes.length} cotización(es) eliminada(s). Los números de cotización no se reasignan.`, duration: 3000 });
    } catch (err: any) {
      toast({ title: "Error al eliminar", description: err.message, variant: "destructive" });
    } finally {
      setProcessingBulk(false);
      setDeleteDialog(null);
      setDeleteReason("");
    }
  };

  // ── Export CSV ──
  const exportCSV = (targetQuotes: QuoteRow[]) => {
    const headers = ["N°", "Fecha", "Cliente", "Empresa", "Email", "Teléfono", "Productos", "Total", "Total c/Desc.", "Descuento %", "Pago", "Enlace"];
    const rows = targetQuotes.map((q) => {
      const finalTotal = q.discount_amount > 0 ? q.discounted_total : q.total;
      return [
        q.quote_number,
        new Date(q.created_at).toLocaleDateString("es-AR"),
        q.client_name || "",
        q.client_company || "",
        q.client_email || "",
        q.client_phone || "",
        getPlatforms(q.items),
        q.total,
        q.discounted_total,
        q.discount + "%",
        q.entry_payment_paid ? "Sí" : "No",
        `${PUBLISHED_DOMAIN}/cotizacion?id=${q.id}`,
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cotizaciones_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "CSV exportado", description: `${targetQuotes.length} cotización(es) exportada(s).`, duration: 2000 });
  };

  const handleConfirmPayment = async (q: QuoteRow) => {
    setProcessingPayment(true);
    try {
      const finalTotal = q.discount_amount > 0 ? q.discounted_total : q.total;
      const quoteUrl = `${PUBLISHED_DOMAIN}/cotizacion?id=${q.id}`;

      const getPlatformsLocal = (items: any[]) => {
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
          products: getPlatformsLocal(q.items),
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
      toast({ title: "Pago confirmado", description: "Confirmación de pago procesada exitosamente." });
    } catch (err: any) {
      toast({
        title: "Error al confirmar pago",
        description: err.message,
        variant: "destructive",
        action: (
          <button
            className="shrink-0 rounded-md bg-destructive-foreground/10 px-3 py-1.5 text-sm font-medium text-destructive-foreground hover:bg-destructive-foreground/20 transition-colors"
            onClick={() => handleConfirmPayment(q)}
          >
            Reintentar
          </button>
        ),
      });
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
      toast({
        title: "Error al enviar WhatsApp",
        description: err.message,
        variant: "destructive",
        action: (
          <button
            className="shrink-0 rounded-md bg-destructive-foreground/10 px-3 py-1.5 text-sm font-medium text-destructive-foreground hover:bg-destructive-foreground/20 transition-colors"
            onClick={() => sendWhatsApp(q)}
          >
            Reintentar
          </button>
        ),
      });
    } finally {
      setSendingWhatsApp(null);
    }
  };

  const sendRegistroWispro = async (q: QuoteRow) => {
    if (!q.client_phone) {
      toast({ title: "Sin número de teléfono", description: "Esta cotización no tiene teléfono del cliente.", variant: "destructive" });
      return;
    }
    setSendingRegistro(q.id);
    try {
      const cleanPhone = q.client_phone.replace(/[\s\-\+\(\)]/g, "");
      const firstName = q.client_name?.split(" ")[0] || "";
      const { error } = await supabase.functions.invoke("send-registro-wispro", {
        body: {
          phone: cleanPhone,
          firstName,
          agentName: q.seller_name || profile?.nombre || "Tu asesor",
        },
      });
      if (error) throw error;
      setSentRegistros((prev) => new Set(prev).add(q.id));
      toast({ title: "Enlace enviado", description: `Enlace de registro Wispro enviado a ${q.client_phone}`, duration: 2000 });
    } catch (err: any) {
      toast({ title: "Error al enviar enlace", description: err.message, variant: "destructive" });
    } finally {
      setSendingRegistro(null);
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
           if (i.section === "cloud") return null;
          return null;
        })
        .filter(Boolean)
    );
    return Array.from(sections).join(", ");
  };

  return (
    <div className="min-h-screen bg-premium-gradient">
      <AppBanner />
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

        {/* Selection bar with bulk actions */}
        {selectedIds.size > 0 && (
          <div className="flex flex-wrap items-center gap-3 mb-4 px-4 py-3 bg-muted/50 rounded-lg border border-border animate-fade-in">
            <span className="text-sm font-medium text-muted-foreground">
              {selectedIds.size} seleccionada{selectedIds.size > 1 ? "s" : ""}
            </span>
            <div className="h-4 w-px bg-border" />
            {!allFilteredSelected && (
              <Button variant="link" size="sm" className="text-xs h-auto p-0" onClick={selectAll}>
                Seleccionar todas ({filtered.length})
              </Button>
            )}
            <Button variant="link" size="sm" className="text-xs h-auto p-0" onClick={clearSelection}>
              Limpiar selección
            </Button>
            <div className="h-4 w-px bg-border" />
            {!showArchived && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => setArchiveDialog({ mode: "bulk", quotes: getSelectedQuotes() })}
              >
                <Archive className="h-3.5 w-3.5" />
                Archivar ({selectedIds.size})
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => exportCSV(getSelectedQuotes())}
            >
              <Download className="h-3.5 w-3.5" />
              Exportar CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
              onClick={() => setDeleteDialog({ mode: "bulk", quotes: getSelectedQuotes() })}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Borrar ({selectedIds.size})
            </Button>
          </div>
        )}

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
          <>
            <Card className="card-premium animate-fade-slide-up-2 overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="w-[40px]" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center">
                          <Checkbox
                            checked={allPageSelected ? true : somePageSelected ? "indeterminate" : false}
                            onCheckedChange={toggleSelectPage}
                          />
                        </div>
                      </TableHead>
                      <TableHead className="w-[50px] md:w-[70px]">N°</TableHead>
                      <TableHead className="hidden sm:table-cell">Fecha</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead className="hidden md:table-cell">Empresa</TableHead>
                      <TableHead className="hidden xl:table-cell">Contacto</TableHead>
                      <TableHead className="hidden xl:table-cell">Productos</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-center">Pago</TableHead>
                      <TableHead className="text-center">CRM</TableHead>
                      <TableHead className="text-center">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedQuotes.map((q) => {
                      const finalTotal = q.discount_amount > 0 ? q.discounted_total : q.total;
                      const registroSent = sentRegistros.has(q.id);
                      return (
                        <TableRow
                          key={q.id}
                          className={`cursor-pointer transition-colors ${
                            selectedIds.has(q.id)
                              ? "bg-primary/5 hover:bg-primary/10"
                              : q.entry_payment_paid
                                ? "bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-100 dark:hover:bg-emerald-950/30"
                                : "hover:bg-muted/40"
                          }`}
                          onClick={() => setDrawerQuote(q)}
                        >
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center">
                              <Checkbox
                                checked={selectedIds.has(q.id)}
                                onCheckedChange={() => toggleSelectOne(q.id)}
                              />
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            #{q.quote_number}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-sm whitespace-nowrap">
                            {formatDate(q.created_at)}
                          </TableCell>
                          <TableCell className="font-medium text-sm">
                            <div>{q.client_name || "—"}</div>
                            <div className="text-xs text-muted-foreground sm:hidden">{formatDate(q.created_at)}</div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                            {q.client_company || "—"}
                          </TableCell>
                          <TableCell className="hidden xl:table-cell text-xs text-muted-foreground">
                            <div>{q.client_email || ""}</div>
                            <div>{q.client_phone || ""}</div>
                          </TableCell>
                          <TableCell className="hidden xl:table-cell text-xs">
                            {getPlatforms(q.items)}
                          </TableCell>
                          <TableCell className="text-right font-bold text-primary whitespace-nowrap text-sm">
                            {fmt(finalTotal)}
                          </TableCell>
                          <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center">
                              <button
                                className="h-9 w-9 flex items-center justify-center rounded-md hover:bg-accent transition-colors disabled:pointer-events-none"
                                onClick={() => {
                                  if (q.entry_payment_paid) return;
                                  setConfirmingPayment(q);
                                }}
                                title={q.entry_payment_paid ? "Pago confirmado" : "Confirmar pago"}
                                disabled={q.entry_payment_paid}
                              >
                                {q.entry_payment_paid ? (
                                  <CheckCircle2 size={24} className="text-emerald-600" />
                                ) : (
                                  <CircleDot size={24} className="text-muted-foreground" />
                                )}
                              </button>
                            </div>
                          </TableCell>
                          <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9"
                                onClick={() => setConfirmingPipedrive(q)}
                                title="Enviar trato a Pipedrive"
                              >
                                <img src={pipedriveIcon} alt="Pipedrive" className={`h-6 w-6 rounded-full transition-all ${q.pipedrive_sent ? '' : 'grayscale opacity-60 hover:grayscale-0 hover:opacity-100'}`} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9"
                                onClick={() => toast({ title: "CRM no disponible", description: "HubSpot no está conectado a la plataforma actualmente." })}
                                title="Enviar a HubSpot"
                              >
                                <img src={hubspotIcon} alt="HubSpot" className="h-6 w-6 rounded-full grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => sendRegistroWispro(q)}
                                disabled={sendingRegistro === q.id}
                                title="Enviar enlace de registro Wispro"
                              >
                                {sendingRegistro === q.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : registroSent ? (
                                  <MessageCircle className="h-4 w-4 fill-[#25D366] text-[#25D366]" />
                                ) : (
                                  <MessageCircle className="h-4 w-4 text-[#25D366]" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => window.open(`${PUBLISHED_DOMAIN}/cotizacion?id=${q.id}`, "_blank")}
                                title="Ver cotización"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                              {showArchived ? (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRestore(q)}
                                  title="Restaurar"
                                >
                                  <ArchiveRestore className="h-4 w-4" />
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setArchiveDialog({ mode: "single", quotes: [q] })}
                                  title="Archivar"
                                >
                                  <Archive className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeleteDialog({ mode: "single", quotes: [q] })}
                                title="Borrar cotización"
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
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

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Mostrando {((currentPage - 1) * pageSize) + 1}–{Math.min(currentPage * pageSize, filtered.length)} de {filtered.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium min-w-[80px] text-center">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">Por página:</span>
                <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
                  <SelectTrigger className="w-[70px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        )}
      </main>

      {/* ── Archive confirmation dialog ── */}
      <AlertDialog open={!!archiveDialog} onOpenChange={(open) => { if (!open) { setArchiveDialog(null); setArchiveReason(""); } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Archive className="h-5 w-5" />
              Archivar {archiveDialog?.quotes.length === 1 ? "cotización" : `${archiveDialog?.quotes.length} cotizaciones`}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  {archiveDialog?.quotes.length === 1
                    ? `¿Archivar la cotización #${archiveDialog.quotes[0].quote_number} de ${archiveDialog.quotes[0].client_name || archiveDialog.quotes[0].client_company || "cliente"}?`
                    : `¿Archivar ${archiveDialog?.quotes.length} cotizaciones seleccionadas?`
                  }
                </p>
                <p className="text-xs">Los números de cotización no se reasignan.</p>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">Motivo de archivo (opcional)</label>
                  <Textarea
                    placeholder="Ej: Cliente desistió, cotización vencida..."
                    value={archiveReason}
                    onChange={(e) => setArchiveReason(e.target.value)}
                    className="min-h-[70px]"
                  />
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processingBulk}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={processingBulk}
              onClick={(e) => {
                e.preventDefault();
                if (archiveDialog) handleArchive(archiveDialog.quotes, archiveReason);
              }}
            >
              {processingBulk ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Archivando...</> : "Sí, archivar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Delete confirmation dialog ── */}
      <AlertDialog open={!!deleteDialog} onOpenChange={(open) => { if (!open) { setDeleteDialog(null); setDeleteReason(""); } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Borrar {deleteDialog?.quotes.length === 1 ? "cotización" : `${deleteDialog?.quotes.length} cotizaciones`}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>
                  {deleteDialog?.quotes.length === 1
                    ? `¿Borrar permanentemente la cotización #${deleteDialog.quotes[0].quote_number} de ${deleteDialog.quotes[0].client_name || deleteDialog.quotes[0].client_company || "cliente"}?`
                    : `¿Borrar permanentemente ${deleteDialog?.quotes.length} cotizaciones seleccionadas?`
                  }
                </p>
                <p className="text-xs font-medium text-destructive">Esta acción no se puede deshacer. Los números de cotización no se reasignan.</p>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1.5">Motivo de eliminación (opcional)</label>
                  <Textarea
                    placeholder="Ej: Cotización duplicada, error de datos..."
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    className="min-h-[70px]"
                  />
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processingBulk}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={processingBulk}
              onClick={(e) => {
                e.preventDefault();
                if (deleteDialog) handleDelete(deleteDialog.quotes, deleteReason);
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              {processingBulk ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Borrando...</> : "Sí, borrar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Payment confirmation dialog */}
      <AlertDialog open={!!confirmingPayment} onOpenChange={(open) => { if (!open) setConfirmingPayment(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar pago de cliente</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Confirmar el pago de la cotización #{confirmingPayment?.quote_number} de{" "}
              <span className="font-semibold">{confirmingPayment?.client_name || confirmingPayment?.client_company || "cliente"}</span>?
              <br /><br />
              Esto marcará la cotización como pagada y enviará la confirmación al cliente.
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

      {/* Pipedrive confirmation dialog */}
      <AlertDialog open={!!confirmingPipedrive} onOpenChange={(open) => { if (!open) setConfirmingPipedrive(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <img src={pipedriveIcon} alt="Pipedrive" className="h-6 w-6 rounded-full" />
              Enviar trato a Pipedrive
            </AlertDialogTitle>
            <AlertDialogDescription>
              {!confirmingPipedrive?.entry_payment_paid && (
                <span className="block text-amber-600 font-medium mb-2">
                  ⚠️ Ningún pago ha sido registrado hasta ahora.
                </span>
              )}
              ¿Desea crear el trato en Pipedrive para la cotización #{confirmingPipedrive?.quote_number} de{" "}
              <span className="font-semibold">{confirmingPipedrive?.client_name || confirmingPipedrive?.client_company || "cliente"}</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async (e) => {
                e.preventDefault();
                if (!confirmingPipedrive) return;
                const q = confirmingPipedrive;
                const finalTotal = q.discount_amount > 0 ? q.discounted_total : q.total;
                const quoteUrl = `${PUBLISHED_DOMAIN}/cotizacion?id=${q.id}`;
                try {
                  await fetch(ZAPIER_WEBHOOK_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    mode: "no-cors",
                    body: JSON.stringify({
                      company_name: q.client_company || q.client_name || "",
                      client_name: q.client_name || "",
                      client_email: q.client_email || "",
                      cantidad_usuarios: String(q.clients_count),
                      products: getPlatforms(q.items),
                      agent_name: q.seller_name || "",
                      numero_presupuesto: String(q.quote_number),
                      fecha: formatDate(q.created_at),
                      contacto: q.client_phone || q.client_email || "",
                      total: fmt(finalTotal),
                      link_presupuesto: quoteUrl,
                    }),
                  });
                  await supabase.from("quotes").update({ pipedrive_sent: true } as any).eq("id", q.id);
                  setQuotes(prev => prev.map(x => x.id === q.id ? { ...x, pipedrive_sent: true } : x));
                  toast({ title: "Enviado a Pipedrive", description: `Trato #${q.quote_number} enviado correctamente.` });
                } catch (err: any) {
                  toast({ title: "Error al enviar a Pipedrive", description: err.message, variant: "destructive" });
                }
                setConfirmingPipedrive(null);
              }}
              className="bg-[#017737] hover:bg-[#015a2a]"
            >
              Sí, enviar trato
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Contact detail drawer ── */}
      <Sheet open={!!drawerQuote} onOpenChange={(open) => { if (!open) { setDrawerQuote(null); setCopiedField(null); } }}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-lg">
              {drawerQuote?.client_name || "Sin nombre"}
            </SheetTitle>
            {drawerQuote?.client_company && (
              <p className="text-sm text-muted-foreground">{drawerQuote.client_company}</p>
            )}
          </SheetHeader>

          <div className="space-y-4">
            {[
              { key: "nombre", label: "Nombre", value: drawerQuote?.client_name || "—" },
              { key: "empresa", label: "Empresa", value: drawerQuote?.client_company || "—" },
              { key: "numero", label: "Número", value: drawerQuote?.client_phone || "—" },
              { key: "correo", label: "Correo", value: drawerQuote?.client_email || "—" },
              { key: "linkedin", label: "LinkedIn", value: "—" },
              { key: "cotizacion", label: "Cotización", value: drawerQuote ? `#${drawerQuote.quote_number}` : "—" },
            ].map(({ key, label, value }) => (
              <div key={key}>
                <p className="text-xs text-muted-foreground mb-1">{label}</p>
                <div className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2.5">
                  {key === "linkedin" && value !== "—" ? (
                    <a
                      href={value}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-sm text-primary underline underline-offset-2 truncate flex items-center gap-1.5"
                    >
                      <Linkedin className="h-3.5 w-3.5 shrink-0" />
                      {value}
                    </a>
                  ) : (
                    <span className={`flex-1 text-sm truncate ${value === "—" ? "text-muted-foreground" : "text-foreground"}`}>
                      {value}
                    </span>
                  )}
                  {value !== "—" && (
                    <button
                      onClick={() => handleCopyField(key, value)}
                      className="shrink-0 flex items-center gap-1 text-xs px-2 py-1 rounded hover:bg-accent transition-colors"
                    >
                      {copiedField === key ? (
                        <span className="text-emerald-600 flex items-center gap-1">
                          <Check className="h-3.5 w-3.5" /> Copiado
                        </span>
                      ) : (
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Copy className="h-3.5 w-3.5" /> Copiar
                        </span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MisCotizaciones;
