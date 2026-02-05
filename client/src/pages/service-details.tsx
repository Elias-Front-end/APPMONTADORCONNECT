import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { LayoutShell } from "@/components/layout-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  MapPin, Calendar, Clock, DollarSign, FileText, Video, User, 
  CheckCircle, AlertCircle, Phone
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Service, Profile } from "@shared/schema";

export default function ServiceDetails() {
  const [match, params] = useRoute("/services/:id");
  const id = params?.id;
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const { data: service, isLoading } = useQuery<Service>({
    queryKey: [`/api/services/${id}`],
    enabled: !!id,
  });

  const { data: montador } = useQuery<Profile>({
    queryKey: [`/api/profiles/${service?.montadorId}`],
    enabled: !!service?.montadorId,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      const res = await apiRequest("PUT", `/api/services/${id}`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/services/${id}`] });
      toast({
        title: "Status atualizado",
        description: "O status do serviço foi alterado com sucesso.",
      });
    },
  });

  if (isLoading) {
    return (
      <LayoutShell>
        <div className="space-y-4">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </LayoutShell>
    );
  }

  if (!service) {
    return (
      <LayoutShell>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-slate-900">Serviço não encontrado</h2>
          <Button className="mt-4" onClick={() => setLocation("/services")}>Voltar para lista</Button>
        </div>
      </LayoutShell>
    );
  }

  const isOwner = user?.id === service.creatorId; // Or company check
  const isAssignedMontador = user?.id === service.montadorId;

  const statusColors: Record<string, string> = {
    draft: "bg-slate-100 text-slate-800",
    published: "bg-blue-100 text-blue-800",
    scheduled: "bg-purple-100 text-purple-800",
    in_progress: "bg-orange-100 text-orange-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };

  const statusLabels: Record<string, string> = {
    draft: "Rascunho",
    published: "Publicado",
    scheduled: "Agendado",
    in_progress: "Em Andamento",
    completed: "Concluído",
    cancelled: "Cancelado",
  };

  return (
    <LayoutShell>
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge className={statusColors[service.status || 'draft']}>
              {statusLabels[service.status || 'draft']}
            </Badge>
            {service.isUrgent && (
              <Badge variant="destructive">Urgente</Badge>
            )}
            <Badge variant="outline" className="capitalize">
              {service.category?.replace(/_/g, " ")}
            </Badge>
          </div>
          <h1 className="text-3xl font-display font-bold text-slate-900">{service.title}</h1>
          <div className="flex items-center text-slate-500 mt-2 gap-4 text-sm">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {service.addressFull}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {service.scheduledFor 
                ? format(new Date(service.scheduledFor), "dd/MM/yyyy HH:mm", { locale: ptBR }) 
                : "Não agendado"}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          {isOwner && service.status === 'published' && (
            <Button variant="outline">Atribuir Montador</Button>
          )}
          {isAssignedMontador && service.status === 'scheduled' && (
            <Button onClick={() => updateStatusMutation.mutate('in_progress')}>
              Iniciar Serviço
            </Button>
          )}
          {isAssignedMontador && service.status === 'in_progress' && (
            <Button onClick={() => updateStatusMutation.mutate('completed')} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="w-4 h-4 mr-2" />
              Concluir Serviço
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detalhes do Serviço</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Descrição</h4>
                <p className="text-slate-600 whitespace-pre-wrap">{service.description}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-1">Cliente</h4>
                  <p className="font-medium">{service.clientName}</p>
                  {service.clientPhone && (
                    <div className="flex items-center gap-1 text-slate-600 text-sm">
                      <Phone className="w-3 h-3" />
                      {service.clientPhone}
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-1">Valor</h4>
                  <p className="font-medium text-lg flex items-center text-green-700">
                    <DollarSign className="w-4 h-4 mr-1" />
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((service.price || 0) / 100)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Arquivos e Anexos</CardTitle>
              <CardDescription>Documentos técnicos e vídeos do projeto</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="documents">
                <TabsList className="mb-4">
                  <TabsTrigger value="documents">Documentos ({service.documents?.length || 0})</TabsTrigger>
                  <TabsTrigger value="videos">Vídeos ({service.videos?.length || 0})</TabsTrigger>
                </TabsList>
                
                <TabsContent value="documents" className="space-y-2">
                  {service.documents && service.documents.length > 0 ? (
                    service.documents.map((doc, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-blue-600" />
                          <span className="text-sm font-medium truncate max-w-[200px] sm:max-w-md">
                            {doc.split('/').pop()}
                          </span>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <a href={doc} target="_blank" rel="noopener noreferrer">Baixar</a>
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 text-center py-4">Nenhum documento anexado.</p>
                  )}
                </TabsContent>
                
                <TabsContent value="videos" className="space-y-2">
                  {service.videos && service.videos.length > 0 ? (
                    service.videos.map((vid, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border">
                        <div className="flex items-center gap-3">
                          <Video className="w-5 h-5 text-red-600" />
                          <span className="text-sm font-medium truncate max-w-[200px] sm:max-w-md">
                            {vid.split('/').pop()}
                          </span>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <a href={vid} target="_blank" rel="noopener noreferrer">Assistir</a>
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 text-center py-4">Nenhum vídeo anexado.</p>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Equipe</CardTitle>
            </CardHeader>
            <CardContent>
              {montador ? (
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">
                    {montador.fullName?.[0] || <User className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{montador.fullName}</p>
                    <p className="text-xs text-slate-500 capitalize">{montador.level || "Montador"}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 bg-slate-50 rounded border border-dashed">
                  <User className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                  <p className="text-sm text-slate-500">Nenhum montador atribuído</p>
                  {isOwner && (
                    <Button variant="link" className="text-blue-600">Atribuir agora</Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Qualificação Necessária</CardTitle>
            </CardHeader>
            <CardContent>
               <div className="flex items-center gap-2">
                 <Badge variant="secondary" className="capitalize text-base px-3 py-1">
                   {service.minQualification || "Iniciante"}
                 </Badge>
                 <span className="text-sm text-slate-500">ou superior</span>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </LayoutShell>
  );
}
