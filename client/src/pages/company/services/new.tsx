import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { ServiceForm } from "@/components/service-form";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/use-profiles";

export default function CreateServicePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();

  const createServiceMutation = useMutation({
    mutationFn: async (data: any) => {
      // Ensure companyId is appended from profile if not present (handled in backend too but safe here)
      const serviceData = {
        ...data,
        companyId: profile?.companyId,
        status: "published", // Start as published for now, or draft
      };
      const res = await apiRequest("POST", "/api/services", serviceData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      toast({
        title: "Serviço criado com sucesso!",
        description: "A ordem de serviço já está disponível para montadores.",
      });
      setLocation("/services"); // Redirect to list
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar serviço",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (!profile) return null; // Or loader

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-slate-900">Nova Ordem de Serviço</h1>
        <p className="text-slate-500">Preencha os dados abaixo para criar uma nova OS.</p>
      </div>
      
      <ServiceForm 
        onSubmit={async (data) => {
          await createServiceMutation.mutateAsync(data);
        }}
        isSubmitting={createServiceMutation.isPending}
      />
    </div>
  );
}
