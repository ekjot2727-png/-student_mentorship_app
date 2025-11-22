import { useState, useEffect, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DesktopNav } from "@/components/navigation/DesktopNav";
import { MobileNav } from "@/components/navigation/MobileNav";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import { User, Message } from "@shared/schema";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Chat() {
  const [, params] = useRoute("/chat/:userId");
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [ws, setWs] = useState<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: otherUser, isLoading } = useQuery<User>({
    queryKey: ["/api/users/", params?.userId || ""],
    enabled: !!params?.userId,
  });

  const { data: messageHistory, refetch } = useQuery<Message[]>({
    queryKey: ["/api/messages/", params?.userId || ""],
    enabled: !!params?.userId,
  });

  useEffect(() => {
    if (messageHistory) {
      setMessages(messageHistory);
    }
  }, [messageHistory]);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      if (user?.id) {
        socket.send(JSON.stringify({ type: "join", userId: user.id }));
      }
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "message" && data.message) {
          const msg = data.message;
          // Only add message if it's relevant to this conversation
          if ((msg.senderId === params?.userId && msg.receiverId === user?.id) ||
              (msg.senderId === user?.id && msg.receiverId === params?.userId)) {
            setMessages((prev) => [...prev, msg]);
            // Refetch to ensure we have all messages
            refetch();
          }
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      toast({
        title: "Connection error",
        description: "Failed to connect to messaging service",
        variant: "destructive",
      });
    };

    setWs(socket);

    return () => {
      socket.close();
    };
  }, [user?.id, params?.userId, refetch, toast]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !ws || !params?.userId || !user) return;

    if (ws.readyState !== WebSocket.OPEN) {
      toast({
        title: "Connection error",
        description: "WebSocket connection is not open",
        variant: "destructive",
      });
      return;
    }

    const message = {
      type: "sendMessage",
      senderId: user.id,
      receiverId: params.userId,
      content: newMessage,
    };

    ws.send(JSON.stringify(message));
    setNewMessage("");
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <DesktopNav />
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!otherUser) {
    return (
      <div className="min-h-screen bg-background">
        <DesktopNav />
        <div className="container mx-auto px-4 md:px-6 py-8">
          <p className="text-center text-muted-foreground">User not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <DesktopNav />

      <div className="md:hidden border-b border-border bg-card">
        <div className="flex items-center gap-3 p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/chat")}
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
              {getInitials(otherUser.username)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold" data-testid="text-chat-username">
              {otherUser.username}
            </h2>
            <p className="text-xs text-muted-foreground">{otherUser.role}</p>
          </div>
        </div>
      </div>

      <main className="flex-1 overflow-hidden">
        <div className="container mx-auto h-full max-w-4xl flex flex-col">
          <div className="hidden md:flex items-center gap-3 py-4 px-6 border-b border-border">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/chat")}
              data-testid="button-back-desktop"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                {getInitials(otherUser.username)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold">{otherUser.username}</h2>
              <p className="text-sm text-muted-foreground capitalize">{otherUser.role}</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg, idx) => {
                const isSent = msg.senderId === user?.id;
                return (
                  <div
                    key={idx}
                    className={`flex ${isSent ? "justify-end" : "justify-start"}`}
                    data-testid={`message-${idx}`}
                  >
                    <div className={`max-w-[70%] ${isSent ? "items-end" : "items-start"} flex flex-col gap-1`}>
                      <Card
                        className={`px-4 py-2 ${
                          isSent
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                      </Card>
                      <span className="text-xs text-muted-foreground px-2">
                        {format(new Date(msg.timestamp), "p")}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-border p-4 md:p-6 bg-card">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1"
                data-testid="input-message"
              />
              <Button type="submit" size="icon" disabled={!newMessage.trim()} data-testid="button-send">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </main>

      <div className="md:hidden pb-16">
        <MobileNav />
      </div>
    </div>
  );
}
