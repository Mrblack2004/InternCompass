import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Stats {
  totalInterns: number;
  activeTasks: number;
  totalMeetings: number;
  certificatesIssued: number;
}

export default function AdminOverview() {
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ["/api/stats"],
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
                  <i className="fas fa-calendar text-purple-600 text-xl"></i>
                </div>
                <div>
                  <div data-testid="stat-total-meetings" className="text-2xl font-bold text-slate-800">
                    {stats?.totalMeetings || 0}
                  </div>
                  <div className="text-sm text-slate-600">Total Meetings</div>
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

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-lg">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-check text-green-600 text-sm"></i>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800">
                    Sarah Johnson completed "Database Schema Design"
                  </p>
                  <p className="text-xs text-slate-500">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-calendar text-blue-600 text-sm"></i>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800">
                    New meeting scheduled for Development Team
                  </p>
                  <p className="text-xs text-slate-500">4 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-lg">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-certificate text-yellow-600 text-sm"></i>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800">
                    Certificate generated for Michael Chen
                  </p>
                  <p className="text-xs text-slate-500">1 day ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
