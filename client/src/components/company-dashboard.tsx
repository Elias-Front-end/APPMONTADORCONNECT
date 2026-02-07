import { useState } from "react";
import { Link } from "wouter";
import { useServices, useDeleteService } from "@/hooks/use-services";
import { Service } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths 
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Calendar as CalendarIcon, MoreVertical, Trash2, Edit, Users, ChevronLeft, ChevronRight, Clock, CheckCircle2, AlertCircle 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface CompanyDashboardProps {
  companyId: number;
}

export function CompanyDashboard({ companyId }: CompanyDashboardProps) {
  const { data: services, isLoading } = useServices({ companyId });

  if (isLoading) {
    return <div>Carregando dashboard...</div>;
  }

  const activeServices = services?.filter(s => s.status !== 'cancelled' && s.status !== 'completed') || [];
  
  return (
    <div className="space-y-8">
      {/* Calendar Section */}
      <section>
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-blue-600" />
          Calendário de Serviços
        </h2>
        <ServiceCalendar services={services || []} />
      </section>

      {/* Active Services List Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
           <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-green-600" />
            Serviços Ativos
          </h2>
          <Link href="/services/new">
            <Button size="sm">Novo Serviço</Button>
          </Link>
        </div>
        <Card>
          <CardContent className="p-0">
             <ActiveServicesList services={activeServices} />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function ActiveServicesList({ services }: { services: Service[] }) {
  const deleteMutation = useDeleteService();
  const { toast } = useToast();

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja excluir este serviço?")) {
      try {
        await deleteMutation.mutateAsync(id);
        toast({ title: "Serviço excluído", description: "O serviço foi removido com sucesso." });
      } catch (error) {
        toast({ title: "Erro", description: "Falha ao excluir serviço.", variant: "destructive" });
      }
    }
  };

  if (services.length === 0) {
    return <div className="p-8 text-center text-slate-500">Nenhum serviço ativo no momento.</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Título</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead>Data</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {services.map((service) => (
          <TableRow key={service.id}>
            <TableCell className="font-medium">{service.title}</TableCell>
            <TableCell>{service.clientName}</TableCell>
            <TableCell>
              {service.scheduledFor 
                ? format(new Date(service.scheduledFor), "dd/MM/yyyy", { locale: ptBR }) 
                : "Não agendado"}
            </TableCell>
            <TableCell>
              <StatusBadge status={service.status || 'draft'} />
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <Link href={`/services/${service.id}/edit`}>
                    <DropdownMenuItem>
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem>
                    <Users className="w-4 h-4 mr-2" />
                    Gerenciar Equipe
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-red-600 focus:text-red-600"
                    onClick={() => handleDelete(service.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

function ServiceCalendar({ services }: { services: Service[] }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const getServicesForDay = (date: Date) => {
    return services.filter(s => 
      s.scheduledFor && isSameDay(new Date(s.scheduledFor), date)
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-medium">
          {format(currentDate, "MMMM yyyy", { locale: ptBR })}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-lg overflow-hidden">
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
            <div key={day} className="bg-slate-50 p-2 text-center text-xs font-semibold text-slate-500 uppercase">
              {day}
            </div>
          ))}
          
          {/* Padding for start of month */}
          {Array.from({ length: startOfMonth(currentDate).getDay() }).map((_, i) => (
             <div key={`empty-${i}`} className="bg-white h-32" />
          ))}

          {daysInMonth.map((day) => {
            const dayServices = getServicesForDay(day);
            return (
              <div key={day.toISOString()} className="bg-white h-32 p-2 hover:bg-slate-50 transition-colors border-t border-slate-100 relative group overflow-hidden">
                 <span className={`text-sm font-medium ${isSameDay(day, new Date()) ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center' : 'text-slate-700'}`}>
                   {format(day, "d")}
                 </span>
                 
                 <div className="mt-1 space-y-1 overflow-y-auto max-h-[80px]">
                   {dayServices.map(service => (
                     <HoverCard key={service.id}>
                       <HoverCardTrigger asChild>
                         <div 
                           className={`
                             text-xs p-1.5 rounded cursor-pointer truncate border-l-2 shadow-sm
                             ${getStatusColor(service.status || 'draft')}
                           `}
                         >
                           {service.title}
                         </div>
                       </HoverCardTrigger>
                       <HoverCardContent className="w-80">
                         <div className="space-y-4">
                            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border">
                              <span className="text-slate-500 text-sm">Status</span>
                              <StatusBadge status={service.status || 'draft'} />
                            </div>
                            <div className="space-y-1">
                              <h4 className="text-sm font-semibold">{service.title}</h4>
                              <p className="text-sm text-slate-500">{service.description}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-slate-700 uppercase">Cliente</p>
                              <p className="text-sm text-slate-600">{service.clientName}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-slate-700 uppercase">Endereço</p>
                              <p className="text-sm text-slate-600">{service.addressFull}</p>
                            </div>
                            <div className="flex gap-2 justify-end mt-4 pt-2 border-t">
                              <Link href={`/services/${service.id}/edit`}>
                                <Button variant="outline" size="sm">Editar</Button>
                              </Link>
                              <Button size="sm">Ver Detalhes</Button>
                            </div>
                         </div>
                       </HoverCardContent>
                     </HoverCard>
                   ))}
                 </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case 'scheduled': return 'bg-blue-50 border-blue-500 text-blue-700 hover:bg-blue-100';
    case 'in_progress': return 'bg-yellow-50 border-yellow-500 text-yellow-700 hover:bg-yellow-100';
    case 'completed': return 'bg-green-50 border-green-500 text-green-700 hover:bg-green-100';
    case 'cancelled': return 'bg-red-50 border-red-500 text-red-700 hover:bg-red-100';
    default: return 'bg-slate-50 border-slate-500 text-slate-700 hover:bg-slate-100';
  }
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    draft: "bg-slate-100 text-slate-700",
    published: "bg-purple-100 text-purple-700",
    scheduled: "bg-blue-100 text-blue-700",
    in_progress: "bg-yellow-100 text-yellow-800",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
    disputed: "bg-orange-100 text-orange-700",
  };
  
  const labels = {
    draft: "Rascunho",
    published: "Publicado",
    scheduled: "Agendado",
    in_progress: "Em Andamento",
    completed: "Concluído",
    cancelled: "Cancelado",
    disputed: "Em Disputa",
  };

  return (
    <Badge variant="outline" className={`${styles[status as keyof typeof styles] || styles.draft} border-none`}>
      {labels[status as keyof typeof labels] || status}
    </Badge>
  );
}
