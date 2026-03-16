/**
 * Profile Service
 * ====================================
 * Handles fetching and updating the current user's profile
 * via the dedicated /api/profile endpoint.
 *
 * Returns the consistent { success, message, data } envelope.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function getAuthHeaders(): HeadersInit {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('authToken')
      : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ── Types ──────────────────────────────────────────────

export interface ProfileData {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  birth_date?: string;
  role: 'user' | 'merchant' | 'admin' | 'cs';
  provider: 'local' | 'google';
  googleId?: string;
  profileImage?: string;
  tryonImage?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
  address?: string;
  birth_date?: string;
  profileImage?: string;
  tryonImage?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ── Helpers ────────────────────────────────────────────

async function handleResponse<T>(res: Response): Promise<T> {
  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (json.errors && Array.isArray(json.errors)) {
      const messages = json.errors
        .map((e: { message?: string }) => e.message)
        .filter(Boolean)
        .join(', ');
      throw new Error(messages || `Request failed (${res.status})`);
    }
    throw new Error(
      json.msg || json.message || `Request failed (${res.status})`,
    );
  }

  return (json as ApiResponse<T>).data ?? json;
}

// ── API calls ──────────────────────────────────────────

/**
 * GET /api/profile — fetch logged-in user's profile
 */
export async function fetchProfile(): Promise<ProfileData> {
  const res = await fetch(`${API_URL}/api/profile`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  return handleResponse<ProfileData>(res);
}

/**
 * PUT /api/profile — update logged-in user's profile
 */
export async function updateProfile(
  data: UpdateProfilePayload,
): Promise<ProfileData> {
  const res = await fetch(`${API_URL}/api/profile`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<ProfileData>(res);
}

/**
 * PUT /api/profile/password — change password (local accounts only)
 */
export async function changeProfilePassword(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const res = await fetch(`${API_URL}/api/profile/password`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  await handleResponse<null>(res);
}
