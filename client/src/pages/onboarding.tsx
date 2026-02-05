import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Building2, Wrench, CheckCircle2 } from "lucide-react";
import { insertProfileSchema, insertCompanySchema, industryTypeEnum, companySizeEnum } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { api } from "@shared/routes";

export default function OnboardingPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<"role" | "details">("role");
  const [role, setRole] = useState<"montador" | "empresa" | null>(null);

  const profileMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(api.profiles.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profiles/me"] });
      if (role === "montador") {
        toast({ title: "Perfil criado!", description: "Bem-vindo ao MontadorConecta." });
        setLocation("/");
      }
    },
  });

  const companyMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(api.companies.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] });
      queryClient.invalidateQueries({ queryKey: ["/api/profiles/me"] });
      toast({ title: "Empresa cadastrada!", description: "Seu perfil corporativo foi criado." });
      setLocation("/");
    },
  });

  const handleRoleSelect = (selected: "montador" | "empresa") => {
    setRole(selected);
    setStep("details");
  };

  if (step === "role") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full grid md:grid-cols-2 gap-6">
          <Card 
            className="cursor-pointer hover:border-blue-500 transition-all hover:shadow-lg"
            onClick={() => handleRoleSelect("montador")}
          >
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Wrench className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle>Sou Montador</CardTitle>
              <CardDescription>
                Quero encontrar serviços, gerenciar minha agenda e receber pagamentos.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card 
            className="cursor-pointer hover:border-blue-500 transition-all hover:shadow-lg"
            onClick={() => handleRoleSelect("empresa")}
          >
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle>Sou Empresa</CardTitle>
              <CardDescription>
                Sou lojista ou marcenaria e preciso contratar montadores qualificados.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-10">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <CardTitle>
            {role === "montador" ? "Complete seu Perfil de Montador" : "Cadastro da Empresa"}
          </CardTitle>
          <CardDescription>
            Preencha os dados abaixo para começar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {role === "montador" ? (
            <MontadorForm onSubmit={(data) => profileMutation.mutate(data)} isPending={profileMutation.isPending} />
          ) : (
            <CompanyForm 
              onSubmit={async (data) => {
                // First create profile, then company
                try {
                  await profileMutation.mutateAsync({ 
                    fullName: data.responsavel, // Use responsavel name for profile
                    role: "lojista" // or marcenaria based on selection
                  });
                  await companyMutation.mutateAsync(data);
                } catch (e) {
                  // handled by mutation
                }
              }} 
              isPending={companyMutation.isPending || profileMutation.isPending} 
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MontadorForm({ onSubmit, isPending }: { onSubmit: (data: any) => void, isPending: boolean }) {
  const form = useForm({
    resolver: zodResolver(insertProfileSchema),
    defaultValues: {
      role: "montador",
      fullName: "",
      phone: "",
      cpf: "",
      bio: "",
      region: "",
      experienceYears: 0,
    }
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="fullName">Nome Completo</Label>
          <Input id="fullName" {...form.register("fullName")} />
          {form.formState.errors.fullName && <p className="text-sm text-red-500">{form.formState.errors.fullName.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="cpf">CPF</Label>
          <Input id="cpf" {...form.register("cpf")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Telefone / WhatsApp</Label>
          <Input id="phone" {...form.register("phone")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="region">Região de Atuação</Label>
          <Input id="region" {...form.register("region")} placeholder="Ex: São Paulo, SP" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="experienceYears">Anos de Experiência</Label>
          <Input 
            id="experienceYears" 
            type="number" 
            {...form.register("experienceYears", { valueAsNumber: true })} 
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="bio">Sobre você</Label>
        <Textarea id="bio" {...form.register("bio")} placeholder="Conte um pouco sobre sua experiência..." />
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Finalizar Cadastro
      </Button>
    </form>
  );
}

function CompanyForm({ onSubmit, isPending }: { onSubmit: (data: any) => void, isPending: boolean }) {
  const form = useForm({
    resolver: zodResolver(insertCompanySchema.extend({ responsavel: z.string().min(3) })),
    defaultValues: {
      tradingName: "",
      corporateName: "",
      cnpj: "",
      phone: "",
      emailContact: "",
      addressFull: "",
      city: "",
      state: "",
      industryType: "lojista",
      companySize: "pequena",
      responsavel: "", // Field for the profile creation
    }
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-4">
        <h3 className="font-medium text-slate-900">Dados da Empresa</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="tradingName">Nome Fantasia</Label>
            <Input id="tradingName" {...form.register("tradingName")} />
            {form.formState.errors.tradingName && <p className="text-sm text-red-500">{form.formState.errors.tradingName.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="corporateName">Razão Social</Label>
            <Input id="corporateName" {...form.register("corporateName")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input id="cnpj" {...form.register("cnpj")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone Comercial</Label>
            <Input id="phone" {...form.register("phone")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emailContact">Email Corporativo</Label>
            <Input id="emailContact" type="email" {...form.register("emailContact")} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
           <div className="space-y-2">
            <Label htmlFor="industryType">Ramo de Atuação</Label>
            <Select onValueChange={(val) => form.setValue("industryType", val as any)} defaultValue={form.getValues("industryType") || "lojista"}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {industryTypeEnum.enumValues.map((type) => (
                  <SelectItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="companySize">Porte da Empresa</Label>
            <Select onValueChange={(val) => form.setValue("companySize", val as any)} defaultValue={form.getValues("companySize") || "pequena"}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {companySizeEnum.enumValues.map((size) => (
                  <SelectItem key={size} value={size}>{size.charAt(0).toUpperCase() + size.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="addressFull">Endereço Completo</Label>
          <Input id="addressFull" {...form.register("addressFull")} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="city">Cidade</Label>
            <Input id="city" {...form.register("city")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">Estado</Label>
            <Input id="state" {...form.register("state")} />
          </div>
        </div>

        <h3 className="font-medium text-slate-900 pt-4">Dados do Responsável</h3>
        <div className="space-y-2">
          <Label htmlFor="responsavel">Nome do Responsável</Label>
          <Input id="responsavel" {...form.register("responsavel")} />
        </div>
      </div>

      <Button type="submit" className="w-full mt-6" disabled={isPending}>
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Cadastrar Empresa
      </Button>
    </form>
  );
}
