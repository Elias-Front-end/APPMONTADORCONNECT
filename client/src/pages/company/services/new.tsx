import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { ServiceForm } from "@/components/service-form";
import { useToast } from "@/hooks/use-toast";
import { useAlert } from "@/hooks/use-alert";
import { useProfile } from "@/hooks/use-profiles";
import { useCompany } from "@/hooks/use-companies";

export default function CreateServicePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();
  
  // Also fetch company to ensure it exists and we have the ID, although profile.companyId should be enough
  // We can trust profile.companyId for now as it's set on company creation
  
  const createServiceMutation = useMutation({
    mutationFn: async (data: any) => {
      // 1. Create Service
      const { files, ...serviceFields } = data;
      
      const serviceData = {
        ...serviceFields,
        companyId: profile?.companyId,
        status: "published", // Start as published for now
      };
      
      const res = await apiRequest("POST", "/api/services", serviceData);
      if (!res.ok) throw new Error(await res.text());
      const service = await res.json();

      // 2. Upload Files if any
      if (files && files.length > 0) {
        for (const file of files) {
            const formData = new FormData();
            formData.append('file', file);
            
            const uploadRes = await fetch(`/api/services/${service.id}/attachments`, {
                method: 'POST',
                body: formData,
            });
            
            if (!uploadRes.ok) {
                console.error("Failed to upload file", file.name);
                // We don't fail the whole process but log it
            }
        }
      }
      
      return service;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      showAlert({
        title: "Serviço Criado!",
        message: "A ordem de serviço já está disponível para montadores.",
        type: "success",
        onConfirm: () => setLocation("/services")
      });
    },
    onError: (error: Error) => {
      let msg = error.message;
      try {
          // Try to parse if it's JSON error (zod mostly)
          const parsed = JSON.parse(error.message);
          if (parsed.message) msg = parsed.message;
      } catch (e) {}

      showAlert({
        title: "Erro ao Criar Serviço",
        message: msg,
        type: "error",
      });
    },
  });

  if (!profile) return null; // Or loader

  // Validation: Check if user has company profile completed
  if (!profile.companyId && profile.role !== 'montador') {
      // If role is company but no companyId, redirect to profile to complete setup
      // Assuming 'marcenaria' or 'lojista' roles
       return (
        <div className="max-w-3xl mx-auto py-8 px-4 text-center">
             <h2 className="text-2xl font-bold text-slate-800">Complete seu Perfil</h2>
             <p className="text-slate-600 mb-6">Você precisa finalizar o cadastro da sua empresa antes de criar serviços.</p>
             <button onClick={() => setLocation("/profile")} className="bg-blue-600 text-white px-4 py-2 rounded">
                 Ir para Perfil
             </button>
        </div>
       )
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-8">
      <div>
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
