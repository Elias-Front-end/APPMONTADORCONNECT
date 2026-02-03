import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, DollarSign, Clock } from "lucide-react";
import type { Service } from "@shared/schema";
import { useLocation } from "wouter";

interface ServiceCardProps {
  service: Service;
}

export function ServiceCard({ service }: ServiceCardProps) {
  const [, setLocation] = useLocation();
  
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
    published: "Disponível",
    scheduled: "Agendado",
    in_progress: "Em Progresso",
    completed: "Concluído",
    cancelled: "Cancelado",
    disputed: "Em Disputa",
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 overflow-hidden">
      <CardHeader className="p-5 pb-3">
        <div className="flex justify-between items-start mb-2">
          <Badge className={statusColors[service.status as keyof typeof statusColors] || "bg-slate-100"}>
            {statusLabels[service.status as keyof typeof statusLabels] || service.status}
          </Badge>
          {service.isUrgent && (
            <Badge variant="destructive" className="animate-pulse">Urgente</Badge>
          )}
        </div>
        <h3 className="text-lg font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
          {service.title}
        </h3>
        <div className="flex items-center text-slate-500 text-sm mt-1">
          <MapPin className="w-4 h-4 mr-1.5 shrink-0" />
          <span className="truncate">{service.addressFull}</span>
        </div>
      </CardHeader>
      
      <CardContent className="p-5 pt-0">
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="flex items-center p-2.5 bg-slate-50 rounded-lg">
            <Calendar className="w-4 h-4 mr-2 text-slate-400" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-semibold text-slate-400">Data</span>
              <span className="text-sm font-medium text-slate-700">
                {service.scheduledFor 
                  ? format(new Date(service.scheduledFor), "dd/MM", { locale: ptBR }) 
                  : "A definir"}
              </span>
            </div>
          </div>
          
          <div className="flex items-center p-2.5 bg-slate-50 rounded-lg">
            <DollarSign className="w-4 h-4 mr-2 text-slate-400" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-semibold text-slate-400">Valor</span>
              <span className="text-sm font-medium text-slate-700">
                {service.price 
                  ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.price / 100) 
                  : "A combinar"}
              </span>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0 border-t border-slate-50 mt-4 bg-slate-50/50">
        <Button 
          className="w-full mt-4 bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 shadow-sm"
          onClick={() => setLocation(`/services/${service.id}`)}
        >
          Ver Detalhes
        </Button>
      </CardFooter>
    </Card>
  );
}
