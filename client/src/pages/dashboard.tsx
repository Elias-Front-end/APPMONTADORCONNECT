import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profiles";
import { useServices } from "@/hooks/use-services";
import { ServiceCard } from "@/components/service-card";
import { CompanyDashboard } from "@/components/company-dashboard";
import { AdminDashboard } from "@/components/admin-dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Wallet, TrendingUp, AlertCircle, Briefcase } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: profile, isLoading: isProfileLoading } = useProfile();
  const { data: services, isLoading: isServicesLoading } = useServices();

  if (isProfileLoading || isServicesLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  // Welcome state if profile is incomplete
  if (!profile) {
    return (
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
    );
  }

  const isCompany = profile.role === 'marcenaria' || profile.role === 'lojista';

  if (isCompany && profile.companyId) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900">
              Olá, {profile.fullName || user?.firstName}
            </h1>
            <p className="text-slate-500 mt-1">
              Painel de Controle da Empresa
            </p>
          </div>
        </div>
        <CompanyDashboard companyId={profile.companyId} />
      </div>
    );
  }

  if (profile.role === 'admin') {
    return (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900">
              Painel Administrativo
            </h1>
            <p className="text-slate-500 mt-1">
              Governança e auditoria do MVP Montador Conecta
            </p>
          </div>
        </div>
        <AdminDashboard />
      </div>
    );
  }

  // Montador Dashboard (Default view for now)
  const myServices = services?.filter(s => s.montadorId === profile.id) || [];
  const upcomingServices = myServices.filter(s => ['scheduled', 'in_progress'].includes(s.status || '')).slice(0, 3);
  
  const totalEarnings = myServices
    .filter(s => s.status === 'completed')
    .reduce((acc, curr) => acc + (curr.price || 0), 0);

  const completedServices = myServices.filter(s => s.status === 'completed').length;
  const totalServices = myServices.length;
  const completionRate = totalServices > 0 ? Math.round((completedServices / totalServices) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900">
            Olá, {profile?.fullName || user?.firstName}
          </h1>
          <p className="text-slate-500 mt-1">
            Aqui está o resumo das suas atividades hoje.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-md bg-gradient-to-br from-blue-600 to-indigo-700 text-white overflow-hidden relative">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-medium bg-white/10 px-2 py-1 rounded text-blue-100">Este Mês</span>
            </div>
            <p className="text-blue-100 text-sm font-medium">Ganhos Totais</p>
            <h3 className="text-3xl font-bold mt-1">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalEarnings / 100)}
            </h3>
          </CardContent>
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
        </Card>

        <Card className="border-slate-100 shadow-md hover:shadow-lg transition-shadow">
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

        <Card className="border-slate-100 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-50 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-slate-500 text-sm font-medium">Taxa de Conclusão</p>
            <h3 className="text-3xl font-bold text-slate-900 mt-1">{completionRate}%</h3>
          </CardContent>
        </Card>
      </div>

      {/* Recent/Upcoming Services */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">
            Próximos Serviços
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
                Você não tem serviços agendados para os próximos dias.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
