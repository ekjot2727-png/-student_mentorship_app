import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, User, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function Auth() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [selectedRole, setSelectedRole] = useState<"student" | "mentor">("student");

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      return await apiRequest("POST", "/api/auth/login", data);
    },
    onSuccess: (data) => {
      login(data.user, data.token);
      toast({
        title: "Welcome back!",
        description: "You've successfully logged in.",
      });
      setLocation("/search");
    },
    onError: () => {
      toast({
        title: "Login failed",
        description: "Invalid email or password.",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: { username: string; email: string; password: string; role: string }) => {
      return await apiRequest("POST", "/api/auth/register", data);
    },
    onSuccess: (data) => {
      login(data.user, data.token);
      toast({
        title: "Welcome to MentorConnect!",
        description: "Your account has been created successfully.",
      });
      setLocation("/profile");
    },
    onError: () => {
      toast({
        title: "Registration failed",
        description: "Email or username already exists.",
        variant: "destructive",
      });
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(loginForm);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerForm.password !== registerForm.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    registerMutation.mutate({
      username: registerForm.username,
      email: registerForm.email,
      password: registerForm.password,
      role: selectedRole,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="font-bold text-2xl">MentorConnect</span>
          </div>
          <p className="text-muted-foreground">Connect with mentors and unlock your potential</p>
        </div>

        <Card>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "register")}>
            <CardHeader>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login" data-testid="tab-login">Login</TabsTrigger>
                <TabsTrigger value="register" data-testid="tab-register">Register</TabsTrigger>
              </TabsList>
            </CardHeader>

            <TabsContent value="login">
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="your@email.com"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      required
                      data-testid="input-email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      required
                      data-testid="input-password"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loginMutation.isPending}
                    data-testid="button-submit-login"
                  >
                    {loginMutation.isPending ? "Logging in..." : "Log in"}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister}>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Label>I am a...</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <Card
                        className={`cursor-pointer transition-all hover-elevate ${
                          selectedRole === "student" ? "ring-2 ring-primary" : ""
                        }`}
                        onClick={() => setSelectedRole("student")}
                        data-testid="card-role-student"
                      >
                        <CardContent className="flex flex-col items-center justify-center p-6 gap-2">
                          <User className="h-8 w-8 text-primary" />
                          <span className="font-medium">Student</span>
                        </CardContent>
                      </Card>
                      <Card
                        className={`cursor-pointer transition-all hover-elevate ${
                          selectedRole === "mentor" ? "ring-2 ring-primary" : ""
                        }`}
                        onClick={() => setSelectedRole("mentor")}
                        data-testid="card-role-mentor"
                      >
                        <CardContent className="flex flex-col items-center justify-center p-6 gap-2">
                          <Users className="h-8 w-8 text-primary" />
                          <span className="font-medium">Mentor</span>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-username">Username</Label>
                    <Input
                      id="register-username"
                      type="text"
                      placeholder="johndoe"
                      value={registerForm.username}
                      onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                      required
                      data-testid="input-username"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="your@email.com"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                      required
                      data-testid="input-register-email"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="••••••••"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      required
                      data-testid="input-register-password"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="••••••••"
                      value={registerForm.confirmPassword}
                      onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                      required
                      data-testid="input-confirm-password"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={registerMutation.isPending}
                    data-testid="button-submit-register"
                  >
                    {registerMutation.isPending ? "Creating account..." : "Create account"}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
