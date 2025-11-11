import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SessionCard } from "@/components/SessionCard";
import { DesktopNav } from "@/components/navigation/DesktopNav";
import { MobileNav } from "@/components/navigation/MobileNav";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Calendar } from "lucide-react";
import { Session, User } from "@shared/schema";

type SessionWithUsers = Session & { student?: User; mentor?: User };

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

  const { data: sessions, isLoading } = useQuery<SessionWithUsers[]>({
    queryKey: ["/api/sessions/me"],
  });

  const confirmMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      return await apiRequest("PUT", `/api/sessions/${sessionId}/confirm`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions/me"] });
      toast({
        title: "Session confirmed",
        description: "The session has been confirmed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to confirm",
        description: "Could not confirm the session. Please try again.",
        variant: "destructive",
      });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      return await apiRequest("PUT", `/api/sessions/${sessionId}/cancel`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions/me"] });
      toast({
        title: "Session cancelled",
        description: "The session has been cancelled.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to cancel",
        description: "Could not cancel the session. Please try again.",
        variant: "destructive",
      });
    },
  });

  const upcomingSessions = sessions?.filter(
    (s) => s.status === "pending" || s.status === "confirmed"
  ) || [];

  const pastSessions = sessions?.filter(
    (s) => s.status === "completed" || s.status === "cancelled"
  ) || [];

  const handleChat = (userId: string) => {
    setLocation(`/chat/${userId}`);
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <DesktopNav />

      <main className="container mx-auto px-4 md:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">My Sessions</h1>
          <p className="text-muted-foreground text-lg">
            Manage your upcoming and past learning sessions
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "upcoming" | "past")}>
          <TabsList className="mb-6">
            <TabsTrigger value="upcoming" className="gap-2" data-testid="tab-upcoming">
              <Calendar className="h-4 w-4" />
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="past" className="gap-2" data-testid="tab-past">
              <Calendar className="h-4 w-4" />
              Past
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : upcomingSessions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {upcomingSessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    currentUserId={user?.id || ""}
                    onConfirm={confirmMutation.mutate}
                    onCancel={cancelMutation.mutate}
                    onChat={handleChat}
                    isLoading={confirmMutation.isPending || cancelMutation.isPending}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No upcoming sessions</h3>
                <p className="text-muted-foreground">
                  {user?.role === "student"
                    ? "Book a session with a mentor to get started"
                    : "Students will book sessions with you"}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="past">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : pastSessions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pastSessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    currentUserId={user?.id || ""}
                    onChat={handleChat}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No past sessions</h3>
                <p className="text-muted-foreground">
                  Your completed and cancelled sessions will appear here
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <MobileNav />
    </div>
  );
}
