import { useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, User as UserIcon, Building2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Schema for login/register
const authSchema = z.object({
  username: z.string().min(3, "Usuário deve ter pelo menos 3 caracteres"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  role: z.enum(["montador", "marcenaria", "lojista"]).optional(), // "marcenaria" or "lojista" maps to "empresa" logic or specific roles
});

type AuthFormValues = z.infer<typeof authSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();

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
      role: "montador",
    },
  });

  const onSubmit = (data: AuthFormValues, isLogin: boolean) => {
    if (isLogin) {
      loginMutation.mutate(data);
    } else {
      registerMutation.mutate(data);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left: Form */}
      <div className="flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-display font-bold text-slate-900">
              Montador<span className="text-blue-600">Conecta</span>
            </span>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Cadastro</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Card className="border-0 shadow-none">
                <CardHeader className="px-0 pt-0">
                  <CardTitle>Bem-vindo de volta</CardTitle>
                  <CardDescription>
                    Entre com suas credenciais para acessar sua conta.
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                  <form onSubmit={form.handleSubmit((data) => onSubmit(data, true))} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Usuário</Label>
                      <Input
                        id="username"
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
                        {...form.register("password")}
                      />
                      {form.formState.errors.password && (
                        <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
                      )}
                    </div>
                    <Button 
                        type="submit" 
                        className="w-full bg-blue-600 hover:bg-blue-700" 
                        disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "Entrando..." : "Entrar"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card className="border-0 shadow-none">
                <CardHeader className="px-0 pt-0">
                  <CardTitle>Crie sua conta</CardTitle>
                  <CardDescription>
                    Comece a usar o MontadorConecta hoje mesmo.
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                  <form onSubmit={form.handleSubmit((data) => onSubmit(data, false))} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reg-username">Usuário</Label>
                      <Input
                        id="reg-username"
                        {...form.register("username")}
                      />
                      {form.formState.errors.username && (
                        <p className="text-sm text-red-500">{form.formState.errors.username.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-password">Senha</Label>
                      <Input
                        id="reg-password"
                        type="password"
                        {...form.register("password")}
                      />
                      {form.formState.errors.password && (
                        <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
                      )}
                    </div>

                    <div className="space-y-4 pt-4 border-t">
                      <Label className="text-base font-medium">Eu quero me cadastrar como:</Label>
                      <RadioGroup 
                        defaultValue="montador" 
                        onValueChange={(val) => form.setValue("role", val as any)}
                        className="grid grid-cols-2 gap-4"
                      >
                        <div>
                          <RadioGroupItem value="montador" id="role-montador" className="peer sr-only" />
                          <Label
                            htmlFor="role-montador"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                          >
                            <UserIcon className="mb-2 h-6 w-6" />
                            Montador
                          </Label>
                        </div>
                        <div>
                          <RadioGroupItem value="marcenaria" id="role-marcenaria" className="peer sr-only" />
                          <Label
                            htmlFor="role-marcenaria"
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                          >
                            <Building2 className="mb-2 h-6 w-6" />
                            Empresa
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <Button 
                        type="submit" 
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? "Criando conta..." : "Criar Conta"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
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
        </div>
      </div>
    </div>
  );
}
