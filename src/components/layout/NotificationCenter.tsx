import { useState } from "react";
import { Bell, FileText, AlertTriangle, CheckCircle, Brain, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  type: "upload" | "analysis" | "alert" | "success" | "info";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  link?: string;
}

// Mock notifications - in production these would come from the database
const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "analysis",
    title: "Document Analysis Complete",
    message: "FIR_2018.pdf has been processed. 3 claims and 2 violations extracted.",
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    read: false,
  },
  {
    id: "2",
    type: "alert",
    title: "Compliance Alert",
    message: "New procedural violation detected in Case #2018-CR-001",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    read: false,
  },
  {
    id: "3",
    type: "upload",
    title: "Evidence Uploaded",
    message: "Bank_Statement_2019.pdf uploaded successfully",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    read: true,
  },
  {
    id: "4",
    type: "success",
    title: "Claim Verified",
    message: "Claim #CL-001 has been linked to 3 evidence documents",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
    read: true,
  },
  {
    id: "5",
    type: "info",
    title: "System Update",
    message: "New AI extraction capabilities added for financial documents",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    read: true,
  },
];

const getNotificationIcon = (type: Notification["type"]) => {
  switch (type) {
    case "upload":
      return <FileText className="w-4 h-4 text-sky-500" />;
    case "analysis":
      return <Brain className="w-4 h-4 text-primary" />;
    case "alert":
      return <AlertTriangle className="w-4 h-4 text-destructive" />;
    case "success":
      return <CheckCircle className="w-4 h-4 text-emerald-500" />;
    case "info":
      return <Clock className="w-4 h-4 text-muted-foreground" />;
  }
};

export const NotificationCenter = () => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 relative">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-primary text-primary-foreground text-[10px] font-medium rounded-full flex items-center justify-center animate-pulse">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                {unreadCount} new
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground hover:text-foreground"
              onClick={markAllAsRead}
            >
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Bell className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "flex gap-3 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer group relative",
                    !notification.read && "bg-primary/5"
                  )}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-start gap-2">
                      <p className={cn(
                        "text-sm leading-tight",
                        !notification.read && "font-medium"
                      )}>
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-primary rounded-full shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      dismissNotification(notification.id);
                    }}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="border-t px-4 py-2">
          <Button variant="ghost" size="sm" className="w-full h-8 text-xs text-muted-foreground">
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
