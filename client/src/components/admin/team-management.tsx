import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { User } from "@shared/schema";

export default function TeamManagement() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [memberForm, setMemberForm] = useState({
    username: "",
    password: "",
    name: "",
    email: "",
    mobileNumber: "",
    department: "",
    startDate: "",
    endDate: "",
  });
  const { toast } = useToast();
  const teamId = localStorage.getItem("teamId") || "";

  const { data: teamMembers = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/users/team", teamId],
    enabled: !!teamId,
  });

  const addMemberMutation = useMutation({
    mutationFn: async (memberData: typeof memberForm) => {
      return apiRequest("POST", "/api/users", {
        ...memberData,
        role: "intern",
        teamId: teamId,
        progress: 0,
        isActive: true,
        attendanceCount: 0,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/team", teamId] });
      setMemberForm({
        username: "",
        password: "",
        name: "",
        email: "",
        mobileNumber: "",
        department: "",
        startDate: "",
        endDate: "",
      });
      setShowAddForm(false);
      toast({
        title: "Team member added successfully",
        description: "The new intern has been added to your team.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to add team member",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleAddMember = () => {
    if (!memberForm.username || !memberForm.password || !memberForm.name || !memberForm.email) {
      toast({
        title: "Missing required fields",
        description: "Please fill in username, password, name, and email.",
        variant: "destructive",
      });
      return;
    }
    addMemberMutation.mutate(memberForm);
  };

  const interns = teamMembers.filter(member => member.role === "intern");

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-48 mb-6"></div>
          <div className="bg-white rounded-xl h-96"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-slate-800">Team Management</h2>
          <Button 
            onClick={() => setShowAddForm(!showAddForm)}
            data-testid="button-add-member"
          >
            <i className="fas fa-plus mr-2"></i>Add Team Member
          </Button>
        </div>

        {/* Add Member Form */}
        {showAddForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Add New Team Member</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Username *
                  </label>
                  <Input
                    data-testid="input-username"
                    placeholder="Enter username"
                    value={memberForm.username}
                    onChange={(e) => setMemberForm({ ...memberForm, username: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Password *
                  </label>
                  <Input
                    data-testid="input-password"
                    type="password"
                    placeholder="Enter password"
                    value={memberForm.password}
                    onChange={(e) => setMemberForm({ ...memberForm, password: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Full Name *
                  </label>
                  <Input
                    data-testid="input-name"
                    placeholder="Enter full name"
                    value={memberForm.name}
                    onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email *
                  </label>
                  <Input
                    data-testid="input-email"
                    type="email"
                    placeholder="Enter email address"
                    value={memberForm.email}
                    onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Mobile Number
                  </label>
                  <Input
                    data-testid="input-mobile"
                    placeholder="+1234567890"
                    value={memberForm.mobileNumber}
                    onChange={(e) => setMemberForm({ ...memberForm, mobileNumber: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Department
                  </label>
                  <Input
                    data-testid="input-department"
                    placeholder="Enter department"
                    value={memberForm.department}
                    onChange={(e) => setMemberForm({ ...memberForm, department: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Start Date
                  </label>
                  <Input
                    data-testid="input-start-date"
                    type="date"
                    value={memberForm.startDate}
                    onChange={(e) => setMemberForm({ ...memberForm, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    End Date
                  </label>
                  <Input
                    data-testid="input-end-date"
                    type="date"
                    value={memberForm.endDate}
                    onChange={(e) => setMemberForm({ ...memberForm, endDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <Button 
                  onClick={handleAddMember}
                  disabled={addMemberMutation.isPending}
                  data-testid="button-save-member"
                >
                  {addMemberMutation.isPending ? "Adding..." : "Add Member"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Team Members List */}
        <Card>
          <CardHeader>
            <CardTitle>Team Members ({interns.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {interns.map((intern) => (
                <div key={intern.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                      <i className="fas fa-user text-slate-500"></i>
                    </div>
                    <div className="flex-1">
                      <h4 data-testid={`member-name-${intern.id}`} className="font-medium text-slate-800">
                        {intern.name}
                      </h4>
                      <p className="text-sm text-slate-600">{intern.email}</p>
                      <p className="text-xs text-slate-500">{intern.department}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="flex items-center gap-2">
                        <Progress value={intern.progress} className="w-16" />
                        <span data-testid={`member-progress-${intern.id}`} className="text-sm text-slate-600">
                          {intern.progress}%
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Progress</p>
                    </div>
                    <Badge variant={intern.isActive ? "default" : "secondary"}>
                      {intern.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        data-testid={`button-edit-member-${intern.id}`}
                      >
                        <i className="fas fa-edit text-sm"></i>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        data-testid={`button-view-member-${intern.id}`}
                      >
                        <i className="fas fa-eye text-sm"></i>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {interns.length === 0 && (
                <div className="text-center py-8">
                  <i className="fas fa-users text-slate-400 text-3xl mb-4"></i>
                  <p className="text-slate-600">No team members yet. Add your first intern!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}