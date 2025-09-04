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
import type { Resource } from "@shared/schema";

export default function AdminResources() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [resourceForm, setResourceForm] = useState({
    title: "",
    description: "",
    type: "note",
    link: "",
    fileUrl: "",
  });
  const { toast } = useToast();
  const currentUserId = localStorage.getItem("userId") || "";
  const teamId = localStorage.getItem("teamId") || "";

  const { data: resources = [], isLoading } = useQuery<Resource[]>({
    queryKey: ["/api/resources/team", teamId],
    enabled: !!teamId,
  });

  const createResourceMutation = useMutation({
    mutationFn: async (resourceData: typeof resourceForm) => {
      return apiRequest("POST", "/api/resources", {
        ...resourceData,
        uploadedBy: currentUserId,
        teamId: teamId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resources/team", teamId] });
      setResourceForm({ title: "", description: "", type: "note", link: "", fileUrl: "" });
      setShowCreateForm(false);
      toast({
        title: "Resource uploaded successfully",
        description: "Team members have been notified.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to upload resource",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleCreateResource = () => {
    if (!resourceForm.title) {
      toast({
        title: "Missing required fields",
        description: "Please enter a title for the resource.",
        variant: "destructive",
      });
      return;
    }

    if (resourceForm.type === "meeting_link" && !resourceForm.link) {
      toast({
        title: "Missing meeting link",
        description: "Please enter a meeting link.",
        variant: "destructive",
      });
      return;
    }

    if (resourceForm.type !== "meeting_link" && !resourceForm.fileUrl) {
      toast({
        title: "Missing file URL",
        description: "Please enter a file URL for the document.",
        variant: "destructive",
      });
      return;
    }
    
    createResourceMutation.mutate(resourceForm);
  };

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

  if (isLoading) {
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
          <h2 className="text-xl font-semibold text-slate-800">Resource Management</h2>
          <Button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            data-testid="button-new-resource"
          >
            <i className="fas fa-plus mr-2"></i>Upload Resource
          </Button>
        </div>

        {/* Resource Upload Form */}
        {showCreateForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Upload New Resource</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Resource Title
                  </label>
                  <Input
                    data-testid="input-resource-title"
                    placeholder="Enter resource title"
                    value={resourceForm.title}
                    onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Resource Type
                  </label>
                  <Select 
                    value={resourceForm.type} 
                    onValueChange={(value) => setResourceForm({ ...resourceForm, type: value })}
                  >
                    <SelectTrigger data-testid="select-resource-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="meeting_link">Meeting Link</SelectItem>
                      <SelectItem value="pdf">PDF Document</SelectItem>
                      <SelectItem value="doc">Word Document</SelectItem>
                      <SelectItem value="note">Note/Text</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {resourceForm.type === "meeting_link" ? (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Meeting Link
                    </label>
                    <Input
                      data-testid="input-meeting-link"
                      placeholder="https://meet.google.com/..."
                      value={resourceForm.link}
                      onChange={(e) => setResourceForm({ ...resourceForm, link: e.target.value })}
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      File URL
                    </label>
                    <Input
                      data-testid="input-file-url"
                      placeholder="/documents/filename.pdf"
                      value={resourceForm.fileUrl}
                      onChange={(e) => setResourceForm({ ...resourceForm, fileUrl: e.target.value })}
                    />
                  </div>
                )}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Description
                  </label>
                  <Textarea
                    data-testid="textarea-resource-description"
                    rows={3}
                    placeholder="Enter resource description"
                    value={resourceForm.description}
                    onChange={(e) => setResourceForm({ ...resourceForm, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <Button 
                  onClick={handleCreateResource}
                  disabled={createResourceMutation.isPending}
                  data-testid="button-upload-resource"
                >
                  {createResourceMutation.isPending ? "Uploading..." : "Upload Resource"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Resources List */}
        <Card>
          <CardHeader>
            <CardTitle>Team Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {resources.map((resource) => (
                <div 
                  key={resource.id} 
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                >
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
                        Uploaded: {new Date(resource.createdAt!).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getResourceColor(resource.type)}>
                      {resource.type.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      data-testid={`button-edit-resource-${resource.id}`}
                    >
                      <i className="fas fa-edit text-sm"></i>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      data-testid={`button-delete-resource-${resource.id}`}
                    >
                      <i className="fas fa-trash text-sm text-red-500"></i>
                    </Button>
                  </div>
                </div>
              ))}

              {resources.length === 0 && (
                <div className="text-center py-8">
                  <i className="fas fa-folder-open text-slate-400 text-3xl mb-4"></i>
                  <p className="text-slate-600">No resources uploaded yet.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}