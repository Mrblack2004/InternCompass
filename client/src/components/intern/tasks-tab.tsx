import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Task } from "@shared/schema";

interface TasksTabProps {
  userId: string;
}

export default function TasksTab({ userId }: TasksTabProps) {
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks/user", userId],
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: string }) => {
      return apiRequest("PATCH", `/api/tasks/${taskId}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/user", userId] });
      toast({
        title: "Task updated successfully",
        description: "Your task status has been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to update task",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleTaskStatusChange = (taskId: string, currentStatus: string) => {
    let newStatus: string;
    
    switch (currentStatus) {
      case "todo":
        newStatus = "in-progress";
        break;
      case "in-progress":
        newStatus = "completed";
        break;
      case "completed":
        newStatus = "todo";
        break;
      default:
        newStatus = "in-progress";
    }
    
    updateTaskMutation.mutate({ taskId, status: newStatus });
  };

  const filteredTasks = tasks.filter(task => {
    if (statusFilter === "all") return true;
    return task.status === statusFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "todo":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return "fas fa-check";
      case "in-progress":
        return "fas fa-spinner fa-spin";
      case "todo":
        return "fas fa-circle";
      default:
        return "fas fa-circle";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "todo":
        return "To Do";
      case "in-progress":
        return "In Progress";
      case "completed":
        return "Completed";
      default:
        return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl h-32"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="flex gap-2">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("all")}
                data-testid="filter-all"
              >
                All Tasks
              </Button>
              <Button
                variant={statusFilter === "todo" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("todo")}
                data-testid="filter-todo"
              >
                To Do
              </Button>
              <Button
                variant={statusFilter === "progress" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("in-progress")}
                data-testid="filter-progress"
              >
                In Progress
              </Button>
              <Button
                variant={statusFilter === "completed" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("completed")}
                data-testid="filter-completed"
              >
                Completed
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {filteredTasks.map((task) => (
            <Card key={task.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    <button
                      onClick={() => handleTaskStatusChange(task.id, task.status)}
                      disabled={updateTaskMutation.isPending}
                      data-testid={`task-checkbox-${task.id}`}
                      className={`w-5 h-5 border-2 rounded transition-colors ${
                        task.status === "completed"
                          ? "bg-success border-success"
                          : task.status === "in-progress"
                          ? "bg-primary border-primary"
                          : "border-slate-300 hover:border-primary"
                      }`}
                    >
                      <i className={`${getStatusIcon(task.status)} text-white text-xs`}></i>
                    </button>
                  </div>
                  <div className="flex-1">
                    <h3 
                      data-testid={`task-title-${task.id}`}
                      className={`font-semibold text-slate-800 mb-2 ${
                        task.status === "completed" ? "line-through text-slate-500" : ""
                      }`}
                    >
                      {task.title}
                    </h3>
                    <p 
                      data-testid={`task-description-${task.id}`}
                      className="text-slate-600 text-sm mb-3"
                    >
                      {task.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge className={getStatusColor(task.status)}>
                        {getStatusText(task.status)}
                      </Badge>
                      {task.dueDate && (
                        <span className="text-xs text-slate-500">
                          Due: {task.dueDate}
                        </span>
                      )}
                      <Badge className={getPriorityColor(task.priority)}>
                        Priority: {task.priority}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredTasks.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center">
                <i className="fas fa-tasks text-slate-400 text-3xl mb-4"></i>
                <p className="text-slate-600">
                  {statusFilter === "all" 
                    ? "No tasks assigned yet." 
                    : `No ${statusFilter === "todo" ? "to do" : statusFilter === "in-progress" ? "in progress" : statusFilter} tasks.`}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
