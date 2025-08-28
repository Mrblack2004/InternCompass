import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { Intern, Task } from "@shared/schema";

interface ProfileTabProps {
  internId: string;
}

export default function ProfileTab({ internId }: ProfileTabProps) {
  const { data: intern, isLoading: internLoading } = useQuery<Intern>({
    queryKey: ["/api/interns", internId],
  });

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks/intern", internId],
  });

  if (internLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="bg-white rounded-xl h-48"></div>
          <div className="bg-white rounded-xl h-64"></div>
        </div>
      </div>
    );
  }

  if (!intern) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-slate-600">Intern not found.</p>
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
                <h3 data-testid="intern-name" className="text-xl font-semibold text-slate-800 mb-1">
                  {intern.name}
                </h3>
                <p data-testid="intern-email" className="text-slate-600 mb-4">
                  {intern.email}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Mobile Number
                    </label>
                    <p data-testid="intern-mobile" className="text-slate-900">
                      {intern.mobileNumber}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Department
                    </label>
                    <p data-testid="intern-department" className="text-slate-900">
                      {intern.department}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Internship Duration
                    </label>
                    <p data-testid="intern-duration" className="text-slate-900">
                      {intern.startDate} to {intern.endDate}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Attendance Days
                    </label>
                    <p data-testid="intern-attendance" className="text-slate-900">
                      {intern.attendanceCount} days
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Progress Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-slate-700">Overall Progress</span>
                  <span data-testid="intern-progress" className="text-slate-600">
                    {intern.progress}%
                  </span>
                </div>
                <Progress value={intern.progress} className="w-full" />
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
                  <div className="text-2xl font-bold text-success">12</div>
                  <div className="text-sm text-slate-600">Meetings Attended</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>


      </div>
    </div>
  );
}
