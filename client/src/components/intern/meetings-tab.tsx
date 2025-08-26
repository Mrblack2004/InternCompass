import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Meeting } from "@shared/schema";

interface MeetingsTabProps {
  internId: string;
}

export default function MeetingsTab({ internId }: MeetingsTabProps) {
  const { data: meetings = [], isLoading } = useQuery<Meeting[]>({
    queryKey: ["/api/meetings/intern", internId],
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

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <h2 className="text-lg font-semibold text-slate-800">Upcoming Meetings</h2>
        </div>

        <div className="space-y-4">
          {meetings.map((meeting) => (
            <Card key={meeting.id}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex-1">
                    <h3 
                      data-testid={`meeting-title-${meeting.id}`}
                      className="font-semibold text-slate-800 mb-2"
                    >
                      {meeting.title}
                    </h3>
                    {meeting.description && (
                      <p 
                        data-testid={`meeting-description-${meeting.id}`}
                        className="text-slate-600 text-sm mb-3"
                      >
                        {meeting.description}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-2">
                        <i className="fas fa-calendar-alt text-slate-400"></i>
                        <span 
                          data-testid={`meeting-date-${meeting.id}`}
                          className="text-sm text-slate-600"
                        >
                          {meeting.date}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <i className="fas fa-clock text-slate-400"></i>
                        <span 
                          data-testid={`meeting-time-${meeting.id}`}
                          className="text-sm text-slate-600"
                        >
                          {meeting.time} - {meeting.duration}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <i className="fas fa-video text-slate-400"></i>
                        <span 
                          data-testid={`meeting-platform-${meeting.id}`}
                          className="text-sm text-slate-600"
                        >
                          {meeting.platform}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {meeting.meetingLink ? (
                      <Button 
                        asChild
                        data-testid={`button-join-meeting-${meeting.id}`}
                      >
                        <a 
                          href={meeting.meetingLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center"
                        >
                          <i className="fas fa-video mr-2"></i>Join Meeting
                        </a>
                      </Button>
                    ) : (
                      <Button 
                        disabled
                        data-testid={`button-join-meeting-${meeting.id}`}
                      >
                        <i className="fas fa-video mr-2"></i>Join Meeting
                      </Button>
                    )}
                    <Button 
                      variant="outline"
                      data-testid={`button-add-calendar-${meeting.id}`}
                    >
                      <i className="fas fa-calendar-plus"></i>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {meetings.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center">
                <i className="fas fa-calendar text-slate-400 text-3xl mb-4"></i>
                <p className="text-slate-600">No upcoming meetings scheduled.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
