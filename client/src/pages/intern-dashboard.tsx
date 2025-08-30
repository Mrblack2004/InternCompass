import { useState } from "react";
import Sidebar from "@/components/sidebar";
import ProfileTab from "@/components/intern/profile-tab";
import TasksTab from "@/components/intern/tasks-tab";
import ResourcesTab from "@/components/intern/resources-tab";
import CertificateTab from "@/components/intern/certificate-tab";
import { useQuery } from "@tanstack/react-query";
import type { Notification } from "@shared/schema";

export default function InternDashboard() {
  const [activeTab, setActiveTab] = useState("profile");
  const currentUserId = localStorage.getItem("userId") || "";

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications/user", currentUserId],
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileTab userId={currentUserId} />;
      case "tasks":
        return <TasksTab userId={currentUserId} />;
      case "resources":
        return <ResourcesTab userId={currentUserId} />;
      case "certificate":
        return <CertificateTab userId={currentUserId} />;
      default:
        return <ProfileTab userId={currentUserId} />;
    }
  };

  const getPageInfo = () => {
    const titles = {
      profile: { title: "Profile", subtitle: "Manage your internship profile" },
      tasks: { title: "Tasks", subtitle: "Track your assigned tasks and progress" },
      resources: { title: "Resources", subtitle: "Access meeting links, documents, and notes" },
      certificate: { title: "Certificate", subtitle: "Download your internship certificate" },
    };
    return titles[activeTab as keyof typeof titles] || titles.profile;
  };

  const pageInfo = getPageInfo();

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar
        mode="intern"
        activeTab={activeTab}
        onTabChange={setActiveTab}
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
              {/* Notification Bell */}
              <button 
                data-testid="button-notifications"
                className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <i className="fas fa-bell"></i>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
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
