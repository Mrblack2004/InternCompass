import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import TaskStatusTracker from "@/components/task-status-tracker";
import type { User, Task, Resource } from "@shared/schema";

interface Stats {
  totalInterns: number;
  totalAdmins: number;
  activeTasks: number;
  totalResources: number;
  certificatesIssued: number;
}

export default function AdminOverview() {
  const teamId = localStorage.getItem("teamId") || "";
  const currentUserId = localStorage.getItem("userId") || "";

  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ["/api/stats"],
  });

  const { data: teamMembers = [] } = useQuery<User[]>({
    queryKey: ["/api/users/team", teamId],
    enabled: !!teamId,
  });

  const { data: recentTasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks/admin", currentUserId],
    enabled: !!currentUserId,
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Admin Dashboard</h2>
          <p className="text-slate-600">Overview of all intern activities and management tools</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                  <i className="fas fa-tasks text-green-600 text-xl"></i>
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
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-folder text-purple-600 text-xl"></i>
                </div>
                <div>
                  <div data-testid="stat-total-resources" className="text-2xl font-bold text-slate-800">
                    {stats?.totalResources || 0}
                  </div>
                  <div className="text-sm text-slate-600">Total Resources</div>
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

        {/* Team Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {teamMembers.filter(member => member.role === "intern").map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                        <i className="fas fa-user text-slate-500 text-xs"></i>
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{member.name}</p>
                        <p className="text-xs text-slate-600">{member.department}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={member.progress} className="w-16" />
                      <span className="text-xs text-slate-600">{member.progress}%</span>
                    </div>
                  </div>
                ))}
                {teamMembers.filter(member => member.role === "intern").length === 0 && (
                  <p className="text-center text-slate-600 py-4">No team members yet.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <TaskStatusTracker teamId={teamId} />

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <i className="fas fa-plus mr-2"></i>
                  Create Task
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <i className="fas fa-upload mr-2"></i>
                  Upload Resource
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <i className="fas fa-calendar mr-2"></i>
                  Schedule Meeting
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <i className="fas fa-user-plus mr-2"></i>
                  Add Team Member
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTasks.slice(0, 3).map((task) => {
                const assignedUser = teamMembers.find(m => m.id === task.assignedTo);
                return (
                  <div key={task.id} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-lg">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      task.status === "completed" ? "bg-green-100" : 
                      task.status === "progress" ? "bg-blue-100" : "bg-yellow-100"
                    }`}>
                      <i className={`fas ${
                        task.status === "completed" ? "fa-check text-green-600" :
                        task.status === "progress" ? "fa-spinner text-blue-600" : "fa-circle text-yellow-600"
                      } text-sm`}></i>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-800">
                        {task.isTeamTask ? "Team task" : assignedUser?.name || "Unknown"} - {task.title}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(task.createdAt!).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })}
              
              {recentTasks.length === 0 && (
                <div className="text-center py-8">
                  <i className="fas fa-history text-slate-400 text-3xl mb-4"></i>
                  <p className="text-slate-600">No recent activities.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
