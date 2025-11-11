import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DesktopNav } from "@/components/navigation/DesktopNav";
import { MobileNav } from "@/components/navigation/MobileNav";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ArrowLeft, Clock, Calendar, Loader2, MessageCircle } from "lucide-react";
import { User, Profile } from "@shared/schema";

type MentorWithProfile = User & { profile?: Profile };

export default function MentorProfile() {
  const [, params] = useRoute("/mentor/:id");
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    subject: "",
    scheduledTime: "",
    message: "",
  });

  const { data: mentor, isLoading } = useQuery<MentorWithProfile>({
    queryKey: ["/api/mentors/", params?.id || ""],
    enabled: !!params?.id,
  });

  const bookSessionMutation = useMutation({
    mutationFn: async (data: { mentorId: string; subject: string; scheduledTime: string }) => {
      return await apiRequest("POST", "/api/sessions/book", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sessions/me"] });
      setIsBookingOpen(false);
      setBookingForm({ subject: "", scheduledTime: "", message: "" });
      toast({
        title: "Session booked!",
        description: "Your session request has been sent to the mentor.",
      });
      setLocation("/dashboard");
    },
    onError: () => {
      toast({
        title: "Booking failed",
        description: "Failed to book session. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleBookSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!params?.id) return;
    
    bookSessionMutation.mutate({
      mentorId: params.id,
      subject: bookingForm.subject,
      scheduledTime: new Date(bookingForm.scheduledTime).toISOString(),
    });
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

  if (!mentor) {
    return (
      <div className="min-h-screen bg-background">
        <DesktopNav />
        <div className="container mx-auto px-4 md:px-6 py-8">
          <p className="text-center text-muted-foreground">Mentor not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <DesktopNav />

      <main className="container mx-auto px-4 md:px-6 py-8">
        <Button
          variant="ghost"
          onClick={() => setLocation("/search")}
          className="mb-6 gap-2"
          data-testid="button-back"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Search
        </Button>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <Avatar className="h-32 w-32 mb-4">
                  <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-3xl">
                    {getInitials(mentor.username)}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold mb-2" data-testid="text-mentor-name">
                  {mentor.username}
                </h2>
                <p className="text-sm text-muted-foreground mb-4">{mentor.email}</p>
                <Badge className="mb-6" data-testid="badge-role">Mentor</Badge>

                {user?.role === "student" && (
                  <div className="w-full space-y-3">
                    <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full gap-2" data-testid="button-book-session">
                          <Calendar className="h-4 w-4" />
                          Book Session
                        </Button>
                      </DialogTrigger>
                      <DialogContent data-testid="dialog-book-session">
                        <DialogHeader>
                          <DialogTitle>Book a Session</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleBookSession} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="subject">Subject</Label>
                            <Input
                              id="subject"
                              placeholder="e.g., Math, Physics..."
                              value={bookingForm.subject}
                              onChange={(e) =>
                                setBookingForm({ ...bookingForm, subject: e.target.value })
                              }
                              required
                              data-testid="input-session-subject"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="scheduledTime">Date & Time</Label>
                            <Input
                              id="scheduledTime"
                              type="datetime-local"
                              value={bookingForm.scheduledTime}
                              onChange={(e) =>
                                setBookingForm({ ...bookingForm, scheduledTime: e.target.value })
                              }
                              required
                              data-testid="input-session-time"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="message">Message (Optional)</Label>
                            <Textarea
                              id="message"
                              placeholder="What would you like to learn?"
                              value={bookingForm.message}
                              onChange={(e) =>
                                setBookingForm({ ...bookingForm, message: e.target.value })
                              }
                              rows={3}
                              data-testid="input-session-message"
                            />
                          </div>
                          <Button
                            type="submit"
                            className="w-full"
                            disabled={bookSessionMutation.isPending}
                            data-testid="button-submit-booking"
                          >
                            {bookSessionMutation.isPending ? "Booking..." : "Confirm Booking"}
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="outline"
                      className="w-full gap-2"
                      onClick={() => setLocation(`/chat/${mentor.id}`)}
                      data-testid="button-send-message"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Send Message
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">About</h3>
                <p className="text-muted-foreground">
                  {mentor.profile?.bio || "This mentor hasn't added a bio yet."}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Subjects</h3>
                {mentor.profile?.subjects && mentor.profile.subjects.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {mentor.profile.subjects.map((subject) => (
                      <Badge key={subject} variant="secondary" className="text-sm">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No subjects specified</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4">Availability</h3>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-5 w-5" />
                  <span>{mentor.profile?.availability || "Not specified"}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <MobileNav />
    </div>
  );
}
