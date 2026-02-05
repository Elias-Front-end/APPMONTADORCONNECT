import { useState } from "react";
import { useServices } from "@/hooks/use-services";
import { LayoutShell } from "@/components/layout-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  format, startOfMonth, endOfMonth, eachDayOfInterval, 
  isSameMonth, isSameDay, addMonths, subMonths, isToday 
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus, MapPin, Clock } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profiles";

export default function CalendarPage() {
  const { user } = useAuth();
  const { data: profile } = useProfile();
  const { data: services, isLoading } = useServices();
  const [currentDate, setCurrentDate] = useState(new Date());

  const firstDayOfMonth = startOfMonth(currentDate);
  const lastDayOfMonth = endOfMonth(currentDate);
  
  const days = eachDayOfInterval({
    start: firstDayOfMonth,
    end: lastDayOfMonth,
  });

  // Calculate padding days for the grid
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 (Sun) - 6 (Sat)
  const paddingDays = Array.from({ length: startDayOfWeek });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  // Filter services for the current view
  const myServices = services?.filter(s => 
    profile?.role === 'montador' 
      ? s.montadorId === profile.id
      : s.companyId === profile?.companyId
  ) || [];

  const getEventsForDay = (date: Date) => {
    return myServices.filter(service => 
      service.scheduledFor && isSameDay(new Date(service.scheduledFor), date)
    );
  };

  return (
    <LayoutShell>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">Calendário</h1>
          <p className="text-slate-500 mt-1">
            Gerencie seus agendamentos e serviços.
          </p>
        </div>
        {['partner', 'marcenaria', 'lojista'].includes(profile?.role || '') && (
          <Link href="/services/new">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-5 h-5 mr-2" />
              Novo Agendamento
            </Button>
          </Link>
        )}
      </div>

      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={prevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-xl font-bold min-w-[200px] text-center capitalize">
              {format(currentDate, "MMMM yyyy", { locale: ptBR })}
            </CardTitle>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="ghost" onClick={goToToday}>Hoje</Button>
        </CardHeader>
        <CardContent className="p-0">
          {/* Calendar Header */}
          <div className="grid grid-cols-7 border-b bg-slate-50">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
              <div key={day} className="py-2 text-center text-sm font-semibold text-slate-600">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 min-h-[500px]">
            {paddingDays.map((_, i) => (
              <div key={`padding-${i}`} className="border-b border-r bg-slate-50/30 p-2 min-h-[100px]" />
            ))}
            
            {days.map((day) => {
              const events = getEventsForDay(day);
              const isTodayDate = isToday(day);

              return (
                <div 
                  key={day.toISOString()} 
                  className={cn(
                    "border-b border-r p-2 min-h-[100px] transition-colors hover:bg-slate-50",
                    isTodayDate && "bg-blue-50/50"
                  )}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={cn(
                      "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full",
                      isTodayDate ? "bg-blue-600 text-white" : "text-slate-700"
                    )}>
                      {format(day, "d")}
                    </span>
                    {events.length > 0 && (
                      <span className="text-xs font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded-full">
                        {events.length}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 mt-1">
                    {events.map(event => (
                      <Link key={event.id} href={`/services/${event.id}`}>
                        <div className={cn(
                          "text-xs p-1.5 rounded cursor-pointer border truncate",
                          event.status === 'completed' ? "bg-green-50 border-green-200 text-green-700" :
                          event.status === 'scheduled' ? "bg-blue-50 border-blue-200 text-blue-700" :
                          "bg-slate-50 border-slate-200 text-slate-700"
                        )}>
                          <div className="font-semibold truncate">{event.title}</div>
                          {event.scheduledFor && (
                            <div className="flex items-center gap-1 text-[10px] opacity-80">
                              <Clock className="w-3 h-3" />
                              {format(new Date(event.scheduledFor), "HH:mm")}
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* List view for mobile or detailed view */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Agendamentos do Mês</h3>
        <div className="space-y-3">
          {days.map(day => {
            const events = getEventsForDay(day);
            if (events.length === 0) return null;
            
            return (
              <div key={day.toISOString()} className="space-y-2">
                <h4 className="text-sm font-semibold text-slate-500 capitalize bg-slate-50 p-2 rounded">
                  {format(day, "EEEE, d 'de' MMMM", { locale: ptBR })}
                </h4>
                {events.map(event => (
                  <Card key={event.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center justify-center bg-blue-50 text-blue-700 rounded-lg w-16 h-16">
                          <span className="text-xl font-bold">{format(new Date(event.scheduledFor || ""), "d")}</span>
                          <span className="text-xs uppercase">{format(new Date(event.scheduledFor || ""), "MMM", { locale: ptBR })}</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900">{event.title}</h4>
                          <div className="flex items-center text-sm text-slate-500 gap-3 mt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {format(new Date(event.scheduledFor || ""), "HH:mm")}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {event.addressFull?.split(',')[0]}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Link href={`/services/${event.id}`}>
                        <Button variant="ghost" size="sm">Detalhes</Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </LayoutShell>
  );
}
