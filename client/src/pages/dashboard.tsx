import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profiles";
import { useServices } from "@/hooks/use-services";
import { LayoutShell } from "@/components/layout-shell";
import { ServiceCard } from "@/components/service-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Wallet, TrendingUp, AlertCircle } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: profile, isLoading: isProfileLoading } = useProfile();
  const { data: services, isLoading: isServicesLoading } = useServices();

  if (isProfileLoading || isServicesLoading) {
    return (
      <LayoutShell>
        <div className="space-y-8">
          <Skeleton className="h-12 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-32" /><Skeleton className="h-32" /><Skeleton className="h-32" />
          </div>
        </div>
      </LayoutShell>
    );
  }

  // Welcome state if profile is incomplete
  if (!profile) {
    return (
      <LayoutShell>
        <Card className="max-w-2xl mx-auto mt-10 border-blue-200 bg-blue-50">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-blue-900 mb-2">Bem-vindo, {user?.firstName}!</h2>
            <p className="text-blue-700 mb-6">Para começar a usar a plataforma, precisamos completar seu perfil.</p>
            <Link href="/profile">
              <Button className="bg-blue-600 hover:bg-blue-700">Completar Perfil Agora</Button>
            </Link>
          </CardContent>
        </Card>
      </LayoutShell>
    );
  }

  // Filter services based on role
  const myServices = services?.filter(s => 
    profile.role === 'montador' 
      ? s.montadorId === profile.id // As montador: Assigned to me
      : s.companyId === profile.companyId // As partner: Created by my company
  ) || [];

  const upcomingServices = myServices.filter(s => ['scheduled', 'in_progress'].includes(s.status || '')).slice(0, 3);
  
  const totalEarnings = myServices
    .filter(s => s.status === 'completed')
    .reduce((acc, curr) => acc + (curr.price || 0), 0);

  return (
    <LayoutShell>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">
            Olá, {user?.firstName}
          </h1>
          <p className="text-slate-500 mt-1">
            Aqui está o resumo das suas atividades hoje.
          </p>
        </div>
        {profile.role === 'partner' && (
          <Link href="/services/new">
            <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20">
              <Plus className="w-5 h-5 mr-2" />
              Nova Ordem de Serviço
            </Button>
          </Link>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Card className="border-none shadow-sm bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-white/10 rounded-lg">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-medium bg-white/10 px-2 py-1 rounded text-blue-100">Este Mês</span>
            </div>
            <p className="text-blue-100 text-sm font-medium">Ganhos Totais</p>
            <h3 className="text-3xl font-bold mt-1">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalEarnings / 100)}
            </h3>
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Briefcase className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-slate-500 text-sm font-medium">Serviços Ativos</p>
            <h3 className="text-3xl font-bold text-slate-900 mt-1">
              {upcomingServices.length}
            </h3>
          </CardContent>
        </Card>

        <Card className="border-slate-100 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-50 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-slate-500 text-sm font-medium">Taxa de Conclusão</p>
            <h3 className="text-3xl font-bold text-slate-900 mt-1">98%</h3>
          </CardContent>
        </Card>
      </div>

      {/* Recent/Upcoming Services */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">
          {profile.role === 'montador' ? 'Próximos Serviços' : 'Serviços Recentes'}
        </h2>
        <Link href="/services">
          <Button variant="ghost" className="text-blue-600 hover:bg-blue-50">Ver todos</Button>
        </Link>
      </div>

      {upcomingServices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingServices.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      ) : (
        <Card className="border-dashed border-2 bg-slate-50">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Briefcase className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-900">Nenhum serviço agendado</h3>
            <p className="text-slate-500 max-w-sm mt-1 mb-6">
              {profile.role === 'montador' 
                ? 'Você não tem serviços agendados para os próximos dias.'
                : 'Sua empresa ainda não criou ordens de serviço.'}
            </p>
            {profile.role === 'partner' && (
              <Link href="/services/new">
                <Button>Criar Serviço</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </LayoutShell>
  );
}

function Briefcase({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}
