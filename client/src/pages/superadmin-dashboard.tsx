import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import type { User, Team, Task } from "@shared/schema";

interface TeamOverview {
  team: Team;
  admin: User;
  members: User[];
  taskCount: number;
  completedTasks: number;
}

export default function SuperAdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: teamOverviews = [], isLoading } = useQuery<TeamOverview[]>({
    queryKey: ["/api/superadmin/overview"],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
  });

  const handleLogout = () => {
    localStorage.clear();
    setLocation("/");
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of the system",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="animate-pulse p-6">
          <div className="h-8 bg-slate-200 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <i className="fas fa-eye text-white text-lg"></i>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Super Admin Dashboard</h1>
              <p className="text-sm text-slate-600">Monitor all teams and activities</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-800">Watcher</p>
              <p className="text-xs text-slate-600">Super Administrator</p>
            </div>
            <Button variant="outline" onClick={handleLogout} data-testid="button-logout">
              <i className="fas fa-sign-out-alt mr-2"></i>Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* System Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-users text-blue-600 text-xl"></i>
                  </div>
                  <div>
                    <div data-testid="stat-total-interns" className="text-2xl font-bold text-slate-800">
                      {stats?.totalInterns || 0}
                    </div>
                    <div className="text-sm text-slate-600">Total Interns</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-user-tie text-green-600 text-xl"></i>
                  </div>
                  <div>
                    <div data-testid="stat-total-admins" className="text-2xl font-bold text-slate-800">
                      {stats?.totalAdmins || 0}
                    </div>
                    <div className="text-sm text-slate-600">Team Admins</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-tasks text-purple-600 text-xl"></i>
                  </div>
                  <div>
                    <div data-testid="stat-active-tasks" className="text-2xl font-bold text-slate-800">
                      {stats?.activeTasks || 0}
                    </div>
                    <div className="text-sm text-slate-600">Active Tasks</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-certificate text-yellow-600 text-xl"></i>
                  </div>
                  <div>
                    <div data-testid="stat-certificates-issued" className="text-2xl font-bold text-slate-800">
                      {stats?.certificatesIssued || 0}
                    </div>
                    <div className="text-sm text-slate-600">Certificates Issued</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Teams Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <i className="fas fa-sitemap text-primary"></i>
                Teams Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {teamOverviews.map((teamData) => (
                  <div key={teamData.team.id} className="border border-slate-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 data-testid={`team-name-${teamData.team.id}`} className="text-lg font-semibold text-slate-800">
                          {teamData.team.teamName}
                        </h3>
                        <p data-testid={`team-admin-${teamData.team.id}`} className="text-sm text-slate-600">
                          Team Head: {teamData.admin?.name || "Unknown"}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div data-testid={`team-member-count-${teamData.team.id}`} className="text-xl font-bold text-primary">
                            {teamData.members.length}
                          </div>
                          <div className="text-xs text-slate-600">Members</div>
                        </div>
                        <div className="text-center">
                          <div data-testid={`team-task-count-${teamData.team.id}`} className="text-xl font-bold text-green-600">
                            {teamData.taskCount}
                          </div>
                          <div className="text-xs text-slate-600">Tasks</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-blue-600">
                            {teamData.taskCount > 0 ? Math.round((teamData.completedTasks / teamData.taskCount) * 100) : 0}%
                          </div>
                          <div className="text-xs text-slate-600">Completed</div>
                        </div>
                      </div>
                    </div>

                    {/* Team Members */}
                    <div className="mb-4">
                      <h4 className="font-medium text-slate-700 mb-3">Team Members:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {teamData.members.map((member) => (
                          <div key={member.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                            <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                              <i className="fas fa-user text-slate-500 text-xs"></i>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p data-testid={`member-name-${member.id}`} className="font-medium text-slate-800 truncate">
                                {member.name}
                              </p>
                              <p className="text-xs text-slate-600 truncate">{member.department}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Progress value={member.progress} className="w-12" />
                              <span data-testid={`member-progress-${member.id}`} className="text-xs text-slate-600">
                                {member.progress}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Task Progress */}
                    {teamData.taskCount > 0 && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-slate-700">Team Task Progress</span>
                          <span className="text-sm text-slate-600">
                            {teamData.completedTasks} / {teamData.taskCount} completed
                          </span>
                        </div>
                        <Progress 
                          value={teamData.taskCount > 0 ? (teamData.completedTasks / teamData.taskCount) * 100 : 0} 
                          className="w-full"
                        />
                      </div>
                    )}
                  </div>
                ))}

                {teamOverviews.length === 0 && (
                  <div className="text-center py-8">
                    <i className="fas fa-users text-slate-400 text-3xl mb-4"></i>
                    <p className="text-slate-600">No teams found in the system.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}