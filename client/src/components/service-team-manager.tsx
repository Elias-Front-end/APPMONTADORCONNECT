import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTeamManagement } from "@/hooks/use-team-management";
import { Loader2, UserPlus, X, Check, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAlert } from "@/hooks/use-alert";
import { Badge } from "@/components/ui/badge";

interface ServiceTeamManagerProps {
  serviceId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ServiceTeamManager({ serviceId, open, onOpenChange }: ServiceTeamManagerProps) {
  const { 
    montadores, 
    isLoadingMontadores, 
    assignments, 
    isLoadingAssignments,
    inviteMutation,
    updateAssignmentMutation
  } = useTeamManagement(serviceId);
  const { showAlert } = useAlert();

  const [searchTerm, setSearchTerm] = useState("");

  const filteredMontadores = montadores?.filter(m => 
    m.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.skills?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle>Gerenciar Equipe do Serviço</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="team" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="team">Equipe Atual ({assignments?.filter(a => a.status !== 'removed').length || 0})</TabsTrigger>
            <TabsTrigger value="search">Buscar Montadores</TabsTrigger>
          </TabsList>

          <TabsContent value="team" className="flex-1 overflow-y-auto pr-2">
            {isLoadingAssignments ? (
              <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
            ) : assignments?.length === 0 ? (
               <div className="text-center py-8 text-slate-500">Nenhum montador na equipe ainda.</div>
            ) : (
                <div className="space-y-4">
                   {assignments?.map((assignment: any) => {
                      if (assignment.status === 'removed') return null;
                      
                      // Using the joined data from backend
                      const profile = assignment.montador; 
                      if (!profile) return null;

                      return (
                        <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg">
                           <div className="flex items-center gap-3">
                             <Avatar>
                               <AvatarImage src={profile.avatarUrl || undefined} />
                               <AvatarFallback>{profile.fullName?.charAt(0) || '?'}</AvatarFallback>
                             </Avatar>
                             <div>
                               <p className="font-medium text-sm">{profile.fullName || "Sem nome"}</p>
                               <p className="text-[10px] text-slate-500 capitalize">{assignment.status}</p>
                             </div>
                           </div>
                           <div className="flex gap-2">
                               {assignment.status === 'invited' && (
                                 <Badge variant="secondary" className="text-[10px]">Aguardando</Badge>
                               )}
                               <Button 
                                 variant="ghost" 
                                 size="icon"
                                 className="h-8 w-8 hover:bg-red-50"
                                 onClick={() => {
                                   showAlert({
                                     title: "Confirmar Remoção",
                                     message: `Deseja realmente remover ${profile.fullName} da equipe?`,
                                     type: "warning",
                                     confirmText: "Remover",
                                     cancelText: "Cancelar",
                                     onConfirm: () => updateAssignmentMutation?.mutate({ id: assignment.id, status: 'removed' })
                                   });
                                 }} 
                                 title="Remover da equipe"
                               >
                                 <X className="w-4 h-4 text-red-400" />
                               </Button>
                           </div>
                        </div>
                      );
                   })}
                </div>
            )}
          </TabsContent>

          <TabsContent value="search" className="flex-1 overflow-y-auto pr-2">
             <div className="relative mb-4">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Buscar por nome ou habilidade..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
             </div>
             
             {isLoadingMontadores ? (
                <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
             ) : (
                <div className="space-y-4">
                  {filteredMontadores?.map(montador => {
                     const isAssigned = assignments?.some(a => a.montadorId === montador.id && a.status !== 'removed');
                     
                     return (
                       <div key={montador.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50">
                          <div className="flex items-center gap-3">
                             <Avatar>
                               <AvatarImage src={montador.avatarUrl || undefined} />
                               <AvatarFallback>{montador.fullName?.charAt(0)}</AvatarFallback>
                             </Avatar>
                             <div>
                               <p className="font-medium">{montador.fullName}</p>
                               <div className="flex gap-1 flex-wrap">
                                 {montador.skills?.slice(0,3).map((skill: string) => (
                                   <Badge key={skill} variant="outline" className="text-[10px]">{skill}</Badge>
                                 ))}
                               </div>
                             </div>
                          </div>
                          
                          {isAssigned ? (
                            <Button disabled variant="secondary" size="sm">Na Equipe</Button>
                          ) : (
                            <Button 
                              size="sm" 
                              onClick={() => inviteMutation.mutate(montador.id)}
                              disabled={inviteMutation.isPending}
                            >
                              {inviteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4 mr-2" />}
                              Convidar
                            </Button>
                          )}
                       </div>
                     );
                  })}
                </div>
             )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
