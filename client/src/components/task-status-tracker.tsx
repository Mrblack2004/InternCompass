import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { Task, User } from "@shared/schema";

interface TaskStatusTrackerProps {
  teamId: string;
}

export default function TaskStatusTracker({ teamId }: TaskStatusTrackerProps) {
  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks/team", teamId],
    enabled: !!teamId,
  });

  const { data: teamMembers = [] } = useQuery<User[]>({
    queryKey: ["/api/users/team", teamId],
    enabled: !!teamId,
  });

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === "completed").length;
  const inProgressTasks = tasks.filter(t => t.status === "in-progress").length;
  const todoTasks = tasks.filter(t => t.status === "todo").length;

  const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <i className="fas fa-chart-line text-primary"></i>
          Task Progress Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Overall Progress */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium text-slate-700">Team Progress</span>
              <span className="text-slate-600">{Math.round(completionPercentage)}%</span>
            </div>
            <Progress value={completionPercentage} className="w-full" />
          </div>

          {/* Task Status Breakdown */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-xl font-bold text-green-600">{completedTasks}</div>
              <div className="text-xs text-green-700">Completed</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-xl font-bold text-blue-600">{inProgressTasks}</div>
              <div className="text-xs text-blue-700">In Progress</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-xl font-bold text-yellow-600">{todoTasks}</div>
              <div className="text-xs text-yellow-700">To Do</div>
            </div>
          </div>

          {/* Individual Progress */}
          <div>
            <h4 className="font-medium text-slate-700 mb-3">Individual Progress</h4>
            <div className="space-y-2">
              {teamMembers.filter(member => member.role === "intern").map((intern) => {
                const internTasks = tasks.filter(t => t.assignedTo === intern.id || t.isTeamTask);
                const internCompleted = internTasks.filter(t => t.status === "completed").length;
                const internProgress = internTasks.length > 0 ? (internCompleted / internTasks.length) * 100 : 0;

                return (
                  <div key={intern.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                        <i className="fas fa-user text-slate-500 text-xs"></i>
                      </div>
                      <span className="font-medium text-slate-800">{intern.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Progress value={internProgress} className="w-20" />
                      <span className="text-sm text-slate-600 w-12 text-right">
                        {Math.round(internProgress)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}