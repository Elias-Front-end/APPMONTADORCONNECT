import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { Profile, ServiceAssignment } from "@shared/schema";
import { useAlert } from "@/hooks/use-alert";

export function useTeamManagement(serviceId?: number) {
  const { showAlert } = useAlert();
  const queryClient = useQueryClient();

  // 1. List all available montadores
  const { data: montadores, isLoading: isLoadingMontadores } = useQuery<Profile[]>({
    queryKey: [api.montadores.list.path],
    queryFn: async () => {
      const res = await fetch(api.montadores.list.path);
      if (!res.ok) throw new Error("Falha ao buscar montadores");
      return res.json();
    }
  });

  // 2. List assignments for this service
  const { data: assignments, isLoading: isLoadingAssignments } = useQuery<ServiceAssignment[]>({
    queryKey: [api.services.getAssignments.path, serviceId],
    queryFn: async () => {
      if (!serviceId) return [];
      const path = api.services.getAssignments.path.replace(":id", serviceId.toString());
      const res = await fetch(path);
      if (!res.ok) throw new Error("Falha ao buscar equipe");
      return res.json();
    },
    enabled: !!serviceId
  });

  // 3. Invite mutation
  const inviteMutation = useMutation({
    mutationFn: async (montadorId: string) => {
       if (!serviceId) throw new Error("Service ID missing");
       const path = api.services.assign.path.replace(":id", serviceId.toString());
       const res = await fetch(path, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ montadorId, status: "invited" })
       });
       if (!res.ok) {
         const error = await res.json();
         throw new Error(error.message || "Falha ao convidar");
       }
       return res.json();
    },
    onSuccess: () => {
       showAlert({
         title: "Convite Enviado",
         message: "O montador foi convidado para o serviço com sucesso.",
         type: "success"
       });
       queryClient.invalidateQueries({ queryKey: [api.services.getAssignments.path, serviceId] });
    },
     onError: (err: Error) => {
       showAlert({
         title: "Erro ao Convidar",
         message: err.message,
         type: "error"
       });
    }
  });

  // 4. Update Status Mutation (Remove, Approve)
  const updateAssignmentMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
       const path = api.assignments.update.path.replace(":id", id.toString());
       const res = await fetch(path, {
         method: "PUT",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ status })
       });
       if (!res.ok) throw new Error("Falha ao atualizar");
       return res.json();
    },
     onSuccess: () => {
        showAlert({
          title: "Status Atualizado",
          message: "A atribuição foi atualizada com sucesso.",
          type: "success"
        });
        queryClient.invalidateQueries({ queryKey: [api.services.getAssignments.path, serviceId] });
    }
  });

  return {
    montadores,
    isLoadingMontadores,
    assignments,
    isLoadingAssignments,
    inviteMutation,
    updateAssignmentMutation
  };
}
