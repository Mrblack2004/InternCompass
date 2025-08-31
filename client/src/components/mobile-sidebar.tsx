import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface MobileSidebarProps {
  mode: "intern" | "admin";
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function MobileSidebar({ mode, activeTab, onTabChange }: MobileSidebarProps) {
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
    { id: "admin-team", icon: "fas fa-user-plus", label: "Team Management" },
    { id: "admin-tasks", icon: "fas fa-clipboard-list", label: "Task Management" },
    { id: "admin-resources", icon: "fas fa-folder-open", label: "Resources" },
  ];

  const handleLogout = () => {
    localStorage.clear();
    setLocation("/");
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of the system",
    });
  };

  const navItems = mode === "intern" ? internNavItems : adminNavItems;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden">
          <i className="fas fa-bars"></i>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <i className="fas fa-graduation-cap text-white text-sm"></i>
            </div>
            InternTrack
          </SheetTitle>
        </SheetHeader>
        
        <nav className="mt-6">
          <div className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
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

        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <i className="fas fa-sign-out-alt w-5"></i>
            <span>Logout</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}