import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { GraduationCap, Users, Calendar, MessageCircle, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">MentorConnect</span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/auth">
                <Button variant="ghost" data-testid="button-login">
                  Log in
                </Button>
              </Link>
              <Link href="/auth?mode=register">
                <Button data-testid="button-get-started">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="relative h-[500px] md:h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-background" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjAuNSIgb3BhY2l0eT0iMC4xIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40" />
        
        <div className="relative container mx-auto px-4 md:px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Connect with Mentors,<br />Unlock Your Potential
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join our community of students and volunteer mentors. Get free help, share knowledge, and grow together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/auth?mode=register&role=student">
              <Button size="lg" className="gap-2 min-w-[200px]" data-testid="button-find-mentor">
                Find a Mentor
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/auth?mode=register&role=mentor">
              <Button size="lg" variant="outline" className="gap-2 min-w-[200px]" data-testid="button-become-mentor">
                Become a Mentor
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-sm text-muted-foreground flex items-center justify-center gap-2">
            <Users className="h-4 w-4" />
            Join 1,000+ students and mentors
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Get started in three simple steps
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="hover-elevate transition-all duration-200">
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">1. Create Profile</h3>
                <p className="text-muted-foreground">
                  Sign up as a student seeking help or a mentor offering guidance
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate transition-all duration-200">
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">2. Book Sessions</h3>
                <p className="text-muted-foreground">
                  Find mentors by subject and schedule convenient learning sessions
                </p>
              </CardContent>
            </Card>

            <Card className="hover-elevate transition-all duration-200">
              <CardContent className="p-8">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">3. Start Learning</h3>
                <p className="text-muted-foreground">
                  Connect via real-time chat and begin your learning journey
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8 mt-auto">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              <span className="font-semibold">MentorConnect</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 MentorConnect. Connecting students with mentors.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
