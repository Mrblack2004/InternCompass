import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Certificate, Task } from "@shared/schema";

interface CertificateTabProps {
  internId: string;
}

export default function CertificateTab({ internId }: CertificateTabProps) {
  const { data: certificate, isLoading: certificateLoading } = useQuery<Certificate>({
    queryKey: ["/api/certificates/intern", internId],
  });

  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks/intern", internId],
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
      completed: true, // Simplified for demo
    },
    {
      id: "evaluation",
      text: "Complete final evaluation",
      completed: false,
    },
    {
      id: "approval",
      text: "Supervisor approval",
      completed: false,
    },
  ];

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
                <Button 
                  size="lg"
                  data-testid="button-download-certificate"
                >
                  <i className="fas fa-download mr-2"></i>
                  Download Certificate
                </Button>
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
                  <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-hourglass-half text-yellow-500 text-2xl"></i>
                  </div>
                  <h3 data-testid="certificate-status-title" className="text-lg font-semibold text-slate-800 mb-2">
                    Certificate Pending
                  </h3>
                  <p className="text-slate-600 mb-6">
                    Complete all assigned tasks and meet evaluation requirements to receive your certificate.
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
                    Expected completion: August 30, 2024
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
