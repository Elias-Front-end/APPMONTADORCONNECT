import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useProfile, useUpdateProfile, useCreateProfile } from "@/hooks/use-profiles";
import { insertProfileSchema } from "@shared/schema";
import { LayoutShell } from "@/components/layout-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

// Schema for the form - extends the insert schema to make role required if creating
const formSchema = insertProfileSchema.pick({
  fullName: true,
  phone: true,
  cpf: true,
  bio: true,
  role: true,
  region: true,
  experienceYears: true,
}).extend({
  role: z.enum(["montador", "partner"]),
  experienceYears: z.coerce.number().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function Profile() {
  const { user } = useAuth();
  const { data: profile, isLoading: isLoadingProfile } = useProfile();
  const createMutation = useCreateProfile();
  const updateMutation = useUpdateProfile();
  const { toast } = useToast();

  const isEditing = !!profile;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      cpf: "",
      bio: "",
      role: "montador",
      region: "",
      experienceYears: 0,
    },
  });

  // Pre-fill form when profile data loads
  useEffect(() => {
    if (profile) {
      form.reset({
        fullName: profile.fullName || "",
        phone: profile.phone || "",
        cpf: profile.cpf || "",
        bio: profile.bio || "",
        role: profile.role as "montador" | "partner",
        region: profile.region || "",
        experienceYears: profile.experienceYears || 0,
      });
    } else if (user) {
      // Default full name from auth
      form.setValue("fullName", `${user.firstName || ''} ${user.lastName || ''}`.trim());
    }
  }, [profile, user, form]);

  const onSubmit = async (data: FormValues) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync(data);
        toast({ title: "Perfil atualizado!", description: "Suas informações foram salvas com sucesso." });
      } else {
        await createMutation.mutateAsync({
          ...data,
          id: user!.id,
          avatarUrl: user?.profileImageUrl,
        });
        toast({ title: "Perfil criado!", description: "Bem-vindo ao Montador Conecta!" });
        // Force reload or redirect might be needed here depending on app flow
        window.location.href = "/";
      }
    } catch (error: any) {
      toast({ 
        title: "Erro ao salvar", 
        description: error.message || "Tente novamente mais tarde.", 
        variant: "destructive" 
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (isLoadingProfile) {
    return (
      <LayoutShell>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </LayoutShell>
    );
  }

  return (
    <LayoutShell>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">
          {isEditing ? "Editar Perfil" : "Criar seu Perfil"}
        </h1>
        <p className="text-slate-500 mb-8">
          {isEditing 
            ? "Mantenha suas informações atualizadas para receber mais serviços."
            : "Complete seu cadastro para começar a usar a plataforma."}
        </p>

        <Card>
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
            <CardDescription>
              Esses dados serão visíveis para {form.watch("role") === "montador" ? "lojistas parceiros" : "montadores"}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Eu sou um(a)</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          disabled={isEditing} // Cannot change role after creation for simplicity
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione seu perfil" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="montador">Montador Profissional</SelectItem>
                            <SelectItem value="partner">Lojista / Parceiro</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Completo</FormLabel>
                        <FormControl>
                          <Input placeholder="Seu nome" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>WhatsApp / Telefone</FormLabel>
                        <FormControl>
                          <Input placeholder="(00) 00000-0000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cpf"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CPF</FormLabel>
                        <FormControl>
                          <Input placeholder="000.000.000-00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="region"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Região de Atuação (Cidade/Bairro)</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: São Paulo - Zona Sul" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch("role") === "montador" && (
                    <FormField
                      control={form.control}
                      name="experienceYears"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Anos de Experiência</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sobre mim</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder={
                            form.watch("role") === "montador" 
                              ? "Conte sobre sua experiência, ferramentas que possui..."
                              : "Conte sobre sua loja e o que busca nos parceiros..."
                          }
                          className="resize-none h-32"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Uma breve descrição ajuda a gerar confiança.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end pt-4">
                  <Button type="submit" size="lg" disabled={isPending} className="bg-blue-600 hover:bg-blue-700">
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEditing ? "Salvar Alterações" : "Criar Perfil"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </LayoutShell>
  );
}
