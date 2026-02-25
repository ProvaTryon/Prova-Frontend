/**
 * 🎧 Support Service
 * ====================================
 * خدمة الدعم الفني - تيكيتات و محادثات المستخدمين مع فريق CS
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function getAuthHeaders() {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

// ==========================================
// Ticket Types
// ==========================================
export interface SupportMessage {
  _id: string;
  senderId: string;
  senderName: string;
  senderRole: 'user' | 'cs';
  content: string;
  createdAt: string;
}

export interface SupportTicket {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  agentId?: string;
  agentName?: string;
  status: 'open' | 'assigned' | 'resolved' | 'closed';
  subject: string;
  priority: 'low' | 'medium' | 'high';
  messages: SupportMessage[];
  lastMessage: string;
  lastMessageAt: string;
  unreadByUser: number;
  unreadByAgent: number;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  open: number;
  assigned: number;
  resolved: number;
  closed: number;
  totalUnread: number;
}

// ==========================================
// User: Create ticket
// ==========================================
export const createTicket = async (data: {
  subject: string;
  message: string;
  priority?: 'low' | 'medium' | 'high';
}): Promise<SupportTicket> => {
  const response = await fetch(`${API_URL}/api/support`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.msg || err.message || 'Failed to create ticket');
  }

  return response.json();
};

// ==========================================
// User: Get my tickets
// ==========================================
export const getMyTickets = async (): Promise<SupportTicket[]> => {
  const response = await fetch(`${API_URL}/api/support/my`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch tickets');
  }

  return response.json();
};

// ==========================================
// Get single ticket with messages
// ==========================================
export const getTicket = async (ticketId: string): Promise<SupportTicket> => {
  const response = await fetch(`${API_URL}/api/support/${ticketId}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch ticket');
  }

  return response.json();
};

// ==========================================
// Send message
// ==========================================
export const sendMessage = async (
  ticketId: string,
  content: string,
): Promise<SupportTicket> => {
  const response = await fetch(`${API_URL}/api/support/${ticketId}/messages`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    throw new Error('Failed to send message');
  }

  return response.json();
};

// ==========================================
// CS: Get all tickets
// ==========================================
export const getAllTickets = async (
  status?: string,
  mine?: boolean,
): Promise<SupportTicket[]> => {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (mine) params.set('mine', 'true');

  const response = await fetch(
    `${API_URL}/api/support/all?${params.toString()}`,
    { headers: getAuthHeaders() },
  );

  if (!response.ok) {
    throw new Error('Failed to fetch tickets');
  }

  return response.json();
};

// ==========================================
// CS: Assign ticket to me
// ==========================================
export const assignTicket = async (
  ticketId: string,
): Promise<SupportTicket> => {
  const response = await fetch(`${API_URL}/api/support/${ticketId}/assign`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to assign ticket');
  }

  return response.json();
};

// ==========================================
// CS: Update ticket status
// ==========================================
export const updateTicketStatus = async (
  ticketId: string,
  status: string,
): Promise<SupportTicket> => {
  const response = await fetch(`${API_URL}/api/support/${ticketId}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error('Failed to update status');
  }

  return response.json();
};

// ==========================================
// CS: Get dashboard stats
// ==========================================
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await fetch(`${API_URL}/api/support/stats`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch stats');
  }

  return response.json();
};
