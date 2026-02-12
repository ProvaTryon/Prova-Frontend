/**
 * 👤 User Service
 * ====================================
 * خدمة إدارة بيانات المستخدم
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ==========================================
// 📋 جلب جميع المستخدمين (Admin only)
// ==========================================
export const getAllUsers = async () => {
    try {
        const token = localStorage.getItem('authToken');

        console.log('📤 Fetching users with token:', token ? 'exists' : 'missing');

        const response = await fetch(`${API_URL}/api/users`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        console.log('📥 Users response status:', response.status);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ Users fetch error:', errorData);
            throw new Error(errorData.msg || errorData.error || `Failed to fetch users (${response.status})`);
        }

        const data = await response.json();
        console.log('✅ Users loaded:', data?.length || 0);
        return data;
    } catch (error) {
        console.error('❌ Error fetching users:', error);
        throw error;
    }
};

// ==========================================
// 🔍 جلب بيانات المستخدم
// ==========================================
export const getUserById = async (userId: string) => {
    try {
        const token = localStorage.getItem('authToken');

        const response = await fetch(`${API_URL}/api/users/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('فشل جلب بيانات المستخدم');
        }

        return await response.json();
    } catch (error) {
        console.error('❌ Error fetching user:', error);
        throw error;
    }
};

// ==========================================
// ✏️ تعديل بيانات المستخدم
// ==========================================
export const updateUser = async (userId: string, userData: any) => {
    try {
        const token = localStorage.getItem('authToken');

        console.log('📤 Updating user:', { userId, userData, token: token ? 'exists' : 'missing' });

        const response = await fetch(`${API_URL}/api/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(userData),
        });

        console.log('📥 Response status:', response.status, response.statusText);

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch {
                errorData = { error: response.statusText };
            }

            console.error('❌ Backend Error:', {
                status: response.status,
                statusText: response.statusText,
                data: errorData,
            });

            // Extract detailed validation errors if available
            let errorMsg = 'Failed to update user';
            if (errorData?.errors && Array.isArray(errorData.errors)) {
                // Zod validation errors
                const messages = errorData.errors.map((e: any) => e.message || e.path?.join('.') || 'Unknown error');
                errorMsg = messages.join(', ');
            } else if (errorData?.msg) {
                errorMsg = errorData.msg;
            } else if (errorData?.message) {
                errorMsg = errorData.message;
            } else if (errorData?.error) {
                errorMsg = errorData.error;
            }

            throw new Error(errorMsg);
        }

        const result = await response.json();
        console.log('✅ Update successful:', result);
        return result;
    } catch (error) {
        console.error('❌ Error updating user:', error);
        throw error;
    }
};

// ==========================================
// 🗑️ حذف المستخدم (Admin only)
// ==========================================
export const deleteUser = async (userId: string) => {
    try {
        const token = localStorage.getItem('authToken');

        const response = await fetch(`${API_URL}/api/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'فشل حذف المستخدم');
        }

        return await response.json();
    } catch (error) {
        console.error('❌ Error deleting user:', error);
        throw error;
    }
};
