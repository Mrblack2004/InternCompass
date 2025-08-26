import { useState } from "react";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface SidebarProps {
  mode: "intern" | "admin";
  activeTab: string;
  onTabChange: (tab: string) => void;
  onModeChange: () => void;
}

export default function Sidebar({ mode, activeTab, onTabChange, onModeChange }: SidebarProps) {
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const internNavItems = [
    { id: "profile", icon: "fas fa-user", label: "Profile" },
    { id: "tasks", icon: "fas fa-tasks", label: "Tasks" },
    { id: "meetings", icon: "fas fa-calendar", label: "Meetings" },
    { id: "certificate", icon: "fas fa-certificate", label: "Certificate" },
  ];

  const adminNavItems = [
    { id: "admin-overview", icon: "fas fa-tachometer-alt", label: "Overview" },
    { id: "admin-interns", icon: "fas fa-users", label: "All Interns" },
    { id: "admin-tasks", icon: "fas fa-clipboard-list", label: "Task Management" },
    { id: "admin-meetings", icon: "fas fa-video", label: "Meetings" },
    { id: "admin-certificates", icon: "fas fa-award", label: "Certificates" },
  ];

  const handleModeToggle = () => {
    if (mode === "intern") {
      setShowAdminModal(true);
    } else {
      onModeChange();
    }
  };

  const handleAdminLogin = () => {
    // Simple password check - in real app would be proper authentication
    if (adminPassword === "admin123") {
      setShowAdminModal(false);
      setAdminPassword("");
      setLocation("/admin");
      toast({
        title: "Admin access granted",
        description: "Welcome to the admin dashboard",
      });
    } else {
      toast({
        title: "Invalid password",
        description: "Please enter the correct admin password",
        variant: "destructive",
      });
    }
  };

  const navItems = mode === "intern" ? internNavItems : adminNavItems;

  return (
    <>
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <i className="fas fa-graduation-cap text-white text-sm"></i>
            </div>
            <h1 className="text-lg font-semibold text-slate-800">InternTrack</h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                data-testid={`nav-${item.id}`}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === item.id
                    ? "bg-primary text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <i className={`${item.icon} w-5`}></i>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Mode Switch */}
        <div className="p-4 border-t border-slate-200">
          <button
            data-testid="button-mode-toggle"
            onClick={handleModeToggle}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <i className="fas fa-cog w-5"></i>
            <span>{mode === "intern" ? "Admin Mode" : "Intern Mode"}</span>
          </button>
        </div>
      </div>

      {/* Admin Password Modal */}
      <Dialog open={showAdminModal} onOpenChange={setShowAdminModal}>
        <DialogContent data-testid="modal-admin-login">
          <DialogHeader>
            <DialogTitle>Admin Access</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              data-testid="input-admin-password"
              type="password"
              placeholder="Enter admin password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
            />
            <div className="flex gap-3">
              <Button
                data-testid="button-cancel-admin"
                variant="outline"
                onClick={() => setShowAdminModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                data-testid="button-admin-login"
                onClick={handleAdminLogin}
                className="flex-1"
              >
                Access
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
