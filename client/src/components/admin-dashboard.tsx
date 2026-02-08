import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  usePendingProfiles, 
  useApproveProfile, 
  useBlockProfile, 
  useAuditLogs 
} from "@/hooks/use-admin";
import { Loader2, CheckCircle2, XCircle, ShieldAlert, History } from "lucide-react";

export function AdminDashboard() {
  const { data: pendingProfiles, isLoading: loadingProfiles } = usePendingProfiles();
  const { data: auditLogs, isLoading: loadingLogs } = useAuditLogs();
  const approve = useApproveProfile();
  const block = useBlockProfile();

  if (loadingProfiles || loadingLogs) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-100">
          <CardContent className="pt-6">
            <p className="text-blue-600 text-sm font-medium">Aguardando Aprovação</p>
            <h3 className="text-2xl font-bold text-blue-900">{pendingProfiles?.length || 0}</h3>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="approvals" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="approvals" className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" /> Aprovações
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <History className="w-4 h-4" /> Logs de Auditoria
          </TabsTrigger>
        </TabsList>

        <TabsContent value="approvals" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Perfis Pendentes</CardTitle>
              <CardDescription>Valide novos cadastros de montadores e empresas.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>CPF/CNPJ</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingProfiles?.map((p: any) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.fullName}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{p.role}</Badge>
                      </TableCell>
                      <TableCell>{p.cpf || p.cnpj || '-'}</TableCell>
                      <TableCell className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => approve.mutate(p.id)}
                          disabled={approve.isPending}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" /> Aprovar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => block.mutate(p.id)}
                          disabled={block.isPending}
                        >
                          <XCircle className="w-4 h-4 mr-1" /> Bloquear
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {pendingProfiles?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                        Nenhum perfil aguardando aprovação.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Auditoria do Sistema</CardTitle>
              <CardDescription>Histórico imutável de ações críticas do MVP.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Ator</TableHead>
                    <TableHead>Detalhes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs?.map((log: any) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-xs text-slate-500">
                        {new Date(log.createdAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-[10px] uppercase">
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{log.actorId || 'Sistema'}</TableCell>
                      <TableCell className="text-sm">
                        <pre className="text-[10px] bg-slate-50 p-1 rounded max-w-xs overflow-hidden">
                          {JSON.stringify(log.details)}
                        </pre>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
