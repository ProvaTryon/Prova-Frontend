const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function getAuthHeaders(): HeadersInit {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export interface TryOnHistoryItem {
  id: string;
  model: 'vton2d' | 'vton360';
  resultImageUrl: string;
  resultImagePublicId: string;
  productId?: string;
  productName?: string;
  productImage?: string;
  garmentCategory?: string;
  createdAt: string;
}

export interface TryOnHistoryResponse {
  items: TryOnHistoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

async function handleResponse<T>(res: Response): Promise<T> {
  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      json.msg || json.message || `Request failed (${res.status})`,
    );
  }

  return (json as ApiResponse<T>).data ?? json;
}

export async function fetchRecentTryOns(
  limit = 12,
  page = 1,
): Promise<TryOnHistoryResponse> {
  const res = await fetch(
    `${API_URL}/api/tryons/recent?limit=${encodeURIComponent(String(limit))}&page=${encodeURIComponent(String(page))}`,
    {
      method: 'GET',
      headers: getAuthHeaders(),
    },
  );

  return handleResponse<TryOnHistoryResponse>(res);
}

export async function deleteTryOnResult(tryOnId: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/tryons/${tryOnId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  await handleResponse<null>(res);
}
