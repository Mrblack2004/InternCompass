import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface SidebarProps {
  mode: "intern" | "admin";
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Sidebar({ mode, activeTab, onTabChange }: SidebarProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const internNavItems = [
    { id: "profile", icon: "fas fa-user", label: "Profile" },
    { id: "tasks", icon: "fas fa-tasks", label: "Tasks" },
    { id: "resources", icon: "fas fa-folder", label: "Resources" },
    { id: "certificate", icon: "fas fa-certificate", label: "Certificate" },
  ];

  const adminNavItems = [
    { id: "admin-overview", icon: "fas fa-tachometer-alt", label: "Overview" },
    { id: "admin-interns", icon: "fas fa-users", label: "All Interns" },
    { id: "admin-tasks", icon: "fas fa-clipboard-list", label: "Task Management" },
    { id: "admin-resources", icon: "fas fa-folder-open", label: "Resources" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("userType");
    localStorage.removeItem("username");
    setLocation("/");
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of the system",
    });
  };

  const navItems = mode === "intern" ? internNavItems : adminNavItems;

  return (
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

        {/* Logout */}
        <div className="p-4 border-t border-slate-200">
          <button
            data-testid="button-logout"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <i className="fas fa-sign-out-alt w-5"></i>
            <span>Logout</span>
          </button>
        </div>
      </div>
  );
}
