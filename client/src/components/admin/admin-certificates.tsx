import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Certificate, Intern } from "@shared/schema";

export default function AdminCertificates() {
  const { toast } = useToast();

  const { data: certificates = [], isLoading: certificatesLoading } = useQuery<Certificate[]>({
    queryKey: ["/api/certificates"],
  });

  const { data: interns = [] } = useQuery<Intern[]>({
    queryKey: ["/api/users/team", localStorage.getItem("teamId")],
    enabled: !!localStorage.getItem("teamId"),
  });

  const generateCertificateMutation = useMutation({
    mutationFn: async (certificateId: string) => {
      return apiRequest("PATCH", `/api/certificates/${certificateId}`, {
        isGenerated: true,
        issuedDate: new Date().toISOString().split('T')[0],
        certificateUrl: `/certificates/${certificateId}.pdf`,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/certificates"] });
      toast({
        title: "Certificate generated successfully",
        description: "The intern has been notified.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to generate certificate",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleGenerateCertificate = (certificateId: string) => {
    generateCertificateMutation.mutate(certificateId);
  };

  if (certificatesLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const issuedCertificates = certificates.filter(c => c.isGenerated);
  const pendingCertificates = certificates.filter(c => !c.isGenerated);

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-slate-800">Certificate Management</h2>
          <Button data-testid="button-generate-certificate">
            <i className="fas fa-plus mr-2"></i>Generate Certificate
          </Button>
        </div>

        {/* Certificate Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-certificate text-green-600 text-xl"></i>
                </div>
                <div>
                  <div data-testid="stat-certificates-issued" className="text-2xl font-bold text-slate-800">
                    {issuedCertificates.length}
                  </div>
                  <div className="text-sm text-slate-600">Certificates Issued</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-hourglass-half text-yellow-600 text-xl"></i>
                </div>
                <div>
                  <div data-testid="stat-pending-certificates" className="text-2xl font-bold text-slate-800">
                    {pendingCertificates.length}
                  </div>
                  <div className="text-sm text-slate-600">Pending Certificates</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-download text-blue-600 text-xl"></i>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-800">45</div>
                  <div className="text-sm text-slate-600">Total Downloads</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Certificate Management Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Certificates</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left p-4 font-medium text-slate-700">Intern</th>
                    <th className="text-left p-4 font-medium text-slate-700">Progress</th>
                    <th className="text-left p-4 font-medium text-slate-700">Completion Date</th>
                    <th className="text-left p-4 font-medium text-slate-700">Status</th>
                    <th className="text-left p-4 font-medium text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {certificates.map((certificate) => {
                    const intern = interns.find(i => i.id === certificate.userId);
                    return (
                      <tr key={certificate.id} className="hover:bg-slate-50">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                              <i className="fas fa-user text-slate-500 text-xs"></i>
                            </div>
                            <span data-testid={`certificate-intern-${certificate.id}`} className="font-medium text-slate-800">
                              {intern?.name || "Unknown"}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Progress value={intern?.progress || 0} className="w-16" />
                            <span data-testid={`certificate-progress-${certificate.id}`} className="text-sm text-slate-600">
                              {intern?.progress || 0}%
                            </span>
                          </div>
                        </td>
                        <td data-testid={`certificate-date-${certificate.id}`} className="p-4 text-slate-600">
                          {certificate.issuedDate || "-"}
                        </td>
                        <td className="p-4">
                          <Badge 
                            variant={certificate.isGenerated ? "default" : "secondary"}
                            data-testid={`certificate-status-${certificate.id}`}
                          >
                            {certificate.isGenerated ? "Issued" : "Pending"}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            {certificate.isGenerated ? (
                              <>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  data-testid={`button-download-certificate-${certificate.id}`}
                                >
                                  <i className="fas fa-download text-sm"></i>
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  data-testid={`button-view-certificate-${certificate.id}`}
                                >
                                  <i className="fas fa-eye text-sm"></i>
                                </Button>
                              </>
                            ) : (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleGenerateCertificate(certificate.id)}
                                disabled={generateCertificateMutation.isPending}
                                data-testid={`button-generate-certificate-${certificate.id}`}
                              >
                                <i className="fas fa-certificate text-sm"></i>
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
