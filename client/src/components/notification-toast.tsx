import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface NotificationToastProps {
  message: string;
  type?: "success" | "error" | "warning" | "info";
}

export default function NotificationToast({ message, type = "info" }: NotificationToastProps) {
  const { toast } = useToast();

  useEffect(() => {
    toast({
      title: getTitle(type),
      description: message,
      variant: type === "error" ? "destructive" : "default",
    });
  }, [message, type, toast]);

  return null;
}

function getTitle(type: string) {
  switch (type) {
    case "success":
      return "Success";
    case "error":
      return "Error";
    case "warning":
      return "Warning";
    default:
      return "Notification";
  }
}
