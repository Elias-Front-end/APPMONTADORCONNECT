import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Briefcase, UserPlus, LogIn, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Schema for login/register
const authSchema = z.object({
  username: z.string().min(3, "Usuário deve ter pelo menos 3 caracteres"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

type AuthFormValues = z.infer<typeof authSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<"selection" | "login" | "register">("selection");

  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Reset form when switching modes
  useEffect(() => {
    form.reset();
  }, [mode, form]);

  const onSubmit = (data: AuthFormValues) => {
    if (mode === "login") {
      loginMutation.mutate(data);
    } else if (mode === "register") {
      registerMutation.mutate(data);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left: Interactive Area */}
      <div className="flex items-center justify-center p-8 bg-white relative">
        <div className="w-full max-w-md space-y-8">
          <div className="flex items-center gap-2 mb-8 justify-center lg:justify-start">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-display font-bold text-slate-900">
              Montador<span className="text-blue-600">Conecta</span>
            </span>
          </div>

          <AnimatePresence mode="wait">
            {mode === "selection" && (
              <motion.div
                key="selection"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="text-center lg:text-left space-y-2">
                  <h1 className="text-3xl font-bold tracking-tight text-slate-900">Bem-vindo</h1>
                  <p className="text-slate-500">Escolha como deseja acessar a plataforma.</p>
                </div>

                <div className="grid gap-4">
                  <button
                    onClick={() => setMode("login")}
                    className="flex items-center p-6 text-left border-2 border-slate-100 rounded-xl hover:border-blue-600 hover:bg-blue-50/50 transition-all group"
                  >
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <LogIn className="w-6 h-6" />
                    </div>
                    <div className="ml-4">
                      <h3 className="font-semibold text-slate-900">Entrar na minha conta</h3>
                      <p className="text-sm text-slate-500">Já tenho cadastro e quero fazer login</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setMode("register")}
                    className="flex items-center p-6 text-left border-2 border-slate-100 rounded-xl hover:border-blue-600 hover:bg-blue-50/50 transition-all group"
                  >
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <UserPlus className="w-6 h-6" />
                    </div>
                    <div className="ml-4">
                      <h3 className="font-semibold text-slate-900">Criar nova conta</h3>
                      <p className="text-sm text-slate-500">Sou novo por aqui e quero me cadastrar</p>
                    </div>
                  </button>
                </div>
              </motion.div>
            )}

            {(mode === "login" || mode === "register") && (
              <motion.div
                key="form"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.3 }}
              >
                <Button 
                  variant="ghost" 
                  onClick={() => setMode("selection")}
                  className="mb-6 pl-0 hover:bg-transparent hover:text-blue-600 -ml-2"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar para opções
                </Button>

                <Card className="border-0 shadow-none">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-2xl">
                      {mode === "login" ? "Bem-vindo de volta" : "Crie sua conta"}
                    </CardTitle>
                    <CardDescription>
                      {mode === "login" 
                        ? "Entre com suas credenciais para acessar." 
                        : "Preencha os dados abaixo para começar."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-0">
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="username">Usuário</Label>
                        <Input
                          id="username"
                          placeholder="Seu nome de usuário"
                          {...form.register("username")}
                        />
                        {form.formState.errors.username && (
                          <p className="text-sm text-red-500">{form.formState.errors.username.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password">Senha</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Sua senha secreta"
                          {...form.register("password")}
                        />
                        {form.formState.errors.password && (
                          <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
                        )}
                      </div>
                      
                      <Button 
                          type="submit" 
                          className="w-full bg-blue-600 hover:bg-blue-700 h-11 text-base" 
                          disabled={loginMutation.isPending || registerMutation.isPending}
                      >
                        {mode === "login" 
                          ? (loginMutation.isPending ? "Entrando..." : "Entrar")
                          : (registerMutation.isPending ? "Criando conta..." : "Criar Conta")
                        }
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right: Hero (Hidden on mobile) */}
      <div className="hidden lg:flex flex-col justify-center p-12 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-900 opacity-50" />
        <div className="relative z-10 max-w-lg mx-auto text-center lg:text-left">
          <h2 className="text-4xl font-display font-bold mb-6">
            A plataforma completa para profissionais de montagem
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            Gerencie seus serviços, conecte-se com lojas e receba pagamentos de forma segura e simples.
          </p>
          
          {/* Visual decorative elements */}
          <div className="grid grid-cols-2 gap-4 mt-12 opacity-80">
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10">
              <div className="text-2xl font-bold mb-1">24h</div>
              <div className="text-sm text-blue-200">Suporte disponível</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/10">
              <div className="text-2xl font-bold mb-1">100%</div>
              <div className="text-sm text-blue-200">Seguro e confiável</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
