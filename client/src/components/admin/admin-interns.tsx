import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { Intern } from "@shared/schema";

export default function AdminInterns() {
  const { data: interns = [], isLoading } = useQuery<Intern[]>({
    queryKey: ["/api/interns"],
  });

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
          <h2 className="text-xl font-semibold text-slate-800">All Interns</h2>
          <Button data-testid="button-add-intern">
            <i className="fas fa-plus mr-2"></i>Add Intern
          </Button>
        </div>

        {/* Interns Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left p-4 font-medium text-slate-700">Name</th>
                    <th className="text-left p-4 font-medium text-slate-700">Email</th>
                    <th className="text-left p-4 font-medium text-slate-700">Department</th>
                    <th className="text-left p-4 font-medium text-slate-700">Progress</th>
                    <th className="text-left p-4 font-medium text-slate-700">Status</th>
                    <th className="text-left p-4 font-medium text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {interns.map((intern) => (
                    <tr key={intern.id} className="hover:bg-slate-50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                            <i className="fas fa-user text-slate-500 text-xs"></i>
                          </div>
                          <span data-testid={`intern-name-${intern.id}`} className="font-medium text-slate-800">
                            {intern.name}
                          </span>
                        </div>
                      </td>
                      <td data-testid={`intern-email-${intern.id}`} className="p-4 text-slate-600">
                        {intern.email}
                      </td>
                      <td data-testid={`intern-department-${intern.id}`} className="p-4 text-slate-600">
                        {intern.department}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Progress value={intern.progress} className="w-16" />
                          <span data-testid={`intern-progress-${intern.id}`} className="text-sm text-slate-600">
                            {intern.progress}%
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge 
                          variant={intern.isActive ? "default" : "secondary"}
                          data-testid={`intern-status-${intern.id}`}
                        >
                          {intern.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            data-testid={`button-view-intern-${intern.id}`}
                          >
                            <i className="fas fa-eye text-sm"></i>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            data-testid={`button-edit-intern-${intern.id}`}
                          >
                            <i className="fas fa-edit text-sm"></i>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
