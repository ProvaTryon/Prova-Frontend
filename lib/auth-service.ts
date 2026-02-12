/**
 * 🔐 Auth Service
 * ====================================
 * خدمة مركزية لجميع عمليات المصادقة
 * تتواصل مع Backend API
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ==========================================
// 📝 تسجيل مستخدم جديد
// ==========================================
// 📝 تسجيل مستخدم جديد
// ==========================================
export const register = async (userData: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  birth_date?: string;
  confirmPassword?: string;
  role?: string;
  companyName?: string;
  companyId?: string;
  nationalId?: string;
}) => {
  try {
    // Log what we're sending to backend
    console.log('📤 Sending to backend:', userData);

    const response = await fetch(`${API_URL}/api/auth/signUp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      // Log full backend error for debugging
      console.error('❌ Backend Error Response:', {
        status: response.status,
        statusText: response.statusText,
        data: data,
        errors: data.errors,
      });

      // Try to extract detailed error messages
      let errorMessage = data.msg || data.message || data.error || `فشل التسجيل (${response.status})`;

      if (data.errors && Array.isArray(data.errors)) {
        const errorDetails = data.errors
          .map((err: any) => err.message || err.msg)
          .filter(Boolean)
          .join(', ');
        if (errorDetails) {
          errorMessage = errorDetails;
        }
      }

      throw new Error(errorMessage);
    }

    // حفظ Token في localStorage
    // Note: Backend returns just `user` not `token` in signUp response
    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
  } catch (error) {
    console.error('❌ Register Error Details:', error);
    console.error('❌ Error Message:', (error as Error).message);
    throw error;
  }
};

// ==========================================
// 🔐 تسجيل الدخول
// ==========================================
export const login = async (credentials: {
  email: string;
  password: string;
}) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      // Log full backend error for debugging
      console.error('❌ Backend Error Response:', {
        status: response.status,
        statusText: response.statusText,
        data: data,
      });
      throw new Error(data.msg || data.message || data.error || `فشل تسجيل الدخول (${response.status})`);
    }

    // حفظ Token في localStorage
    // Backend returns `tokens` object with `accessToken` and `refreshToken`
    if (data.tokens && data.tokens.accessToken) {
      localStorage.setItem('authToken', data.tokens.accessToken);
      localStorage.setItem('refreshToken', data.tokens.refreshToken);
    } else if (data.token) {
      // Fallback for different response format
      localStorage.setItem('authToken', data.token);
    }

    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
  } catch (error) {
    console.error('❌ Login Error Details:', error);
    console.error('❌ Error Message:', (error as Error).message);
    throw error;
  }
};

// ==========================================
// 🚪 تسجيل الخروج
// ==========================================
export const logout = async () => {
  try {
    const token = localStorage.getItem('authToken');

    // Call backend to invalidate token server-side
    if (token) {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
    }
  } catch (error) {
    console.error('❌ Logout API Error:', error);
    // Continue with local cleanup even if API call fails
  } finally {
    // Always clear local storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
};

// ==========================================
// � تحديث Token
// ==========================================
export const refreshToken = async () => {
  try {
    const response = await fetch(`${API_URL}/api/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'فشل تحديث Token');
    }

    // حفظ Token الجديد
    if (data.token) {
      localStorage.setItem('authToken', data.token);
    }

    return data;
  } catch (error) {
    console.error('❌ Refresh Token Error:', error);
    throw error;
  }
};

// ==========================================
// 🔑 تغيير كلمة المرور
// ==========================================
export const changePassword = async (passwords: {
  currentPassword: string;
  newPassword: string;
}) => {
  try {
    const token = localStorage.getItem('authToken');

    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${API_URL}/api/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(passwords),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'فشل تغيير كلمة المرور');
    }

    return data;
  } catch (error) {
    console.error('❌ Change Password Error:', error);
    throw error;
  }
};

// ==========================================
// 🔐 نسيان كلمة المرور
// ==========================================
export const forgotPassword = async (email: string) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/forgotPassword`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'فشل إرسال رابط إعادة تعيين');
    }

    return data;
  } catch (error) {
    console.error('❌ Forgot Password Error:', error);
    throw error;
  }
};

// ==========================================
// ✔️ التحقق من رمز إعادة التعيين
// ==========================================
export const verifyResetCode = async (resetCode: string) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/verifyResetCode`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ resetCode }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'رمز غير صحيح');
    }

    return data;
  } catch (error) {
    console.error('❌ Verify Reset Code Error:', error);
    throw error;
  }
};

// ==========================================
// 🔐 إعادة تعيين كلمة المرور
// ==========================================
export const resetPassword = async (resetCode: string, newPassword: string) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/resetPassword`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ resetCode, newPassword }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'فشل إعادة تعيين كلمة المرور');
    }

    return data;
  } catch (error) {
    console.error('❌ Reset Password Error:', error);
    throw error;
  }
};

// ==========================================
// 🔍 التحقق من وجود Token
// ==========================================
export const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};

// ==========================================
// 👤 الحصول على المستخدم من localStorage
// ==========================================
export const getStoredUser = () => {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
  return null;
};

// ==========================================
// ✅ التحقق من تسجيل الدخول
// ==========================================
export const isAuthenticated = () => {
  return !!getToken();
};
