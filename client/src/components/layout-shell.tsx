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
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutShellProps {
  children: React.ReactNode;
}

export function LayoutShell({ children }: LayoutShellProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { data: profile } = useProfile();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Ordens de Serviço", href: "/services", icon: Briefcase },
    { name: "Parceiros", href: "/partnerships", icon: Users },
    { name: "Meu Perfil", href: "/profile", icon: UserCircle },
  ];

  if (profile?.role === "partner") {
    navigation.push({ name: "Minha Empresa", href: "/company", icon: Building2 });
  }

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
            <AvatarImage src={user?.profileImageUrl} />
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
          onClick={() => logout()}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Sair
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <NavContent />
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-40 flex items-center gap-x-4 border-b bg-white px-4 py-4 shadow-sm sm:gap-x-6 sm:px-6">
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="-m-2.5 p-2.5 text-slate-700">
              <span className="sr-only">Open sidebar</span>
              <Menu className="h-6 w-6" aria-hidden="true" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72 border-r-0 bg-slate-900">
            <NavContent />
          </SheetContent>
        </Sheet>
        <div className="flex-1 text-sm font-semibold leading-6 text-slate-900">
          Montador Conecta
        </div>
      </div>

      {/* Main Content */}
      <main className="lg:pl-72 min-h-screen">
        <div className="px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
