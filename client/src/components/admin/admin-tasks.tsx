import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Task, Intern } from "@shared/schema";

export default function AdminTasks() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    assignedTo: "",
    dueDate: "",
    isTeamTask: false,
  });
  const { toast } = useToast();
  const currentUserId = localStorage.getItem("userId") || "";
  const teamId = localStorage.getItem("teamId") || "";

  const { data: tasks = [], isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks/admin", currentUserId],
    enabled: !!currentUserId,
  });

  const { data: interns = [] } = useQuery<User[]>({
    queryKey: ["/api/users/team", teamId],
    enabled: !!teamId,
  });

  const createTaskMutation = useMutation({
    mutationFn: async (taskData: typeof taskForm) => {
      return apiRequest("POST", "/api/tasks", {
        ...taskData,
        assignedBy: currentUserId,
        teamId: teamId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/admin", currentUserId] });
      setTaskForm({ title: "", description: "", priority: "medium", assignedTo: "", dueDate: "", isTeamTask: false });
      setShowCreateForm(false);
      toast({
        title: "Task created successfully",
        description: "The task has been assigned to the intern.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to create task",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleCreateTask = () => {
    if (!taskForm.title || !taskForm.description) {
      toast({
        title: "Missing required fields",
        description: "Please fill in title and description.",
        variant: "destructive",
      });
      return;
    }
    
    if (!taskForm.isTeamTask && !taskForm.assignedTo) {
      toast({
        title: "Assignment required",
        description: "Please either assign to someone or mark as team task.",
        variant: "destructive",
      });
      return;
    }
    
    createTaskMutation.mutate(taskForm);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "progress":
        return "bg-blue-100 text-blue-800";
      case "todo":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  if (tasksLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-48"></div>
          <div className="bg-white rounded-xl h-96"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-slate-800">Task Management</h2>
          <div className="flex gap-3">
            <Button variant="outline" data-testid="button-bulk-assign">
              <i className="fas fa-users mr-2"></i>Bulk Assign
            </Button>
            <Button 
              onClick={() => setShowCreateForm(!showCreateForm)}
              data-testid="button-new-task"
            >
              <i className="fas fa-plus mr-2"></i>New Task
            </Button>
          </div>
        </div>

        {/* Task Creation Form */}
        {showCreateForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create New Task</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Task Title
                  </label>
                  <Input
                    data-testid="input-task-title"
                    placeholder="Enter task title"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Assignment
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        id="individual-task"
                        name="taskType"
                        checked={!taskForm.isTeamTask}
                        onChange={() => setTaskForm({ ...taskForm, isTeamTask: false, assignedTo: "" })}
                      />
                      <label htmlFor="individual-task" className="text-sm">Individual Task</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        id="team-task"
                        name="taskType"
                        checked={taskForm.isTeamTask}
                        onChange={() => setTaskForm({ ...taskForm, isTeamTask: true, assignedTo: "" })}
                      />
                      <label htmlFor="team-task" className="text-sm">Team Task</label>
                    </div>
                    {!taskForm.isTeamTask && (
                      <Select 
                        value={taskForm.assignedTo} 
                        onValueChange={(value) => setTaskForm({ ...taskForm, assignedTo: value })}
                      >
                        <SelectTrigger data-testid="select-assign-to">
                          <SelectValue placeholder="Select intern" />
                        </SelectTrigger>
                        <SelectContent>
                          {interns.filter(user => user.role === "intern").map((intern) => (
                            <SelectItem key={intern.id} value={intern.id}>
                              {intern.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Priority
                  </label>
                  <Select 
                    value={taskForm.priority} 
                    onValueChange={(value) => setTaskForm({ ...taskForm, priority: value })}
                  >
                    <SelectTrigger data-testid="select-priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Due Date
                  </label>
                  <Input
                    data-testid="input-due-date"
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                  />
                </div>
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Description
                  </label>
                  <Textarea
                    data-testid="textarea-task-description"
                    rows={3}
                    placeholder="Enter task description"
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <Button 
                  onClick={handleCreateTask}
                  disabled={createTaskMutation.isPending}
                  data-testid="button-create-task"
                >
                  {createTaskMutation.isPending ? "Creating..." : "Create Task"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>All Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tasks.map((task) => {
                const assignedIntern = interns.find(intern => intern.id === task.assignedTo);
                return (
                  <div 
                    key={task.id} 
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 data-testid={`task-title-${task.id}`} className="font-medium text-slate-800">
                        {task.title}
                      </h4>
                      <p className="text-sm text-slate-600 mt-1">
                        {task.isTeamTask ? "Team Task" : `Assigned to: ${assignedIntern?.name || "Unknown"}`} • Due: {task.dueDate || "No due date"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(task.status)}>
                        {task.status === "todo" ? "To Do" : 
                         task.status === "progress" ? "In Progress" : 
                         task.status === "completed" ? "Completed" : task.status}
                      </Badge>
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        data-testid={`button-edit-task-${task.id}`}
                      >
                        <i className="fas fa-edit text-sm"></i>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
