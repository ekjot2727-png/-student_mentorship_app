import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Session, User } from "@shared/schema";
import { Calendar, Clock, MessageCircle, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";

interface SessionCardProps {
  session: Session & { student?: User; mentor?: User };
  currentUserId: string;
  onConfirm?: (sessionId: string) => void;
  onCancel?: (sessionId: string) => void;
  onChat?: (userId: string) => void;
  isLoading?: boolean;
}

export function SessionCard({ session, currentUserId, onConfirm, onCancel, onChat, isLoading }: SessionCardProps) {
  const isStudent = session.studentId === currentUserId;
  const otherUser = isStudent ? session.mentor : session.student;
  const isMentor = session.mentorId === currentUserId;

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getStatusBadge = () => {
    const variants = {
      pending: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
      confirmed: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
      completed: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
      cancelled: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
    };

    return (
      <Badge
        className={variants[session.status]}
        variant="outline"
        data-testid={`badge-status-${session.status}`}
      >
        {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
      </Badge>
    );
  };

  return (
    <Card className="hover-elevate transition-all duration-200" data-testid={`card-session-${session.id}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4 flex-1">
            {otherUser && (
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                  {getInitials(otherUser.username)}
                </AvatarFallback>
              </Avatar>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg mb-1" data-testid={`text-session-user-${session.id}`}>
                {otherUser?.username || "Unknown User"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {isStudent ? "Mentor" : "Student"}
              </p>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{session.subject}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{format(new Date(session.scheduledTime), "PPP 'at' p")}</span>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {session.status === "pending" && isMentor && (
            <Button
              size="sm"
              onClick={() => onConfirm?.(session.id)}
              disabled={isLoading}
              className="gap-1"
              data-testid={`button-confirm-${session.id}`}
            >
              <CheckCircle className="h-4 w-4" />
              Confirm
            </Button>
          )}
          
          {(session.status === "pending" || session.status === "confirmed") && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onCancel?.(session.id)}
              disabled={isLoading}
              className="gap-1"
              data-testid={`button-cancel-${session.id}`}
            >
              <XCircle className="h-4 w-4" />
              Cancel
            </Button>
          )}
          
          {otherUser && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onChat?.(otherUser.id)}
              className="gap-1"
              data-testid={`button-chat-${session.id}`}
            >
              <MessageCircle className="h-4 w-4" />
              Chat
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
