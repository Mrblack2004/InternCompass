import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Notification } from "@shared/schema";

interface NotificationsPanelProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationsPanel({ userId, isOpen, onClose }: NotificationsPanelProps) {
  const { toast } = useToast();

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications/user", userId],
    enabled: !!userId,
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      return apiRequest("PATCH", `/api/notifications/${notificationId}`, { isRead: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/user", userId] });
    },
  });

  const handleMarkAsRead = (notificationId: string) => {
    markAsReadMutation.mutate(notificationId);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "task_assigned":
        return "fas fa-tasks";
      case "resource_uploaded":
        return "fas fa-folder";
      case "meeting_scheduled":
        return "fas fa-calendar";
      case "certificate_ready":
        return "fas fa-certificate";
      default:
        return "fas fa-bell";
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "task_assigned":
        return "text-blue-600";
      case "resource_uploaded":
        return "text-green-600";
      case "meeting_scheduled":
        return "text-purple-600";
      case "certificate_ready":
        return "text-yellow-600";
      default:
        return "text-slate-600";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-end">
      <div className="bg-white w-96 h-full shadow-xl overflow-y-auto">
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800">Notifications</h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <i className="fas fa-times"></i>
            </Button>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border transition-colors ${
                notification.isRead 
                  ? "bg-slate-50 border-slate-200" 
                  : "bg-blue-50 border-blue-200"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  notification.isRead ? "bg-slate-200" : "bg-blue-100"
                }`}>
                  <i className={`${getNotificationIcon(notification.type)} ${getNotificationColor(notification.type)} text-sm`}></i>
                </div>
                <div className="flex-1">
                  <h4 className={`font-medium ${notification.isRead ? "text-slate-700" : "text-slate-900"}`}>
                    {notification.title}
                  </h4>
                  <p className={`text-sm mt-1 ${notification.isRead ? "text-slate-500" : "text-slate-600"}`}>
                    {notification.message}
                  </p>
                  <p className="text-xs text-slate-400 mt-2">
                    {new Date(notification.createdAt!).toLocaleString()}
                  </p>
                  {!notification.isRead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 text-xs"
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      Mark as read
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {notifications.length === 0 && (
            <div className="text-center py-8">
              <i className="fas fa-bell-slash text-slate-400 text-3xl mb-4"></i>
              <p className="text-slate-600">No notifications yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}