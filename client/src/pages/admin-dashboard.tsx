import { useState } from "react";
import Sidebar from "@/components/sidebar";
import AdminOverview from "@/components/admin/admin-overview";
import AdminInterns from "@/components/admin/admin-interns";
import AdminTasks from "@/components/admin/admin-tasks";
import AdminMeetings from "@/components/admin/admin-meetings";
import AdminCertificates from "@/components/admin/admin-certificates";
import { useLocation } from "wouter";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("admin-overview");
  const [, setLocation] = useLocation();

  const renderTabContent = () => {
    switch (activeTab) {
      case "admin-overview":
        return <AdminOverview />;
      case "admin-interns":
        return <AdminInterns />;
      case "admin-tasks":
        return <AdminTasks />;
      case "admin-meetings":
        return <AdminMeetings />;
      case "admin-certificates":
        return <AdminCertificates />;
      default:
        return <AdminOverview />;
    }
  };

  const getPageInfo = () => {
    const titles = {
      "admin-overview": { title: "Admin Dashboard", subtitle: "Overview of all intern activities" },
      "admin-interns": { title: "All Interns", subtitle: "Manage intern profiles and progress" },
      "admin-tasks": { title: "Task Management", subtitle: "Create and assign tasks to interns" },
      "admin-meetings": { title: "Meeting Management", subtitle: "Schedule and manage meetings" },
      "admin-certificates": { title: "Certificate Management", subtitle: "Generate and manage certificates" },
    };
    return titles[activeTab as keyof typeof titles] || titles["admin-overview"];
  };

  const handleModeChange = () => {
    setLocation("/");
  };

  const pageInfo = getPageInfo();

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar
        mode="admin"
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onModeChange={handleModeChange}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 data-testid="page-title" className="text-xl font-semibold text-slate-800">
                {pageInfo.title}
              </h2>
              <p data-testid="page-subtitle" className="text-sm text-slate-600">
                {pageInfo.subtitle}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* User Avatar */}
              <div className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center">
                <i className="fas fa-user text-slate-600 text-sm"></i>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
}
