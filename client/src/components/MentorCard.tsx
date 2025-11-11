import { Link } from "wouter";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User as UserType, Profile } from "@shared/schema";
import { Clock } from "lucide-react";

interface MentorCardProps {
  mentor: UserType & { profile?: Profile };
}

export function MentorCard({ mentor }: MentorCardProps) {
  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <Card className="hover-elevate transition-all duration-200" data-testid={`card-mentor-${mentor.id}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-lg">
              {getInitials(mentor.username)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg mb-1" data-testid={`text-mentor-name-${mentor.id}`}>
              {mentor.username}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {mentor.profile?.bio || "No bio provided"}
            </p>
          </div>
        </div>

        {mentor.profile?.subjects && mentor.profile.subjects.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {mentor.profile.subjects.slice(0, 4).map((subject) => (
              <Badge key={subject} variant="secondary" data-testid={`badge-subject-${subject}`}>
                {subject}
              </Badge>
            ))}
            {mentor.profile.subjects.length > 4 && (
              <Badge variant="secondary">+{mentor.profile.subjects.length - 4} more</Badge>
            )}
          </div>
        )}

        {mentor.profile?.availability && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{mentor.profile.availability}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Link href={`/mentor/${mentor.id}`}>
          <Button className="w-full" data-testid={`button-view-profile-${mentor.id}`}>
            View Profile
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
