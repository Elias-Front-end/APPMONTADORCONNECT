import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function usePendingProfiles() {
  return useQuery({
    queryKey: [api.admin.pendingProfiles.path],
    queryFn: async () => {
      const res = await fetch(api.admin.pendingProfiles.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch pending profiles");
      return await res.json();
    },
  });
}

export function useApproveProfile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(buildUrl(api.admin.approveProfile.path, { id }), {
        method: 'POST',
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to approve profile");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.admin.pendingProfiles.path] });
      toast({ title: "Perfil aprovado", description: "O montador agora pode acessar todos os serviços." });
    }
  });
}

export function useBlockProfile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(buildUrl(api.admin.blockProfile.path, { id }), {
        method: 'POST',
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to block profile");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.admin.pendingProfiles.path] });
      toast({ title: "Perfil bloqueado", description: "O usuário foi impedido de realizar ações." });
    }
  });
}

export function useAuditLogs() {
  return useQuery({
    queryKey: [api.admin.auditLogs.path],
    queryFn: async () => {
      const res = await fetch(api.admin.auditLogs.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch audit logs");
      return await res.json();
    },
  });
}
