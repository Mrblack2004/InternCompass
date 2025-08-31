import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface AttendanceTrackerProps {
  userId: string;
  currentAttendance: number;
}

export default function AttendanceTracker({ userId, currentAttendance }: AttendanceTrackerProps) {
  const [hasMarkedToday, setHasMarkedToday] = useState(false);
  const { toast } = useToast();

  const markAttendanceMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", `/api/users/${userId}/attendance`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", userId] });
      setHasMarkedToday(true);
      toast({
        title: "Attendance marked!",
        description: "Your attendance has been recorded for today.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to mark attendance",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleMarkAttendance = () => {
    markAttendanceMutation.mutate();
  };

  const today = new Date().toLocaleDateString();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <i className="fas fa-calendar-check text-green-600"></i>
          Attendance Tracker
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center p-4 bg-slate-50 rounded-lg">
            <div className="text-2xl font-bold text-slate-800">{currentAttendance}</div>
            <div className="text-sm text-slate-600">Days Present</div>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-slate-600 mb-3">Today: {today}</p>
            <Button
              onClick={handleMarkAttendance}
              disabled={hasMarkedToday || markAttendanceMutation.isPending}
              className={hasMarkedToday ? "bg-green-600" : ""}
              data-testid="button-mark-attendance"
            >
              {hasMarkedToday ? (
                <>
                  <i className="fas fa-check mr-2"></i>
                  Marked Present
                </>
              ) : markAttendanceMutation.isPending ? (
                "Marking..."
              ) : (
                <>
                  <i className="fas fa-calendar-plus mr-2"></i>
                  Mark Attendance
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}