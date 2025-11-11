import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DesktopNav } from "@/components/navigation/DesktopNav";
import { MobileNav } from "@/components/navigation/MobileNav";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, X } from "lucide-react";
import { Profile as ProfileType } from "@shared/schema";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bio, setBio] = useState("");
  const [availability, setAvailability] = useState("");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [newSubject, setNewSubject] = useState("");

  const { data: profile, isLoading } = useQuery<ProfileType>({
    queryKey: ["/api/profile/me"],
  });

  useEffect(() => {
    if (profile) {
      setBio(profile.bio || "");
      setAvailability(profile.availability || "");
      setSubjects(profile.subjects || []);
    }
  }, [profile]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { bio: string; subjects: string[]; availability: string }) => {
      return await apiRequest("POST", "/api/profile", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile/me"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddSubject = () => {
    if (newSubject.trim() && !subjects.includes(newSubject.trim())) {
      setSubjects([...subjects, newSubject.trim()]);
      setNewSubject("");
    }
  };

  const handleRemoveSubject = (subject: string) => {
    setSubjects(subjects.filter((s) => s !== subject));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({ bio, subjects, availability });
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <DesktopNav />

      <main className="container mx-auto px-4 md:px-6 py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">My Profile</h1>
          <p className="text-muted-foreground text-lg">
            Manage your profile information
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-2xl">
                  {user ? getInitials(user.username) : "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">{user?.username}</h2>
                <p className="text-muted-foreground">{user?.email}</p>
                <Badge className="mt-2" data-testid="badge-user-role">
                  {user?.role?.charAt(0).toUpperCase()}{user?.role?.slice(1)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Profile Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder={
                      user?.role === "mentor"
                        ? "Tell students about your expertise and teaching style..."
                        : "Tell mentors about your learning goals..."
                    }
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    data-testid="input-bio"
                  />
                </div>

                {user?.role === "mentor" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="subjects">Subjects</Label>
                      <div className="flex gap-2">
                        <Input
                          id="subjects"
                          placeholder="Add a subject (e.g., Math, Physics)..."
                          value={newSubject}
                          onChange={(e) => setNewSubject(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddSubject();
                            }
                          }}
                          data-testid="input-subject"
                        />
                        <Button
                          type="button"
                          onClick={handleAddSubject}
                          data-testid="button-add-subject"
                        >
                          Add
                        </Button>
                      </div>
                      {subjects.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {subjects.map((subject) => (
                            <Badge
                              key={subject}
                              variant="secondary"
                              className="gap-1 pr-1"
                              data-testid={`badge-subject-${subject}`}
                            >
                              {subject}
                              <button
                                type="button"
                                onClick={() => handleRemoveSubject(subject)}
                                className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                                data-testid={`button-remove-subject-${subject}`}
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="availability">Availability</Label>
                      <Input
                        id="availability"
                        placeholder="e.g., Mon-Fri 5PM-7PM, Weekends"
                        value={availability}
                        onChange={(e) => setAvailability(e.target.value)}
                        data-testid="input-availability"
                      />
                    </div>
                  </>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={updateProfileMutation.isPending}
                  data-testid="button-save-profile"
                >
                  {updateProfileMutation.isPending ? "Saving..." : "Save Profile"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </main>

      <MobileNav />
    </div>
  );
}
