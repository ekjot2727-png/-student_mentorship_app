import { Link, useLocation } from "wouter";
import { Search, Calendar, MessageCircle, User } from "lucide-react";

export function MobileNav() {
  const [location] = useLocation();

  const navItems = [
    { path: "/search", icon: Search, label: "Search", testId: "nav-search" },
    { path: "/dashboard", icon: Calendar, label: "Sessions", testId: "nav-sessions" },
    { path: "/chat", icon: MessageCircle, label: "Chat", testId: "nav-chat" },
    { path: "/profile", icon: User, label: "Profile", testId: "nav-profile" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-card-border z-50">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = location === item.path;
          const Icon = item.icon;
          
          return (
            <Link key={item.path} href={item.path}>
              <a
                data-testid={item.testId}
                className={`flex flex-col items-center justify-center gap-1 px-4 py-2 transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </a>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
