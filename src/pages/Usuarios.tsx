import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Users } from "lucide-react";
import AppMenu from "@/components/AppMenu";

interface UserProfile {
  id: string;
  user_id: string;
  nombre: string;
  cargo: string;
  email_contacto: string;
  foto_url: string | null;
  numero: string;
  created_at: string;
  workspace?: string | null;
}

const Usuarios = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching users:", error);
        setLoading(false);
        return;
      }

      // Fetch workspace assignments
      const { data: workspaces } = await supabase
        .from("user_workspaces")
        .select("user_id, workspace_name");

      const workspaceMap = new Map<string, string>();
      workspaces?.forEach((w) => {
        workspaceMap.set(w.user_id, w.workspace_name);
      });

      const enriched = (profiles || []).map((p) => ({
        ...p,
        workspace: workspaceMap.get(p.user_id) || null,
      }));

      setUsers(enriched);
      setLoading(false);
    };

    fetchUsers();
  }, []);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.nombre.toLowerCase().includes(q) ||
      u.email_contacto.toLowerCase().includes(q) ||
      u.cargo.toLowerCase().includes(q)
    );
  });

  const getInitials = (name: string) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <AppMenu />
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Users className="h-6 w-6" />
                Usuarios
              </h1>
              <p className="text-sm text-muted-foreground">
                {users.length} cuenta{users.length !== 1 ? "s" : ""} registrada{users.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <Card className="mb-4 border-0 shadow-sm">
          <CardContent className="p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Busque..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-10 border-0 bg-muted/50 rounded-lg"
              />
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="border-0 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">Nombre</th>
                    <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">Correo electrónico</th>
                    <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Cargo</th>
                    <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">Workspace</th>
                    <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((user) => (
                    <tr key={user.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.foto_url || undefined} />
                            <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                              {getInitials(user.nombre)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{user.nombre || "Sin nombre"}</p>
                            <p className="text-xs text-muted-foreground sm:hidden">{user.email_contacto}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">
                        {user.email_contacto}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">
                        {user.cargo || "—"}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {user.workspace ? (
                          <Badge variant="outline" className="text-xs font-normal">
                            {user.workspace}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-green-500" />
                          <span className="text-sm text-green-600 dark:text-green-400">Activo</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-muted-foreground">
                        No se encontraron usuarios
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          {!loading && filtered.length > 0 && (
            <div className="px-4 py-3 border-t border-border/30 text-sm text-muted-foreground">
              Mostrando {filtered.length} de {users.length}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Usuarios;
