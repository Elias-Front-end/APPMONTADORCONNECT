import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertCompany } from "@shared/routes";

export function useCompanies() {
  return useQuery({
    queryKey: [api.companies.list.path],
    queryFn: async () => {
      const res = await fetch(api.companies.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch companies");
      return api.companies.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertCompany) => {
      const res = await fetch(api.companies.create.path, {
        method: api.companies.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.companies.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create company");
      }
      return api.companies.create.responses[201].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.companies.list.path] }),
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<InsertCompany> & { id: number }) => {
      const url = buildUrl(api.companies.update.path, { id });
      const res = await fetch(url, {
        method: api.companies.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.companies.update.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        if (res.status === 404) throw new Error("Company not found");
        throw new Error("Failed to update company");
      }
      return api.companies.update.responses[200].parse(await res.json());
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [api.companies.list.path] }),
  });
}
