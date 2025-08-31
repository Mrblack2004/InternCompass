import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Certificate, Task } from "@shared/schema";

interface CertificateTabProps {
  userId: string;
}

export default function CertificateTab({ userId }: CertificateTabProps) {
  const { data: certificate, isLoading: certificateLoading } = useQuery<Certificate>({
    queryKey: ["/api/certificates/user", userId],
  });

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks/user", userId],
  });

  if (certificateLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="max-w-2xl mx-auto bg-white rounded-xl h-96"></div>
        </div>
      </div>
    );
  }

  const completedTasks = tasks.filter(t => t.status === "completed").length;
  const totalTasks = tasks.length;
  const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const hasCompletedRequiredTasks = completionPercentage >= 80;

  const requirements = [
    {
      id: "tasks",
      text: "Complete 80% of assigned tasks",
      completed: hasCompletedRequiredTasks,
    },
    {
      id: "meetings",
      text: "Attend all scheduled meetings",
      completed: completionPercentage >= 70, // Simplified calculation
    },
    {
      id: "evaluation",
      text: "Complete final evaluation",
      completed: completionPercentage >= 90,
    },
    {
      id: "approval",
      text: "Supervisor approval",
      completed: hasCompletedRequiredTasks && completionPercentage >= 90,
    },
  ];

  const allRequirementsMet = requirements.every(req => req.completed);

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-certificate text-yellow-600 text-2xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Internship Certificate</h2>
          <p className="text-slate-600">
            Your certificate will be available here once your internship is completed.
          </p>
        </div>

        {/* Certificate Status */}
        <Card>
          <CardContent className="p-8">
            {certificate?.isGenerated ? (
              // Certificate Available
              <div className="text-center">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-certificate text-green-500 text-2xl"></i>
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">
                  Certificate Ready!
                </h3>
                <p className="text-slate-600 mb-6">
                  Congratulations! Your internship certificate is ready for download.
                </p>
                <div className="space-y-4">
                  <Button 
                    size="lg"
                    data-testid="button-download-certificate"
                    asChild
                  >
                    <a href={certificate.certificateUrl || "#"} download>
                      <i className="fas fa-download mr-2"></i>
                      Download Certificate
                    </a>
                  </Button>
                  <Button 
                    variant="outline"
                    size="lg"
                    data-testid="button-view-certificate"
                    asChild
                  >
                    <a href={certificate.certificateUrl || "#"} target="_blank" rel="noopener noreferrer">
                      <i className="fas fa-eye mr-2"></i>
                      View Certificate
                    </a>
                  </Button>
                </div>
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">
                    <i className="fas fa-check-circle mr-2"></i>
                    Issued on: {certificate.issuedDate}
                  </p>
                </div>
              </div>
            ) : (
              // Certificate Pending
              <div className="text-center">
                <div className="mb-6">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                    allRequirementsMet ? "bg-green-50" : "bg-yellow-50"
                  }`}>
                    <i className={`fas ${
                      allRequirementsMet ? "fa-check text-green-500" : "fa-hourglass-half text-yellow-500"
                    } text-2xl`}></i>
                  </div>
                  <h3 data-testid="certificate-status-title" className="text-lg font-semibold text-slate-800 mb-2">
                    {allRequirementsMet ? "Certificate Processing" : "Certificate Pending"}
                  </h3>
                  <p className="text-slate-600 mb-6">
                    {allRequirementsMet 
                      ? "All requirements met! Your certificate will be generated soon."
                      : "Complete all assigned tasks and meet evaluation requirements to receive your certificate."
                    }
                  </p>
                </div>

                {/* Progress Checklist */}
                <div className="text-left max-w-sm mx-auto space-y-3">
                  {requirements.map((requirement) => (
                    <div key={requirement.id} className="flex items-center gap-3">
                      <div 
                        className={`w-5 h-5 rounded-full flex items-center justify-center ${
                          requirement.completed 
                            ? "bg-success" 
                            : "border-2 border-slate-300"
                        }`}
                      >
                        {requirement.completed && (
                          <i className="fas fa-check text-white text-xs"></i>
                        )}
                      </div>
                      <span 
                        data-testid={`requirement-${requirement.id}`}
                        className={`text-sm ${
                          requirement.completed ? "text-slate-700" : "text-slate-500"
                        }`}
                      >
                        {requirement.text}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <i className="fas fa-info-circle mr-2"></i>
                    Progress: {completedTasks} of {totalTasks} tasks completed ({Math.round(completionPercentage)}%)
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
