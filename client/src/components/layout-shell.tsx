import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profiles";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  UserCircle, 
  LogOut, 
  Menu,
  Building2,
  ArrowLeft,
  Home
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface LayoutShellProps {
  children: React.ReactNode;
}

export function LayoutShell({ children }: LayoutShellProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { data: profile } = useProfile();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navigation = [
    { name: "Início", href: "/", icon: Home },
    { name: "Ordens de Serviço", href: "/services", icon: Briefcase },
    { name: "Parceiros", href: "/partnerships", icon: Users },
    { name: "Meu Perfil", href: "/profile", icon: UserCircle },
  ];

  if (profile?.role === "partner") {
    // Insert before profile
    navigation.splice(3, 0, { name: "Minha Empresa", href: "/company", icon: Building2 });
  }

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // Fallback if no history
      const [, setLocation] = useLocation();
      setLocation("/");
    }
  };

  const showBackButton = location !== "/";

  const NavContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-white">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-900/20">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-display font-bold tracking-tight">
            Montador<span className="text-blue-400">Conecta</span>
          </span>
        </div>
      </div>

      <div className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer group",
                  isActive 
                    ? "bg-blue-600 text-white shadow-md shadow-blue-900/20 font-medium" 
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
                onClick={() => setIsMobileOpen(false)}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-400 group-hover:text-white")} />
                {item.name}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-4 py-3 mb-2">
          <Avatar className="w-10 h-10 border-2 border-white/10">
            <AvatarImage src={user?.profileImageUrl || undefined} />
            <AvatarFallback>{user?.firstName?.[0]}{user?.lastName?.[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {profile?.fullName || user?.firstName}
            </p>
            <p className="text-xs text-slate-400 truncate capitalize">
              {profile?.role || "Usuário"}
            </p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          className="w-full justify-start text-slate-400 hover:text-red-400 hover:bg-red-500/10"
          onClick={() => logoutMutation.mutate()}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Sair
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-16 lg:pb-0">
      {/* Desktop Sidebar - Only visible on large screens */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <NavContent />
      </aside>

      {/* Mobile Top Header - Only visible on small screens */}
      <header className="lg:hidden sticky top-0 z-40 flex items-center gap-x-4 border-b bg-white px-4 py-3 shadow-sm">
        {showBackButton ? (
          <Button variant="ghost" size="icon" onClick={handleBack} className="-ml-2">
            <ArrowLeft className="h-5 w-5 text-slate-700" />
          </Button>
        ) : (
          <div className="w-9" />
        )}
        
        <div className="flex-1 text-center">
          <span className="font-display font-bold text-slate-900">
            Montador<span className="text-blue-600">Conecta</span>
          </span>
        </div>

        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="-mr-2">
              <Menu className="h-6 w-6 text-slate-700" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="p-0 w-72 bg-slate-900">
            <NavContent />
          </SheetContent>
        </Sheet>
      </header>

      {/* Main Content */}
      <main className="lg:pl-72 min-h-screen">
        {/* Desktop Back Button Area */}
        <div className="hidden lg:flex items-center px-8 py-4">
            {showBackButton && (
                <Button variant="ghost" onClick={handleBack} className="gap-2 pl-0 hover:bg-transparent hover:text-blue-600">
                    <ArrowLeft className="h-4 w-4" />
                    Voltar
                </Button>
            )}
        </div>

        <div className="px-4 py-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center z-50 h-16 pb-[env(safe-area-inset-bottom)] box-content shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <div className="flex flex-col items-center justify-center w-full h-full py-1 px-2 cursor-pointer">
                <div className={cn(
                    "p-1.5 rounded-full transition-colors mb-0.5",
                    isActive ? "bg-blue-100 text-blue-600" : "text-slate-500"
                )}>
                    <item.icon className="w-5 h-5" />
                </div>
                <span className={cn(
                    "text-[10px] font-medium leading-none", 
                    isActive ? "text-blue-600" : "text-slate-500"
                )}>
                    {item.name.split(' ')[0]} {/* Shorten name for mobile */}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

