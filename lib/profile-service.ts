/**
 * Profile Service
 * ====================================
 * Handles fetching and updating the current user's profile
 * via the dedicated /api/profile endpoint.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function getAuthHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export interface ProfileData {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  birth_date?: string;
  role: 'user' | 'merchant' | 'admin' | 'cs';
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
  address?: string;
  birth_date?: string;
}

/**
 * GET /api/profile — fetch logged-in user's profile
 */
export async function fetchProfile(): Promise<ProfileData> {
  const res = await fetch(`${API_URL}/api/profile`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.msg || err.message || `Failed to fetch profile (${res.status})`);
  }

  return res.json();
}

/**
 * PATCH /api/profile — update logged-in user's profile
 */
export async function updateProfile(data: UpdateProfilePayload): Promise<ProfileData> {
  const res = await fetch(`${API_URL}/api/profile`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));

    // Extract Zod validation error details
    if (err.errors && Array.isArray(err.errors)) {
      const messages = err.errors.map((e: { message?: string; field?: string }) =>
        e.message || e.field || 'Validation error',
      );
      throw new Error(messages.join(', '));
    }

    throw new Error(err.msg || err.message || `Failed to update profile (${res.status})`);
  }

  return res.json();
}
