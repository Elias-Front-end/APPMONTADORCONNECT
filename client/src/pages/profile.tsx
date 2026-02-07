import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useProfile, useUpdateProfile, useCreateProfile } from "@/hooks/use-profiles";
import { useCompany, useUpdateCompany, useCreateCompany } from "@/hooks/use-companies";
import { insertProfileSchema, insertCompanySchema, industryTypeEnum, companySizeEnum } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Store, User } from "lucide-react";
import { isValidCPF, isValidCNPJ } from "@shared/validation";

// --- Schemas ---

const montadorFormSchema = insertProfileSchema.pick({
  fullName: true,
  phone: true,
  cpf: true,
  bio: true,
  role: true,
  region: true,
  experienceYears: true,
}).extend({
  role: z.enum(["montador"]),
  fullName: z.string().min(3, "Nome completo é obrigatório"),
  cpf: z.string().refine(isValidCPF, "CPF inválido"),
  experienceYears: z.coerce.number().min(0).optional(),
});

const companyFormSchema = insertCompanySchema.omit({ ownerId: true }).extend({
  tradingName: z.string().min(2, "Nome fantasia obrigatório"),
  corporateName: z.string().min(2, "Razão social obrigatória"),
  cnpj: z.string().refine(isValidCNPJ, "CNPJ inválido"),
  phone: z.string().min(10, "Telefone inválido"),
  emailContact: z.string().email("Email inválido"),
  addressFull: z.string().min(5, "Endereço obrigatório"),
  city: z.string().min(2, "Cidade obrigatória"),
  state: z.string().min(2, "Estado obrigatório"),
  // Company form also updates basic profile info (responsavel)
  responsavel: z.string().min(3, "Nome do responsável é obrigatório"),
});


export default function Profile() {
  const { user } = useAuth();
  const { data: profile, isLoading: isLoadingProfile } = useProfile();

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const isMontador = profile?.role === 'montador';
  // If no profile, we assume creation. Since we implemented role selection in Auth, user should have a role in profile (even if empty) or we default to montador?
  // Actually, useProfile returns null if 404.
  // In our new flow, profile is created empty on register.
  // So profile should exist. If it doesn't, something is wrong or it's a very old user.
  // We'll default to Montador form if no profile or role is montador.
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">
          {profile ? "Editar Perfil" : "Criar Perfil"}
        </h1>
        <p className="text-slate-500">
          {profile 
            ? "Mantenha suas informações atualizadas."
            : "Complete seu cadastro para começar."}
        </p>
      </div>

      {(!profile || isMontador) ? (
        <MontadorProfileForm profile={profile} user={user} />
      ) : (
        <CompanyProfileForm profile={profile} />
      )}
    </div>
  );
}

function MontadorProfileForm({ profile, user }: { profile: any, user: any }) {
  const updateMutation = useUpdateProfile();
  const createMutation = useCreateProfile();
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(montadorFormSchema),
    defaultValues: {
      fullName: profile?.fullName || user?.firstName || "",
      phone: profile?.phone || "",
      cpf: profile?.cpf || "",
      bio: profile?.bio || "",
      role: "montador" as const,
      region: profile?.region || "",
      experienceYears: profile?.experienceYears || 0,
    },
  });

  async function onSubmit(data: any) {
    try {
      if (profile) {
        await updateMutation.mutateAsync(data);
        toast({ title: "Perfil atualizado!", description: "Dados salvos com sucesso." });
      } else {
        await createMutation.mutateAsync({ ...data, avatarUrl: user?.profileImageUrl });
        toast({ title: "Perfil criado!", description: "Bem-vindo!" });
        window.location.reload();
      }
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
             <User className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <CardTitle>Dados do Montador</CardTitle>
            <CardDescription>Informações visíveis para contratantes.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
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
                    <FormControl><Input {...field} placeholder="000.000.000-00" /></FormControl>
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
                    <FormControl><Input {...field} placeholder="(00) 00000-0000" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Região de Atuação</FormLabel>
                    <FormControl><Input {...field} placeholder="Cidade - Estado" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="experienceYears"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Anos de Experiência</FormLabel>
                  <FormControl><Input type="number" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sobre mim</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Conte sobre sua experiência..." className="min-h-[100px]" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={updateMutation.isPending || createMutation.isPending}>
                {(updateMutation.isPending || createMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Alterações
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function CompanyProfileForm({ profile }: { profile: any }) {
  const { data: company, isLoading: isLoadingCompany } = useCompany(profile?.companyId);
  const updateCompanyMutation = useUpdateCompany();
  const createCompanyMutation = useCreateCompany(); // In case company doesn't exist yet but profile does
  const updateProfileMutation = useUpdateProfile();
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      tradingName: "",
      corporateName: "",
      cnpj: "",
      phone: "",
      emailContact: "",
      addressFull: "",
      city: "",
      state: "",
      industryType: "lojista" as const,
      companySize: "pequena" as const,
      responsavel: profile?.fullName || "", // Responsavel comes from profile.fullName
    },
  });

  // Load company data when available
  useEffect(() => {
    if (company) {
      form.reset({
        tradingName: company.tradingName,
        corporateName: company.corporateName || "",
        cnpj: company.cnpj || "",
        phone: company.phone || "",
        emailContact: company.emailContact || "",
        addressFull: company.addressFull || "",
        city: company.city || "",
        state: company.state || "",
        industryType: company.industryType || "lojista",
        companySize: company.companySize || "pequena",
        responsavel: profile?.fullName || "",
      });
    } else if (profile) {
        form.setValue("responsavel", profile.fullName || "");
    }
  }, [company, profile, form]);

  async function onSubmit(data: any) {
    try {
      // 1. Update Profile (Responsavel name matches profile full name)
      if (data.responsavel !== profile.fullName) {
        await updateProfileMutation.mutateAsync({ fullName: data.responsavel });
      }

      // 2. Update or Create Company
      if (company) {
        await updateCompanyMutation.mutateAsync({ id: company.id, ...data });
        toast({ title: "Empresa atualizada!", description: "Dados corporativos salvos." });
      } else {
        // Fallback: This user has a profile but no company linked yet (weird state, but possible)
        const newCompany = await createCompanyMutation.mutateAsync(data);
        // Link to profile
        await updateProfileMutation.mutateAsync({ companyId: newCompany.id });
        toast({ title: "Empresa cadastrada!", description: "Dados corporativos salvos." });
      }
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    }
  }

  if (isLoadingCompany && profile?.companyId) {
    return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" /></div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
             <Store className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <CardTitle>Dados da Empresa</CardTitle>
            <CardDescription>Informações do seu negócio.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
         <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            <div className="space-y-4">
                <h3 className="font-medium text-sm text-slate-500 uppercase tracking-wider">Identificação</h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="tradingName"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nome Fantasia</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="corporateName"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Razão Social</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
                 <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="cnpj"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>CNPJ</FormLabel>
                            <FormControl><Input {...field} placeholder="00.000.000/0000-00" /></FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                      <FormField
                        control={form.control}
                        name="industryType"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Ramo de Atuação</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {industryTypeEnum.enumValues.map((type) => (
                                <SelectItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</SelectItem>
                                ))}
                            </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="font-medium text-sm text-slate-500 uppercase tracking-wider">Contato e Endereço</h3>
                 <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="emailContact"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email Comercial</FormLabel>
                            <FormControl><Input {...field} type="email" /></FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Telefone / WhatsApp</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
                <FormField
                    control={form.control}
                    name="addressFull"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Endereço Completo</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Cidade</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Estado</FormLabel>
                            <FormControl><Input {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
            </div>

             <div className="space-y-4">
                <h3 className="font-medium text-sm text-slate-500 uppercase tracking-wider">Responsável</h3>
                <FormField
                    control={form.control}
                    name="responsavel"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Nome do Responsável</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormDescription>Este nome será usado para comunicação direta.</FormDescription>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" size="lg" disabled={updateCompanyMutation.isPending || updateProfileMutation.isPending}>
                {(updateCompanyMutation.isPending || updateProfileMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Dados da Empresa
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
