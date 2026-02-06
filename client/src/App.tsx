import { Switch, Route, Redirect, useLocation } from "wouter";
import React from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { LayoutShell } from "@/components/layout-shell";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import Profile from "@/pages/profile";
import ServicesList from "@/pages/services-list";
import OnboardingPage from "@/pages/onboarding";
import { Loader2 } from "lucide-react";
import { api } from "@shared/routes";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Fetch profile to check if onboarding is needed
  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ["/api/profiles/me"],
    queryFn: async () => {
      const res = await fetch(api.profiles.me.path);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch profile");
      return res.json();
    },
    enabled: !!user,
    retry: false,
  });

  if (isLoading || (user && isProfileLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    console.log("[ProtectedRoute] No user found, redirecting to /");
    return <Redirect to="/" />;
  }

  // If user has no profile, redirect to onboarding
  // If profile exists but is incomplete (e.g. no phone), redirect to onboarding
  const isProfileComplete = profile && profile.phone && profile.phone.length > 0;
  
  if (user && !isProfileComplete) {
     console.log("[ProtectedRoute] Profile incomplete, redirecting to /onboarding");
     return <Redirect to="/onboarding" />;
  }

  return <Component />;
}

function Router() {
  const { user, isLoading } = useAuth();
  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ["/api/profiles/me"],
    queryFn: async () => {
      const res = await fetch(api.profiles.me.path);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch profile");
      return res.json();
    },
    enabled: !!user,
    retry: false,
  });

  if (isLoading || (user && isProfileLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const isProfileComplete = profile && profile.phone && profile.phone.length > 0;

  // Debug routing state
  React.useEffect(() => {
    console.log("[Router] State update:", {
      isLoading,
      isProfileLoading,
      hasUser: !!user,
      isProfileComplete,
      currentPath: window.location.pathname
    });
  }, [isLoading, isProfileLoading, user, isProfileComplete]);

  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/onboarding">
        {user ? (isProfileComplete ? <Redirect to="/" /> : <OnboardingPage />) : <Redirect to="/auth" />}
      </Route>
      
      {/* App Routes with Layout */}
      <Route>
        {user && isProfileComplete ? (
          <LayoutShell>
            <Switch>
              <Route path="/">
                 <Dashboard />
              </Route>
              <Route path="/profile">
                <ProtectedRoute component={Profile} />
              </Route>
              <Route path="/services">
                <ProtectedRoute component={ServicesList} />
              </Route>
              <Route component={NotFound} />
            </Switch>
          </LayoutShell>
        ) : (
          <Switch>
            <Route path="/">
               <Landing />
            </Route>
             {/* Fallback for other routes if not logged in/complete -> Redirect or 404 */}
            <Route component={() => <Redirect to={user ? "/onboarding" : "/"} />} />
          </Switch>
        )}
      </Route>
    </Switch>
  );
}


function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
