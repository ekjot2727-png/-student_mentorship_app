import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import Home from "@/pages/Home";
import Auth from "@/pages/Auth";
import MentorSearch from "@/pages/MentorSearch";
import MentorProfile from "@/pages/MentorProfile";
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import ChatList from "@/pages/ChatList";
import Chat from "@/pages/Chat";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ component: Component }: { component: () => JSX.Element }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/" />;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/auth" component={Auth} />
      <Route path="/search">
        {() => <ProtectedRoute component={MentorSearch} />}
      </Route>
      <Route path="/mentor/:id">
        {() => <ProtectedRoute component={MentorProfile} />}
      </Route>
      <Route path="/dashboard">
        {() => <ProtectedRoute component={Dashboard} />}
      </Route>
      <Route path="/profile">
        {() => <ProtectedRoute component={Profile} />}
      </Route>
      <Route path="/chat">
        {() => <ProtectedRoute component={ChatList} />}
      </Route>
      <Route path="/chat/:userId">
        {() => <ProtectedRoute component={Chat} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
