import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useLocation } from "wouter";

export default function Login() {
  const [userType, setUserType] = useState<"intern" | "admin" | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [, setLocation] = useLocation();

  const handleLogin = async () => {
    if (!username || !password) {
      setError("Please enter both username and password");
      return;
    }

    if (userType === "admin") {
      if (username === "admin" && password === "admin123") {
        localStorage.setItem("userType", "admin");
        localStorage.setItem("username", username);
        setLocation("/admin");
      } else {
        setError("Invalid admin credentials. Use: admin / admin123");
      }
    } else {
      try {
        const response = await fetch("/api/interns/authenticate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
          const intern = await response.json();
          localStorage.setItem("userType", "intern");
          localStorage.setItem("username", username);
          localStorage.setItem("internId", intern.id);
          setLocation("/intern");
        } else {
          setError("Invalid intern credentials");
        }
      } catch (error) {
        setError("Login failed. Please try again.");
      }
    }
  };

  if (!userType) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Intern Management System</CardTitle>
            <CardDescription>Please select your role to continue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => setUserType("intern")} 
              className="w-full h-12 text-lg"
              data-testid="button-intern-role"
            >
              I'm an Intern
            </Button>
            <Button 
              onClick={() => setUserType("admin")} 
              variant="outline" 
              className="w-full h-12 text-lg"
              data-testid="button-admin-role"
            >
              I'm an Administrator
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {userType === "admin" ? "Admin Login" : "Intern Login"}
          </CardTitle>
          <CardDescription>
            {userType === "admin" 
              ? "Username: admin, Password: admin123" 
              : "Use credentials from Excel sheet"
            }
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
              data-testid="input-password"
            />
          </div>
          {error && (
            <div className="text-red-500 text-sm text-center" data-testid="text-error">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Button 
              onClick={handleLogin} 
              className="w-full"
              data-testid="button-login"
            >
              Login
            </Button>
            <Button 
              onClick={() => setUserType(null)} 
              variant="outline" 
              className="w-full"
              data-testid="button-back"
            >
              Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}