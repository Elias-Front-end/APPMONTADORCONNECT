import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowRight, Star, Users, ShieldCheck, Briefcase } from "lucide-react";

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
              <a href="#features" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Como funciona</a>
              <a href="#benefits" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Vantagens</a>
              <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Para Lojistas</a>
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
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-2 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50">
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
              {/* Abstract decorative elements */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-100 rounded-full blur-3xl opacity-50 animate-pulse" />
              
              {/* Feature Cards Floating */}
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

              {/* Main Illustration placeholder - in production would be a nice 3D render or photo */}
              <div className="absolute inset-0 z-10 flex items-center justify-center">
                 {/* Manually placed unDraw-style SVG or Image */}
                 <img 
                   src="https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?q=80&w=1000&auto=format&fit=crop" 
                   alt="Montador trabalhando"
                   className="rounded-3xl shadow-2xl border-4 border-white object-cover w-[400px] h-[500px] rotate-1 hover:rotate-0 transition-all duration-700"
                 />
                 {/* Comment for image: Professional furniture assembler working */}
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
