import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MentorCard } from "@/components/MentorCard";
import { DesktopNav } from "@/components/navigation/DesktopNav";
import { MobileNav } from "@/components/navigation/MobileNav";
import { Search, Loader2 } from "lucide-react";
import { User, Profile } from "@shared/schema";

type MentorWithProfile = User & { profile?: Profile };

export default function MentorSearch() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: mentors, isLoading } = useQuery<MentorWithProfile[]>({
    queryKey: searchQuery ? ["/api/mentors", `?subject=${encodeURIComponent(searchQuery)}`] : ["/api/mentors"],
  });

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <DesktopNav />

      <main className="container mx-auto px-4 md:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Find Your Mentor</h1>
          <p className="text-muted-foreground text-lg">
            Connect with experienced mentors in various subjects
          </p>
        </div>

        <div className="mb-8 max-w-xl">
          <Label htmlFor="search" className="text-base mb-2 block">
            Search by subject
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              id="search"
              type="search"
              placeholder="e.g. Math, Physics, React, Java..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-subject"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : mentors && mentors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors.map((mentor) => (
              <MentorCard key={mentor.id} mentor={mentor} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No mentors found</h3>
            <p className="text-muted-foreground">
              {searchQuery
                ? "Try different subjects or clear your search"
                : "No mentors available at the moment"}
            </p>
          </div>
        )}
      </main>

      <MobileNav />
    </div>
  );
}
