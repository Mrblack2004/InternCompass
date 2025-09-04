import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Resource, User } from "@shared/schema";

interface ResourcesTabProps {
  userId: string;
}

export default function ResourcesTab({ userId }: ResourcesTabProps) {
  const { data: user } = useQuery<User>({
    queryKey: ["/api/users", userId],
  });

  const { data: resources = [], isLoading } = useQuery<Resource[]>({
    queryKey: ["/api/resources/team", user?.teamId],
    enabled: !!user?.teamId,
  });

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

  const meetingLinks = resources.filter(r => r.type === "meeting_link");
  const documents = resources.filter(r => r.type !== "meeting_link");

  const getResourceIcon = (type: string) => {
    switch (type) {
      case "meeting_link":
        return "fas fa-video";
      case "pdf":
        return "fas fa-file-pdf";
      case "doc":
        return "fas fa-file-word";
      case "note":
        return "fas fa-sticky-note";
      default:
        return "fas fa-file";
    }
  };

  const getResourceColor = (type: string) => {
    switch (type) {
      case "meeting_link":
        return "bg-blue-100 text-blue-800";
      case "pdf":
        return "bg-red-100 text-red-800";
      case "doc":
        return "bg-blue-100 text-blue-800";
      case "note":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Meeting Links */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <i className="fas fa-video text-blue-600"></i>
              Meeting Links
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {meetingLinks.map((resource) => (
                <div key={resource.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex-1">
                    <h4 data-testid={`meeting-title-${resource.id}`} className="font-medium text-slate-800">
                      {resource.title}
                    </h4>
                    {resource.description && (
                      <p className="text-sm text-slate-600 mt-1">{resource.description}</p>
                    )}
                    <p className="text-xs text-slate-500 mt-1">
                      Shared on: {new Date(resource.createdAt!).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getResourceColor(resource.type)}>
                      Meeting Link
                    </Badge>
                    {resource.link ? (
                      <Button 
                        asChild
                        data-testid={`button-join-meeting-${resource.id}`}
                      >
                        <a 
                          href={resource.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center"
                        >
                          <i className="fas fa-video mr-2"></i>Join Meeting
                        </a>
                      </Button>
                    ) : (
                      <Button disabled>
                        <i className="fas fa-video mr-2"></i>Join Meeting
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {meetingLinks.length === 0 && (
                <div className="text-center py-8">
                  <i className="fas fa-video text-slate-400 text-3xl mb-4"></i>
                  <p className="text-slate-600">No meeting links available.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Documents & Resources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <i className="fas fa-folder text-green-600"></i>
              Documents & Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {documents.map((resource) => (
                <div key={resource.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-slate-200">
                      <i className={`${getResourceIcon(resource.type)} text-slate-600`}></i>
                    </div>
                    <div className="flex-1">
                      <h4 data-testid={`resource-title-${resource.id}`} className="font-medium text-slate-800">
                        {resource.title}
                      </h4>
                      {resource.description && (
                        <p className="text-sm text-slate-600 mt-1">{resource.description}</p>
                      )}
                      <p className="text-xs text-slate-500 mt-1">
                        Uploaded on: {new Date(resource.createdAt!).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getResourceColor(resource.type)}>
                      {resource.type.replace('_', ' ').toUpperCase()}
                    </Badge>
                    {resource.fileUrl ? (
                      <Button 
                        asChild
                        variant="outline"
                        size="sm"
                        data-testid={`button-download-${resource.id}`}
                      >
                        <a 
                          href={resource.fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center"
                        >
                          <i className="fas fa-download mr-2"></i>Download
                        </a>
                      </Button>
                    ) : (
                      <Button disabled variant="outline" size="sm">
                        <i className="fas fa-download mr-2"></i>Download
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {documents.length === 0 && (
                <div className="text-center py-8">
                  <i className="fas fa-folder-open text-slate-400 text-3xl mb-4"></i>
                  <p className="text-slate-600">No documents available.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}