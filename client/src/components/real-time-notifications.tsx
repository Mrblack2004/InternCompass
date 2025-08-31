import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { Notification } from "@shared/schema";

interface RealTimeNotificationsProps {
  userId: string;
}

export default function RealTimeNotifications({ userId }: RealTimeNotificationsProps) {
  const { toast } = useToast();

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications/user", userId],
    enabled: !!userId,
    refetchInterval: 5000, // Poll every 5 seconds for new notifications
  });

  useEffect(() => {
    // Show toast for new unread notifications
    const unreadNotifications = notifications.filter(n => !n.isRead);
    
    if (unreadNotifications.length > 0) {
      const latestNotification = unreadNotifications[0];
      
      // Only show toast if this is a very recent notification (within last 10 seconds)
      const notificationTime = new Date(latestNotification.createdAt!).getTime();
      const now = new Date().getTime();
      const timeDiff = now - notificationTime;
      
      if (timeDiff < 10000) { // 10 seconds
        toast({
          title: latestNotification.title,
          description: latestNotification.message,
          duration: 5000,
        });
      }
    }
  }, [notifications, toast]);

  return null; // This component doesn't render anything visible
}