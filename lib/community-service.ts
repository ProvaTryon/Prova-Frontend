/**
 * 🏘️ Community Service
 * ====================================
 * خدمة الكوميونتي - البوستات والتصاميم والتعليقات والتصويتات
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ==========================================
// 📦 Type Definitions
// ==========================================

export type PostType = 'issue' | 'review' | 'tip' | 'question';
export type DesignCategory = 'tshirt' | 'hoodie' | 'pants' | 'jacket' | 'dress' | 'accessories' | 'other';
export type DesignStatus = 'pending' | 'approved' | 'in_production' | 'published' | 'rejected';
export type VoteType = 'like' | 'upvote' | 'downvote';

export interface Author {
  _id: string;
  name: string;
  profileImage?: string;
  role: string;
}

export interface Post {
  _id: string;
  author: Author;
  type: PostType;
  title: string;
  content: string;
  images?: string[];
  store?: Author;
  rating?: number;
  likesCount: number;
  commentsCount: number;
  userVote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Design {
  _id: string;
  designer: Author;
  title: string;
  description: string;
  images: string[];
  category: DesignCategory;
  tags?: string[];
  upvotesCount: number;
  downvotesCount: number;
  commentsCount: number;
  status: DesignStatus;
  userVote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  author: Author;
  targetType: 'post' | 'design';
  targetId: string;
  parentId?: string;
  content: string;
  likesCount: number;
  repliesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostPayload {
  type: PostType;
  title: string;
  content: string;
  images?: string[];
  store?: string;
  rating?: number;
}

export interface CreateDesignPayload {
  title: string;
  description: string;
  images: string[];
  category: DesignCategory;
  tags?: string[];
}

export interface CreateCommentPayload {
  targetType: 'post' | 'design';
  targetId: string;
  parentId?: string;
  content: string;
}

export interface VotePayload {
  targetType: 'post' | 'design' | 'comment';
  targetId: string;
  voteType: VoteType;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    total: number;
    hasMore: boolean;
  };
}

// ==========================================
// 🔧 Helper Functions
// ==========================================

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
  const data = await response.json();
  return data;
};

// ==========================================
// 📝 Post API
// ==========================================

export const getPosts = async (params?: {
  type?: PostType;
  author?: string;
  store?: string;
  sortBy?: 'newest' | 'popular' | 'most_commented';
  limit?: number;
  skip?: number;
}): Promise<PaginatedResponse<Post>> => {
  const searchParams = new URLSearchParams();
  if (params?.type) searchParams.set('type', params.type);
  if (params?.author) searchParams.set('author', params.author);
  if (params?.store) searchParams.set('store', params.store);
  if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.skip) searchParams.set('skip', params.skip.toString());

  const response = await fetch(`${API_URL}/api/community/posts?${searchParams}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const getPost = async (id: string): Promise<{ success: boolean; data: Post }> => {
  const response = await fetch(`${API_URL}/api/community/posts/${id}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const createPost = async (payload: CreatePostPayload): Promise<{ success: boolean; data: Post }> => {
  const response = await fetch(`${API_URL}/api/community/posts`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

export const updatePost = async (
  id: string,
  payload: Partial<CreatePostPayload>
): Promise<{ success: boolean; data: Post }> => {
  const response = await fetch(`${API_URL}/api/community/posts/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

export const deletePost = async (id: string): Promise<{ success: boolean }> => {
  const response = await fetch(`${API_URL}/api/community/posts/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

// ==========================================
// 🎨 Design API
// ==========================================

export const getDesigns = async (params?: {
  category?: DesignCategory;
  status?: DesignStatus;
  designer?: string;
  sortBy?: 'newest' | 'popular' | 'trending';
  limit?: number;
  skip?: number;
}): Promise<PaginatedResponse<Design>> => {
  const searchParams = new URLSearchParams();
  if (params?.category) searchParams.set('category', params.category);
  if (params?.status) searchParams.set('status', params.status);
  if (params?.designer) searchParams.set('designer', params.designer);
  if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.skip) searchParams.set('skip', params.skip.toString());

  const response = await fetch(`${API_URL}/api/community/designs?${searchParams}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const getTopDesigns = async (limit = 10): Promise<{ success: boolean; data: Design[] }> => {
  const response = await fetch(`${API_URL}/api/community/designs/spotlight?limit=${limit}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const getDesign = async (id: string): Promise<{ success: boolean; data: Design }> => {
  const response = await fetch(`${API_URL}/api/community/designs/${id}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const createDesign = async (payload: CreateDesignPayload): Promise<{ success: boolean; data: Design }> => {
  const response = await fetch(`${API_URL}/api/community/designs`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

export const updateDesign = async (
  id: string,
  payload: Partial<CreateDesignPayload>
): Promise<{ success: boolean; data: Design }> => {
  const response = await fetch(`${API_URL}/api/community/designs/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

export const deleteDesign = async (id: string): Promise<{ success: boolean }> => {
  const response = await fetch(`${API_URL}/api/community/designs/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

// ==========================================
// 💬 Comment API
// ==========================================

export const getComments = async (params: {
  targetType: 'post' | 'design';
  targetId: string;
  parentId?: string;
  limit?: number;
  skip?: number;
}): Promise<PaginatedResponse<Comment>> => {
  const searchParams = new URLSearchParams();
  searchParams.set('targetType', params.targetType);
  searchParams.set('targetId', params.targetId);
  if (params.parentId) searchParams.set('parentId', params.parentId);
  if (params.limit) searchParams.set('limit', params.limit.toString());
  if (params.skip) searchParams.set('skip', params.skip.toString());

  const response = await fetch(`${API_URL}/api/community/comments?${searchParams}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

export const getReplies = async (
  commentId: string,
  limit = 10,
  skip = 0
): Promise<PaginatedResponse<Comment>> => {
  const response = await fetch(
    `${API_URL}/api/community/comments/${commentId}/replies?limit=${limit}&skip=${skip}`,
    {
      method: 'GET',
      headers: getAuthHeaders(),
    }
  );
  return handleResponse(response);
};

export const createComment = async (payload: CreateCommentPayload): Promise<{ success: boolean; data: Comment }> => {
  const response = await fetch(`${API_URL}/api/community/comments`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

export const updateComment = async (
  id: string,
  content: string
): Promise<{ success: boolean; data: Comment }> => {
  const response = await fetch(`${API_URL}/api/community/comments/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ content }),
  });
  return handleResponse(response);
};

export const deleteComment = async (id: string): Promise<{ success: boolean }> => {
  const response = await fetch(`${API_URL}/api/community/comments/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
};

// ==========================================
// 👍 Vote API
// ==========================================

export const toggleVote = async (payload: VotePayload): Promise<{
  success: boolean;
  data: {
    action: 'created' | 'removed' | 'changed';
    vote: { voteType: VoteType } | null;
    previousVoteType?: string;
  };
}> => {
  const response = await fetch(`${API_URL}/api/community/votes`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

export const getUserVote = async (
  targetType: string,
  targetId: string
): Promise<{
  success: boolean;
  data: {
    hasVoted: boolean;
    voteType: VoteType | null;
  };
}> => {
  const response = await fetch(
    `${API_URL}/api/community/votes/me?targetType=${targetType}&targetId=${targetId}`,
    {
      method: 'GET',
      headers: getAuthHeaders(),
    }
  );
  return handleResponse(response);
};
