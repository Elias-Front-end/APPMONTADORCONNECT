import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Check, 
  ArrowRight, 
  Star, 
  Users, 
  Briefcase, 
  Calendar,
  TrendingUp,
  Shield,
  Zap,
  Award,
  Clock,
  MapPin
} from "lucide-react";

export default function Landing() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogin = () => {
    setLocation("/auth");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-display font-bold text-slate-900">
                Montador<span className="text-blue-600">Conecta</span>
              </span>
            </div>
            <div className="hidden md:flex gap-8">
              <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Como funciona</a>
              <a href="#qualification" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Qualificação</a>
              <a href="#benefits" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Vantagens</a>
            </div>
            <Button onClick={handleLogin} className="rounded-full px-6 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20">
              Entrar
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-blue-700 bg-blue-50 border-blue-100 rounded-full">
                <Star className="w-3 h-3 mr-1 fill-blue-700" /> A plataforma #1 para montadores
              </Badge>
              <h1 className="text-5xl lg:text-7xl font-display font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6">
                Mais serviços, <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  menos complicação.
                </span>
              </h1>
              <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Conectamos montadores profissionais às melhores lojas de móveis e clientes da região. Gerencie sua agenda, receba pagamentos e cresça seu negócio.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button size="lg" onClick={handleLogin} className="h-14 px-8 text-lg rounded-full bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-600/25 transition-all hover:scale-105">
                  Começar Agora
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button size="lg" variant="outline" onClick={handleLogin} className="h-14 px-8 text-lg rounded-full border-2 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50">
                  Sou Lojista
                </Button>
              </div>
              
              <div className="mt-12 flex items-center justify-center lg:justify-start gap-8 text-slate-500 text-sm font-medium">
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  Sem mensalidade
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  Pagamento garantido
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-500" />
                  Suporte 24h
                </div>
              </div>
            </div>

            <div className="relative lg:h-[600px] w-full hidden lg:block">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-100 rounded-full blur-3xl opacity-50 animate-pulse" />
              
              <div className="absolute top-10 right-10 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 w-64 rotate-3 hover:rotate-0 transition-transform duration-500 cursor-default z-20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <DollarSignIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Pagamento Recebido</p>
                    <p className="font-bold text-slate-900">R$ 450,00</p>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 w-full rounded-full" />
                </div>
              </div>

              <div className="absolute bottom-20 left-10 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 w-72 -rotate-2 hover:rotate-0 transition-transform duration-500 cursor-default z-30">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0">
                    <CalendarIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Nova Instalação</p>
                    <p className="text-xs text-slate-500">Amanhã, 09:00 • Centro</p>
                  </div>
                </div>
                <Button size="sm" className="w-full mt-3 bg-slate-900 text-white hover:bg-slate-800">Aceitar Serviço</Button>
              </div>

              <div className="absolute inset-0 z-10 flex items-center justify-center">
                 <img 
                   src="https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?q=80&w=1000&auto=format&fit=crop" 
                   alt="Montador trabalhando"
                   className="rounded-3xl shadow-2xl border-4 border-white object-cover w-[400px] h-[500px] rotate-1 hover:rotate-0 transition-all duration-700"
                 />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-slate-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-white">
            <div className="p-6">
              <div className="text-4xl font-display font-bold text-blue-400 mb-2">+5.000</div>
              <p className="text-slate-400">Montadores ativos</p>
            </div>
            <div className="p-6 border-y md:border-y-0 md:border-x border-slate-800">
              <div className="text-4xl font-display font-bold text-blue-400 mb-2">R$ 2M+</div>
              <p className="text-slate-400">Repassados em serviços</p>
            </div>
            <div className="p-6">
              <div className="text-4xl font-display font-bold text-blue-400 mb-2">98%</div>
              <p className="text-slate-400">Clientes satisfeitos</p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-blue-700 bg-blue-50 border-blue-100 rounded-full">
              Como Funciona
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-display font-bold text-slate-900 mb-4">
              Simples para todos
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Seja você montador ou empresa, nossa plataforma foi feita para facilitar sua vida
            </p>
          </div>

          <Tabs defaultValue="montador" className="max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 mb-12">
              <TabsTrigger value="montador" className="text-lg py-3">
                <Users className="w-5 h-5 mr-2" />
                Sou Montador
              </TabsTrigger>
              <TabsTrigger value="empresa" className="text-lg py-3">
                <Briefcase className="w-5 h-5 mr-2" />
                Sou Empresa
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="montador" className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <StepCard 
                  number="1"
                  title="Cadastre-se gratuitamente"
                  description="Crie sua conta em menos de 2 minutos. Sem taxas de adesão."
                  icon={<Users className="w-6 h-6" />}
                />
                <StepCard 
                  number="2"
                  title="Complete seu perfil"
                  description="Adicione sua experiência, região de atuação e qualificações."
                  icon={<Award className="w-6 h-6" />}
                />
                <StepCard 
                  number="3"
                  title="Aceite serviços"
                  description="Veja serviços disponíveis e aceite os que se encaixam na sua agenda."
                  icon={<Calendar className="w-6 h-6" />}
                />
                <StepCard 
                  number="4"
                  title="Realize e receba"
                  description="Execute o serviço e receba o pagamento direto na plataforma."
                  icon={<TrendingUp className="w-6 h-6" />}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="empresa" className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <StepCard 
                  number="1"
                  title="Crie sua conta"
                  description="Cadastre sua empresa e comece a publicar serviços."
                  icon={<Briefcase className="w-6 h-6" />}
                />
                <StepCard 
                  number="2"
                  title="Publique serviços"
                  description="Use o calendário para agendar e definir a qualificação necessária."
                  icon={<Calendar className="w-6 h-6" />}
                />
                <StepCard 
                  number="3"
                  title="Escolha montadores"
                  description="Filtre por qualificação e escolha os melhores profissionais."
                  icon={<Shield className="w-6 h-6" />}
                />
                <StepCard 
                  number="4"
                  title="Acompanhe tudo"
                  description="Gerencie serviços, avalie montadores e construa parcerias."
                  icon={<Star className="w-6 h-6" />}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Qualification System Section */}
      <section id="qualification" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-purple-700 bg-purple-50 border-purple-100 rounded-full">
              Sistema de Qualificação
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-display font-bold text-slate-900 mb-4">
              Evolua sua carreira
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Quanto mais você trabalha, mais oportunidades aparecem
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <QualificationCard 
              level="Iniciante"
              color="slate"
              requirements="Cadastro aprovado"
              services="Serviços simples"
              icon={<Users className="w-8 h-8" />}
            />
            <QualificationCard 
              level="Intermediário"
              color="blue"
              requirements="10+ serviços, nota ≥ 4.0"
              services="Serviços médios"
              icon={<Zap className="w-8 h-8" />}
            />
            <QualificationCard 
              level="Avançado"
              color="purple"
              requirements="50+ serviços, nota ≥ 4.5"
              services="Serviços complexos"
              icon={<Award className="w-8 h-8" />}
            />
            <QualificationCard 
              level="Especialista"
              color="amber"
              requirements="100+ serviços, nota ≥ 4.8"
              services="Projetos premium"
              icon={<Star className="w-8 h-8" />}
            />
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Montadores iniciantes têm oportunidade!</h3>
                <p className="text-slate-600">
                  Se você está começando, pode visualizar e aceitar <strong>todos os serviços</strong> para ganhar experiência. 
                  Após o primeiro serviço, você passa a seguir as regras de qualificação.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Calendar Feature Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-blue-700 bg-blue-50 border-blue-100 rounded-full">
                Calendário Integrado
              </Badge>
              <h2 className="text-4xl lg:text-5xl font-display font-bold text-slate-900 mb-6">
                Sua agenda sempre organizada
              </h2>
              <p className="text-xl text-slate-600 mb-8">
                Gerencie todos os seus compromissos em um só lugar. Nunca mais perca um serviço.
              </p>
              
              <div className="space-y-4">
                <FeatureItem 
                  icon={<Calendar className="w-5 h-5" />}
                  title="Visualização mensal"
                  description="Veja todos os serviços do mês de forma clara"
                />
                <FeatureItem 
                  icon={<Clock className="w-5 h-5" />}
                  title="Sincronização automática"
                  description="Aceite um serviço e ele aparece automaticamente no calendário"
                />
                <FeatureItem 
                  icon={<MapPin className="w-5 h-5" />}
                  title="Localização integrada"
                  description="Veja onde cada serviço será realizado"
                />
                <FeatureItem 
                  icon={<Zap className="w-5 h-5" />}
                  title="Notificações em tempo real"
                  description="Receba alertas de novos serviços e lembretes"
                />
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-900">Fevereiro 2026</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">←</Button>
                    <Button variant="outline" size="sm">→</Button>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-2 text-center text-sm">
                  {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                    <div key={day} className="font-medium text-slate-500 py-2">{day}</div>
                  ))}
                  {Array.from({ length: 35 }, (_, i) => {
                    const day = i - 5;
                    const hasService = [3, 7, 12, 18, 25].includes(day);
                    return (
                      <div 
                        key={i} 
                        className={`
                          aspect-square flex items-center justify-center rounded-lg
                          ${day < 1 || day > 28 ? 'text-slate-300' : 'text-slate-900'}
                          ${hasService ? 'bg-blue-600 text-white font-bold' : 'hover:bg-slate-50'}
                          ${day === 7 ? 'ring-2 ring-blue-600 ring-offset-2' : ''}
                        `}
                      >
                        {day > 0 && day <= 28 ? day : ''}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Montagem de Guarda-roupa</p>
                      <p className="text-sm text-slate-600">Hoje, 14:00 • Zona Sul</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-green-700 bg-green-50 border-green-100 rounded-full">
              Vantagens
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-display font-bold text-slate-900 mb-4">
              Por que escolher o Montador Conecta?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <BenefitCard 
              icon={<Shield className="w-8 h-8" />}
              title="Pagamento Garantido"
              description="Todas as transações são protegidas. Você só recebe serviços de empresas verificadas."
            />
            <BenefitCard 
              icon={<Zap className="w-8 h-8" />}
              title="Sem Mensalidade"
              description="Comissão apenas sobre serviços realizados. Sem taxas escondidas ou mensalidades."
            />
            <BenefitCard 
              icon={<TrendingUp className="w-8 h-8" />}
              title="Crescimento Profissional"
              description="Sistema de qualificação que reconhece seu trabalho e abre novas oportunidades."
            />
            <BenefitCard 
              icon={<Calendar className="w-8 h-8" />}
              title="Agenda Organizada"
              description="Calendário integrado para gerenciar todos os seus compromissos em um só lugar."
            />
            <BenefitCard 
              icon={<Users className="w-8 h-8" />}
              title="Rede de Parceiros"
              description="Construa relacionamentos duradouros com empresas e montadores de confiança."
            />
            <BenefitCard 
              icon={<Star className="w-8 h-8" />}
              title="Suporte Dedicado"
              description="Equipe pronta para ajudar você a crescer e resolver qualquer problema."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-display font-bold text-white mb-6">
            Pronto para começar?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Junte-se a milhares de profissionais que já estão crescendo com a gente
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={handleLogin} className="h-14 px-8 text-lg rounded-full bg-white text-blue-600 hover:bg-slate-50 shadow-xl">
              Criar Conta Grátis
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={handleLogin} className="h-14 px-8 text-lg rounded-full border-2 border-white text-white hover:bg-white/10">
              Saber Mais
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-display font-bold">
                  Montador<span className="text-blue-400">Conecta</span>
                </span>
              </div>
              <p className="text-slate-400 text-sm">
                Conectando profissionais e empresas para um futuro melhor.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Plataforma</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#how-it-works" className="hover:text-white transition-colors">Como funciona</a></li>
                <li><a href="#qualification" className="hover:text-white transition-colors">Qualificação</a></li>
                <li><a href="#benefits" className="hover:text-white transition-colors">Vantagens</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Suporte</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacidade</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400 text-sm">
            © 2026 Montador Conecta. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}

// Helper Components
function StepCard({ number, title, description, icon }: { number: string; title: string; description: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xl shrink-0">
          {number}
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
          <p className="text-slate-600">{description}</p>
        </div>
      </div>
    </div>
  );
}

function QualificationCard({ level, color, requirements, services, icon }: { level: string; color: string; requirements: string; services: string; icon: React.ReactNode }) {
  const colors = {
    slate: 'from-slate-500 to-slate-600',
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    amber: 'from-amber-500 to-amber-600',
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-xl transition-all">
      <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${colors[color as keyof typeof colors]} text-white flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{level}</h3>
      <p className="text-sm text-slate-600 mb-3">{requirements}</p>
      <div className="pt-3 border-t border-slate-100">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Acesso a</p>
        <p className="text-sm font-medium text-slate-900">{services}</p>
      </div>
    </div>
  );
}

function FeatureItem({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-slate-900 mb-1">{title}</h4>
        <p className="text-slate-600">{description}</p>
      </div>
    </div>
  );
}

function BenefitCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-slate-50 rounded-2xl p-8 hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-slate-200">
      <div className="w-16 h-16 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600">{description}</p>
    </div>
  );
}

function DollarSignIcon({ className }: { className?: string }) {
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
      <line x1="12" x2="12" y1="1" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
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
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}
