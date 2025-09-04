import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleLogin = async () => {
    if (!username || !password) {
      setError("Please enter both username and password");
      return;
    }

    setIsLoading(true);
    setError("");
    
    console.log("Attempting login with:", { username, password: "***" });

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const user = await response.json();
        console.log("Login successful:", user);
        
        // Store user data in localStorage
        localStorage.setItem("userId", user.id);
        localStorage.setItem("username", user.username);
        localStorage.setItem("userRole", user.role);
        localStorage.setItem("teamId", user.teamId || "");
        localStorage.setItem("userName", user.name);

        // Redirect based on role
        switch (user.role) {
          case "intern":
            setLocation("/intern");
            break;
          case "admin":
            setLocation("/admin");
            break;
          case "superadmin":
            setLocation("/superadmin");
            break;
          default:
            setError("Invalid user role");
            return;
        }

        toast({
          title: "Login successful",
          description: `Welcome back, ${user.name}!`,
        });
      } else {
        const errorData = await response.json();
        console.error("Login failed:", errorData);
        setError(errorData.message || "Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-graduation-cap text-white text-2xl"></i>
          </div>
          <CardTitle className="text-2xl font-bold text-slate-800">InternTrack</CardTitle>
          <CardDescription className="text-slate-600">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              data-testid="input-username"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              data-testid="input-password"
            />
          </div>
          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg" data-testid="text-error">
              {error}
            </div>
          )}
          <Button 
            onClick={handleLogin} 
            className="w-full"
            disabled={isLoading}
            data-testid="button-login"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
          
          <div className="mt-6 p-4 bg-slate-50 rounded-lg">
            <h4 className="font-medium text-slate-800 mb-2">Demo Credentials:</h4>
            <div className="space-y-1 text-sm text-slate-600">
              <p><strong>Intern:</strong> intern / intern123</p>
              <p><strong>Admin:</strong> admin / admin123</p>
              <p><strong>Super Admin:</strong> Watcher / 12345</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}