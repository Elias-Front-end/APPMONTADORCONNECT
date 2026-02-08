import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { User, InsertUser } from "@shared/schema";

async function fetchUser(): Promise<User | null> {
  const response = await fetch("/api/auth/user");
  
  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`${response.status}: ${response.statusText}`);
  }

  return response.json();
}

async function login(credentials: Pick<InsertUser, "username" | "password">): Promise<User> {
  const response = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}

async function register(user: InsertUser & { role?: string }): Promise<User> {
  const response = await fetch("/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}

async function logout(): Promise<void> {
  const response = await fetch("/api/logout", { method: "POST" });
  if (!response.ok) {
    throw new Error("Logout failed");
  }
}

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: fetchUser,
    retry: false,
    staleTime: Infinity,
  });

  const loginMutation = useMutation({
    mutationFn: login,
    onMutate: (variables) => {
      console.log(`[Auth] Attempting login for: ${variables.username}`);
    },
    onSuccess: (user) => {
      console.log(`[Auth] Login successful for: ${user.username}`);
      queryClient.setQueryData(["/api/auth/user"], user);
      queryClient.invalidateQueries({ queryKey: ["/api/profiles/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/companies"] }); // Invalidate company data too
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
    },
    onError: (error) => {
      console.error(`[Auth] Login failed:`, error);
    },
  });

  const registerMutation = useMutation({
    mutationFn: register,
    onMutate: (variables) => {
      console.log(`[Auth] Attempting registration for: ${variables.username}`);
    },
    onSuccess: (user) => {
      console.log(`[Auth] Registration successful for: ${user.username}`);
      queryClient.setQueryData(["/api/auth/user"], user);
      queryClient.invalidateQueries({ queryKey: ["/api/profiles/me"] });
    },
    onError: (error) => {
      console.error(`[Auth] Registration failed:`, error);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onMutate: () => {
      console.log(`[Auth] Attempting logout`);
    },
    onSuccess: () => {
      console.log(`[Auth] Logout successful`);
      queryClient.setQueryData(["/api/auth/user"], null);
      queryClient.setQueryData(["/api/profiles/me"], null); // Clear profile data immediately
      queryClient.removeQueries({ queryKey: ["/api/profiles/me"] });
      queryClient.removeQueries({ queryKey: ["/api/companies"] });
      queryClient.resetQueries(); // Reset all queries to clear any other user data
    },
    onError: (error) => {
      console.error(`[Auth] Logout failed:`, error);
    },
  });

  return {
    user,
    isLoading,
    error,
    loginMutation,
    registerMutation,
    logoutMutation,
  };
}
