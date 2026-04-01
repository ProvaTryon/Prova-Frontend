'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import Link from 'next/link';
import {
  Bell,
  Heart,
  MessageCircle,
  ThumbsUp,
  CheckCircle,
  Factory,
  XCircle,
  UserPlus,
  Check,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  Notification,
  NotificationType,
} from '@/lib/notification-service';
import { cn } from '@/lib/utils';

const notificationIcons: Record<NotificationType, typeof Heart> = {
  like_post: Heart,
  like_comment: Heart,
  comment_post: MessageCircle,
  comment_design: MessageCircle,
  reply_comment: MessageCircle,
  upvote_design: ThumbsUp,
  design_approved: CheckCircle,
  design_in_production: Factory,
  design_rejected: XCircle,
  follow: UserPlus,
};

const notificationColors: Record<NotificationType, string> = {
  like_post: 'text-red-500',
  like_comment: 'text-red-500',
  comment_post: 'text-blue-500',
  comment_design: 'text-blue-500',
  reply_comment: 'text-blue-500',
  upvote_design: 'text-green-500',
  design_approved: 'text-green-500',
  design_in_production: 'text-purple-500',
  design_rejected: 'text-red-500',
  follow: 'text-primary',
};

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const loadUnreadCount = useCallback(async () => {
    try {
      const response = await getUnreadCount();
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getNotifications({ limit: 10 });
      setNotifications(response.data);
      setUnreadCount(response.meta.unreadCount);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUnreadCount();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [loadUnreadCount]);

  useEffect(() => {
    if (open) {
      loadNotifications();
    }
  }, [open, loadNotifications]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const getNotificationLink = (notification: Notification): string => {
    if (!notification.targetType || !notification.targetId) return '#';
    
    switch (notification.targetType) {
      case 'post':
        return `/community/posts/${notification.targetId}`;
      case 'design':
        return `/community/designs/${notification.targetId}`;
      case 'user':
        return `/profile/${notification.targetId}`;
      default:
        return '#';
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
              variant="destructive"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-4 py-2 border-b">
          <h3 className="font-semibold">الإشعارات</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
              <Check className="h-4 w-4 mr-1" />
              قراءة الكل
            </Button>
          )}
        </div>
        <ScrollArea className="h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>لا توجد إشعارات</p>
            </div>
          ) : (
            notifications.map((notification) => {
              const Icon = notificationIcons[notification.type];
              const iconColor = notificationColors[notification.type];
              const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
                addSuffix: true,
                locale: ar,
              });

              return (
                <DropdownMenuItem
                  key={notification._id}
                  asChild
                  className={cn(
                    'flex items-start gap-3 p-3 cursor-pointer',
                    !notification.isRead && 'bg-primary/5'
                  )}
                >
                  <Link
                    href={getNotificationLink(notification)}
                    onClick={() => !notification.isRead && handleMarkAsRead(notification._id)}
                  >
                    <div className="relative">
                      {notification.sender ? (
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={notification.sender.profileImage} />
                          <AvatarFallback>{notification.sender.name[0]}</AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Icon className={cn('h-5 w-5', iconColor)} />
                        </div>
                      )}
                      {notification.sender && (
                        <div
                          className={cn(
                            'absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-background flex items-center justify-center',
                            iconColor
                          )}
                        >
                          <Icon className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm line-clamp-2">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{timeAgo}</p>
                    </div>
                    {!notification.isRead && (
                      <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                    )}
                  </Link>
                </DropdownMenuItem>
              );
            })
          )}
        </ScrollArea>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="justify-center">
          <Link href="/notifications" className="text-primary">
            عرض كل الإشعارات
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
