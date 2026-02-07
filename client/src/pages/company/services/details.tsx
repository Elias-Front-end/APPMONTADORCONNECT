import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Service, ServiceAttachment, ServiceAssignment, Profile } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profiles";
import { LayoutShell } from "@/components/layout-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ServiceForm } from "@/components/service-form";
import { ReviewModal } from "@/components/review-modal";
import { Loader2, Calendar, MapPin, User, Download, FileText, CheckCircle, AlertCircle, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ServiceDetailsPage() {
  const [match, params] = useRoute("/services/:id");
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  const serviceId = params ? parseInt(params.id) : 0;

  const { data: service, isLoading: isLoadingService } = useQuery<Service>({
    queryKey: [`/api/services/${serviceId}`],
    enabled: !!serviceId,
  });

  const { data: attachments, isLoading: isLoadingAttachments } = useQuery<ServiceAttachment[]>({
    queryKey: [`/api/services/${serviceId}/attachments`],
    enabled: !!serviceId,
  });

  const { data: assignments, isLoading: isLoadingAssignments } = useQuery<ServiceAssignment[]>({
    queryKey: [`/api/services/${serviceId}/assignments`],
    enabled: !!serviceId,
  });

  // Fetch partners for reassignment
  const { data: partnerships } = useQuery<any[]>({ 
      queryKey: ['/api/partnerships'],
      enabled: !!profile && (profile.role === 'partner' || profile.role === 'marcenaria')
  });

  const updateServiceMutation = useMutation({
    mutationFn: async (data: Partial<Service>) => {
      const res = await apiRequest("PUT", `/api/services/${serviceId}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/services/${serviceId}`] });
      toast({ title: "Serviço atualizado!", description: "As informações foram salvas." });
      setIsEditing(false);
    },
    onError: (err: any) => {
      toast({ title: "Erro ao atualizar", description: err.message, variant: "destructive" });
    }
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`/api/services/${serviceId}/attachments`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error("Falha no upload");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/services/${serviceId}/attachments`] });
      toast({ title: "Arquivo anexado!", description: "O documento foi adicionado com sucesso." });
    },
    onError: () => {
      toast({ title: "Erro no upload", description: "Não foi possível enviar o arquivo.", variant: "destructive" });
    }
  });

  const assignMutation = useMutation({
    mutationFn: async (montadorId: string) => {
       // First update service montadorId
       await apiRequest("PUT", `/api/services/${serviceId}`, { montadorId, status: "scheduled" });
       // Logic to create assignment record can be handled in backend trigger or separate call if needed.
       // Current schema has service.montadorId as direct reference.
       return;
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [`/api/services/${serviceId}`] });
        toast({ title: "Montador definido!", description: "O serviço foi atribuído com sucesso." });
    }
  });


  if (isLoadingService || !service) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const statusColors = {
    draft: "bg-slate-100 text-slate-700",
    published: "bg-blue-100 text-blue-700",
    scheduled: "bg-purple-100 text-purple-700",
    in_progress: "bg-amber-100 text-amber-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
    disputed: "bg-orange-100 text-orange-700",
  };

  const statusLabels = {
    draft: "Rascunho",
    published: "Publicado",
    scheduled: "Agendado",
    in_progress: "Em Execução",
    completed: "Concluído",
    cancelled: "Cancelado",
    disputed: "Em Disputa",
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      uploadMutation.mutate(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-display font-bold text-slate-900">OS #{service.id}</h1>
            <Badge variant="outline" className={`${statusColors[service.status as keyof typeof statusColors]} border-0`}>
              {statusLabels[service.status as keyof typeof statusColors]}
            </Badge>
          </div>
          <h2 className="text-xl text-slate-600">{service.title}</h2>
        </div>
        <div className="flex gap-2">
           {isEditing ? (
             <Button variant="outline" onClick={() => setIsEditing(false)}>Cancelar Edição</Button>
           ) : (
             <>
                <Button variant="outline" onClick={() => setIsEditing(true)}>Editar Dados</Button>
                <Button variant="outline" onClick={() => setIsEditing(true)}>Editar Dados</Button>
                {service.status === 'completed' && service.montadorId && (
                    <Button 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => setIsReviewOpen(true)}
                    >
                        <CheckCircle className="w-4 h-4 mr-2" /> Avaliar Montador
                    </Button>
                )}
             </>
           )}
        </div>
      </div>
      
      {service.montadorId && (
        <ReviewModal 
          isOpen={isReviewOpen} 
          onClose={() => setIsReviewOpen(false)} 
          serviceId={service.id} 
          montadorId={service.montadorId}
          montadorName={service.montadorId} // TODO: Pass real name when available via join
        />
      )}

      {isEditing ? (
        <ServiceForm 
            defaultValues={service} 
            onSubmit={async (data) => updateServiceMutation.mutateAsync(data)}
            isEditing={true}
            isSubmitting={updateServiceMutation.isPending}
        />
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
            {/* Main Info */}
            <div className="md:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Detalhes do Serviço</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs font-medium text-slate-500 uppercase">Cliente</p>
                                <p className="text-slate-900 font-medium">{service.clientName}</p>
                                <p className="text-sm text-slate-500">{service.clientPhone}</p>
                            </div>
                             <div>
                                <p className="text-xs font-medium text-slate-500 uppercase">Valor</p>
                                <p className="text-slate-900 font-medium whitespace-nowrap">
                                    {((service.price || 0) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-xs font-medium text-slate-500 uppercase mb-1">Localização</p>
                                <div className="flex items-start gap-2">
                                    <MapPin className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-slate-900">{service.addressFull}</p>
                                        <a 
                                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(service.addressFull)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-blue-600 hover:underline flex items-center mt-1"
                                        >
                                            Abrir no Google Maps
                                        </a>
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-2">
                                <p className="text-xs font-medium text-slate-500 uppercase mb-1">Descrição</p>
                                <p className="text-slate-700 whitespace-pre-line">{service.description || "Sem descrição."}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Arquivos e Anexos</CardTitle>
                        <div className="flex items-center gap-2">
                            <label htmlFor="file-upload" className="cursor-pointer">
                                <div className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                    {uploadMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                                    Adicionar PDF/Imagem
                                </div>
                                <input 
                                    id="file-upload" 
                                    type="file" 
                                    className="hidden" 
                                    onChange={handleFileUpload}
                                    accept=".pdf,image/*" 
                                    disabled={uploadMutation.isPending}
                                />
                            </label>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoadingAttachments ? (
                            <div className="flex justify-center py-4"><Loader2 className="animate-spin text-slate-400" /></div>
                        ) : attachments && attachments.length > 0 ? (
                            <div className="space-y-2">
                                {attachments.map(att => (
                                    <div key={att.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center text-slate-500">
                                                {att.fileType === 'pdf' ? <FileText className="w-5 h-5" /> : <Download className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900 text-sm">{att.fileName}</p>
                                                <p className="text-xs text-slate-500">{format(new Date(att.uploadedAt || new Date()), "dd 'de' MMM 'às' HH:mm", { locale: ptBR })}</p>
                                            </div>
                                        </div>
                                        <Button size="sm" variant="ghost" asChild>
                                            <a href={att.fileUrl} target="_blank" rel="noopener noreferrer">
                                                <Download className="w-4 h-4" />
                                            </a>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-500 text-sm bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                Nenhum arquivo anexado ainda.
                                <br/>
                                Adicione plantas ou manuais de montagem.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Side Panel (Assignments) */}
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Execução</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                         <div>
                            <p className="text-xs font-medium text-slate-500 uppercase mb-2">Montador Responsável</p>
                            {service.montadorId ? (
                                <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center text-blue-700 font-bold">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900">{service.montadorId} {/* TODO: Fetch Montador Name by ID */}</p>
                                            <p className="text-xs text-blue-600 font-medium">Atribuído</p>
                                        </div>
                                    </div>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="ghost" size="sm" className="w-full mt-3 text-slate-600 h-8">
                                                Alterar Montador
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Alterar Montador</DialogTitle>
                                            </DialogHeader>
                                            <div className="py-4">
                                                <Label>Selecione um novo parceiro</Label>
                                                <Select onValueChange={(val) => assignMutation.mutate(val)}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Escolha um montador" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {partnerships?.map((p: any) => ( // Typings needed or simplistic approach
                                                            <SelectItem key={p.id} value={p.montadorId}>
                                                                {p.montador?.fullName || p.montador?.id}
                                                            </SelectItem>
                                                        ))}
                                                        {(!partnerships || partnerships.length === 0) && (
                                                            <div className="p-2 text-sm text-slate-500 text-center">Nenhum parceiro disponível</div>
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            ) : (
                                <div className="text-center py-4 bg-slate-50 border border-dashed border-slate-200 rounded-lg">
                                    <p className="text-sm text-slate-500 mb-2">Nenhum montador atribuído</p>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                           <Button size="sm" variant="outline">Atribuir Agora</Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Atribuir Montador</DialogTitle>
                                            </DialogHeader>
                                            <div className="py-4">
                                                <Label>Selecione um parceiro</Label>
                                                <Select onValueChange={(val) => assignMutation.mutate(val)}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Escolha um montador" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {/* Mock or fetch active partnerships */}
                                                        {partnerships?.map((p: any) => ( 
                                                            <SelectItem key={p.id} value={p.montadorId}>
                                                                {p.montadorId} {/* Improving this needs join */}
                                                            </SelectItem>
                                                        ))}
                                                         <SelectItem value="temp-mock-id">Montador Mock</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            )}
                         </div>

                         <div>
                             <p className="text-xs font-medium text-slate-500 uppercase mb-2">Agendamento</p>
                             <div className="flex items-center gap-2 text-slate-700">
                                 <Calendar className="w-5 h-5 text-slate-400" />
                                 {service.scheduledFor ? (
                                     <span>{format(new Date(service.scheduledFor), "dd/MM/yyyy 'às' HH:mm")} ({service.durationHours}h)</span>
                                 ) : (
                                     <span className="text-slate-400 italic">Data não definida</span>
                                 )}
                             </div>
                         </div>
                    </CardContent>
                </Card>
            </div>
        </div>
      )}
    </div>
  );
}
