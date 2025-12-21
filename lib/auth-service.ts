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
export const register = async (userData: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: string;
}) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'فشل التسجيل');
    }

    // حفظ Token في localStorage
    if (data.token) {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
  } catch (error) {
    console.error('❌ Register Error:', error);
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
      throw new Error(data.message || 'فشل تسجيل الدخول');
    }

    // حفظ Token في localStorage
    if (data.token) {
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
  } catch (error) {
    console.error('❌ Login Error:', error);
    throw error;
  }
};

// ==========================================
// 🚪 تسجيل الخروج
// ==========================================
export const logout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

// ==========================================
// 👤 الحصول على بيانات المستخدم الحالي
// ==========================================
export const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${API_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      // إذا كان Token منتهي الصلاحية، قم بتسجيل الخروج
      if (response.status === 401) {
        logout();
      }
      throw new Error(data.message || 'فشل جلب البيانات');
    }

    // تحديث البيانات في localStorage
    localStorage.setItem('user', JSON.stringify(data.user));

    return data.user;
  } catch (error) {
    console.error('❌ Get Current User Error:', error);
    throw error;
  }
};

// ==========================================
// 🔄 تحديث البيانات الشخصية
// ==========================================
export const updateProfile = async (profileData: {
  name?: string;
  phone?: string;
  address?: string;
}) => {
  try {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${API_URL}/api/auth/update-profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'فشل تحديث البيانات');
    }

    // تحديث البيانات في localStorage
    localStorage.setItem('user', JSON.stringify(data.user));

    return data;
  } catch (error) {
    console.error('❌ Update Profile Error:', error);
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
      method: 'PUT',
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
