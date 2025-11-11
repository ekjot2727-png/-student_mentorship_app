import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DesktopNav } from "@/components/navigation/DesktopNav";
import { MobileNav } from "@/components/navigation/MobileNav";
import { useAuth } from "@/lib/auth";
import { Loader2, MessageCircle } from "lucide-react";
import { User } from "@shared/schema";

export default function ChatList() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: conversations, isLoading } = useQuery<User[]>({
    queryKey: ["/api/conversations"],
  });

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <DesktopNav />

      <main className="container mx-auto px-4 md:px-6 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Messages</h1>
          <p className="text-muted-foreground text-lg">
            Continue your conversations
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : conversations && conversations.length > 0 ? (
          <div className="space-y-3">
            {conversations.map((contact) => (
              <Card
                key={contact.id}
                className="hover-elevate cursor-pointer transition-all duration-200"
                onClick={() => setLocation(`/chat/${contact.id}`)}
                data-testid={`card-chat-${contact.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                        {getInitials(contact.username)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg" data-testid={`text-chat-user-${contact.id}`}>
                        {contact.username}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {contact.email}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No conversations yet</h3>
            <p className="text-muted-foreground">
              Start a conversation with a mentor or student
            </p>
          </div>
        )}
      </main>

      <MobileNav />
    </div>
  );
}
