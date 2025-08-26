import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Meeting, Intern } from "@shared/schema";

export default function AdminMeetings() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [meetingForm, setMeetingForm] = useState({
    title: "",
    date: "",
    time: "",
    duration: "1 hour",
    platform: "Google Meet",
    attendees: [] as string[],
  });
  const { toast } = useToast();

  const { data: meetings = [], isLoading: meetingsLoading } = useQuery<Meeting[]>({
    queryKey: ["/api/meetings"],
  });

  const { data: interns = [] } = useQuery<Intern[]>({
    queryKey: ["/api/interns"],
  });

  const createMeetingMutation = useMutation({
    mutationFn: async (meetingData: typeof meetingForm) => {
      return apiRequest("POST", "/api/meetings", meetingData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meetings"] });
      setMeetingForm({
        title: "",
        date: "",
        time: "",
        duration: "1 hour",
        platform: "Google Meet",
        attendees: [],
      });
      setShowCreateForm(false);
      toast({
        title: "Meeting scheduled successfully",
        description: "Notifications have been sent to attendees.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to schedule meeting",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleCreateMeeting = () => {
    if (!meetingForm.title || !meetingForm.date || !meetingForm.time) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    createMeetingMutation.mutate(meetingForm);
  };

  if (meetingsLoading) {
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
          <h2 className="text-xl font-semibold text-slate-800">Meeting Management</h2>
          <Button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            data-testid="button-schedule-meeting"
          >
            <i className="fas fa-plus mr-2"></i>Schedule Meeting
          </Button>
        </div>

        {/* Meeting Scheduler */}
        {showCreateForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Schedule New Meeting</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Meeting Title
                  </label>
                  <Input
                    data-testid="input-meeting-title"
                    placeholder="Enter meeting title"
                    value={meetingForm.title}
                    onChange={(e) => setMeetingForm({ ...meetingForm, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Date
                  </label>
                  <Input
                    data-testid="input-meeting-date"
                    type="date"
                    value={meetingForm.date}
                    onChange={(e) => setMeetingForm({ ...meetingForm, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Time
                  </label>
                  <Input
                    data-testid="input-meeting-time"
                    type="time"
                    value={meetingForm.time}
                    onChange={(e) => setMeetingForm({ ...meetingForm, time: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Platform
                  </label>
                  <Select 
                    value={meetingForm.platform} 
                    onValueChange={(value) => setMeetingForm({ ...meetingForm, platform: value })}
                  >
                    <SelectTrigger data-testid="select-platform">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Google Meet">Google Meet</SelectItem>
                      <SelectItem value="Zoom">Zoom</SelectItem>
                      <SelectItem value="Microsoft Teams">Microsoft Teams</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Duration
                  </label>
                  <Select 
                    value={meetingForm.duration} 
                    onValueChange={(value) => setMeetingForm({ ...meetingForm, duration: value })}
                  >
                    <SelectTrigger data-testid="select-duration">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30 minutes">30 minutes</SelectItem>
                      <SelectItem value="1 hour">1 hour</SelectItem>
                      <SelectItem value="1.5 hours">1.5 hours</SelectItem>
                      <SelectItem value="2 hours">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Attendees
                  </label>
                  <Select 
                    value={meetingForm.attendees[0] || ""} 
                    onValueChange={(value) => {
                      if (value === "all") {
                        setMeetingForm({ ...meetingForm, attendees: interns.map(i => i.id) });
                      } else {
                        setMeetingForm({ ...meetingForm, attendees: [value] });
                      }
                    }}
                  >
                    <SelectTrigger data-testid="select-attendees">
                      <SelectValue placeholder="Select attendees" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Interns</SelectItem>
                      {interns.map((intern) => (
                        <SelectItem key={intern.id} value={intern.id}>
                          {intern.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <Button 
                  onClick={handleCreateMeeting}
                  disabled={createMeetingMutation.isPending}
                  data-testid="button-create-meeting"
                >
                  {createMeetingMutation.isPending ? "Scheduling..." : "Schedule Meeting"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Scheduled Meetings */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Meetings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {meetings.map((meeting) => (
                <div 
                  key={meeting.id} 
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                >
                  <div className="flex-1">
                    <h4 data-testid={`meeting-title-${meeting.id}`} className="font-medium text-slate-800">
                      {meeting.title}
                    </h4>
                    <p className="text-sm text-slate-600 mt-1">
                      {meeting.date} • {meeting.time} - {meeting.duration} • {meeting.platform}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Attendees: {meeting.attendees?.length || 0} interns
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      data-testid={`button-edit-meeting-${meeting.id}`}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      data-testid={`button-cancel-meeting-${meeting.id}`}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
