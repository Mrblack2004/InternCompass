import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import AttendanceTracker from "@/components/attendance-tracker";
import type { Intern, Task } from "@shared/schema";

interface ProfileTabProps {
  userId: string;
}

export default function ProfileTab({ userId }: ProfileTabProps) {
  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ["/api/users", userId],
  });

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks/user", userId],
  });

  if (userLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="bg-white rounded-xl h-48"></div>
          <div className="bg-white rounded-xl h-64"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-slate-600">User not found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const completedTasks = tasks.filter(t => t.status === "completed").length;
  const activeTasks = tasks.filter(t => t.status !== "completed").length;

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center">
                  <i className="fas fa-user text-slate-500 text-2xl"></i>
                </div>
              </div>
              <div className="flex-1">
                <h3 data-testid="user-name" className="text-xl font-semibold text-slate-800 mb-1">
                  {user.name}
                </h3>
                <p data-testid="user-email" className="text-slate-600 mb-4">
                  {user.email}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Mobile Number
                    </label>
                    <p data-testid="user-mobile" className="text-slate-900">
                      {user.mobileNumber || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Department
                    </label>
                    <p data-testid="user-department" className="text-slate-900">
                      {user.department || "Not assigned"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Internship Duration
                    </label>
                    <p data-testid="user-duration" className="text-slate-900">
                      {user.startDate || "Not set"} to {user.endDate || "Not set"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Attendance Days
                    </label>
                    <p data-testid="user-attendance" className="text-slate-900">
                      {user.attendanceCount} days
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Progress Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium text-slate-700">Overall Progress</span>
                      <span data-testid="user-progress" className="text-slate-600">
                        {user.progress}%
                      </span>
                    </div>
                    <Progress value={user.progress} className="w-full" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="text-center p-4 bg-slate-50 rounded-lg">
                      <div data-testid="stat-completed-tasks" className="text-2xl font-bold text-primary">
                        {completedTasks}
                      </div>
                      <div className="text-sm text-slate-600">Tasks Completed</div>
                    </div>
                    <div className="text-center p-4 bg-slate-50 rounded-lg">
                      <div data-testid="stat-active-tasks" className="text-2xl font-bold text-warning">
                        {activeTasks}
                      </div>
                      <div className="text-sm text-slate-600">Active Tasks</div>
                    </div>
                    <div className="text-center p-4 bg-slate-50 rounded-lg">
                      <div className="text-2xl font-bold text-success">{user.attendanceCount}</div>
                      <div className="text-sm text-slate-600">Days Present</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <AttendanceTracker userId={user.id} currentAttendance={user.attendanceCount} />
          </div>
        </div>


      </div>
    </div>
  );
}
