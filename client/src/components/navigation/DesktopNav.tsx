import { Link, useLocation } from "wouter";
import { GraduationCap, Search, Calendar, MessageCircle, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function DesktopNav() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const allNavItems = [
    { path: "/profile", icon: User, label: "My Profile" },
    { path: "/search", icon: Search, label: "Find Mentors" },
    { path: "/dashboard", icon: Calendar, label: "My Sessions" },
    { path: "/chat", icon: MessageCircle, label: "Messages" },
  ];

  // Hide "Find Mentors" for mentors, only show for students
  const navItems = allNavItems.filter(item => {
    if (item.path === "/search" && user?.role === "mentor") {
      return false;
    }
    return true;
  });

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <nav className="hidden md:block border-b border-border bg-background sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 hover-elevate active-elevate-2 rounded-md px-3 py-2 transition-all" data-testid="link-home">
              <GraduationCap className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">MentorConnect</span>
            </Link>
            
            <div className="flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = location === item.path;
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    data-testid={`link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all hover-elevate active-elevate-2 ${
                      isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-user-menu">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                      {user ? getInitials(user.username) : "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col gap-1">
                    <p className="font-medium">{user?.username}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                    <p className="text-xs text-primary font-medium capitalize">{user?.role}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive" data-testid="button-logout">
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
