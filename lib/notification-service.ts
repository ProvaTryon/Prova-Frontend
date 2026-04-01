/**
 * 🔔 Notification Service
 * ====================================
 * خدمة الإشعارات
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export type NotificationType = 
  | 'like_post' 
  | 'like_comment' 
  | 'comment_post' 
  | 'comment_design' 
  | 'reply_comment'
  | 'upvote_design'
  | 'design_approved'
  | 'design_in_production'
  | 'design_rejected'
  | 'follow';

export interface Notification {
  _id: string;
  recipient: string;
  sender?: {
    _id: string;
    name: string;
    profileImage?: string;
  };
  type: NotificationType;
  targetType?: 'post' | 'design' | 'comment' | 'user';
  targetId?: string;
  message: string;
  isRead: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  success: boolean;
  data: Notification[];
  meta: {
    total: number;
    unreadCount: number;
    hasMore: boolean;
  };
}

const getAuthHeaders = (): HeadersInit => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.msg || 'Request failed');
  }
  return response.json();
};

// Get notifications
export const getNotifications = async (params?: {
  limit?: number;
  skip?: number;
  unreadOnly?: boolean;
}): Promise<NotificationsResponse> => {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.skip) searchParams.set('skip', params.skip.toString());
  if (params?.unreadOnly) searchParams.set('unreadOnly', 'true');

  const response = await fetch(`${API_URL}/api/notifications?${searchParams}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

// Get unread count
export const getUnreadCount = async (): Promise<{ success: boolean; data: { unreadCount: number } }> => {
  const response = await fetch(`${API_URL}/api/notifications/unread-count`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

// Mark as read
export const markAsRead = async (notificationId: string): Promise<{ success: boolean }> => {
  const response = await fetch(`${API_URL}/api/notifications/${notificationId}/read`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

// Mark all as read
export const markAllAsRead = async (): Promise<{ success: boolean; data: { markedCount: number } }> => {
  const response = await fetch(`${API_URL}/api/notifications/read-all`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};
