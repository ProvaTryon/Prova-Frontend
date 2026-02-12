/**
 * 🏢 Branch Service
 * ====================================
 * خدمة إدارة فروع المتاجر
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ==========================================
// 📋 جلب جميع الفروع
// ==========================================
export const getAllBranches = async () => {
    try {
        const response = await fetch(`${API_URL}/api/branches`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('فشل جلب الفروع');
        }

        return await response.json();
    } catch (error) {
        console.error('❌ Error fetching branches:', error);
        throw error;
    }
};

// ==========================================
// 🔍 جلب فرع بواسطة ID
// ==========================================
export const getBranchById = async (branchId: string) => {
    try {
        const response = await fetch(`${API_URL}/api/branches/${branchId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('فشل جلب بيانات الفرع');
        }

        return await response.json();
    } catch (error) {
        console.error('❌ Error fetching branch:', error);
        throw error;
    }
};

// ==========================================
// ➕ إنشاء فرع جديد (Admin/Merchant only)
// ==========================================
export const createBranch = async (branchData: any) => {
    try {
        const token = localStorage.getItem('authToken');

        const response = await fetch(`${API_URL}/api/branches`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(branchData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'فشل إنشاء الفرع');
        }

        return await response.json();
    } catch (error) {
        console.error('❌ Error creating branch:', error);
        throw error;
    }
};

// ==========================================
// ✏️ تعديل الفرع (Admin/Merchant only)
// ==========================================
export const updateBranch = async (branchId: string, branchData: any) => {
    try {
        const token = localStorage.getItem('authToken');

        const response = await fetch(`${API_URL}/api/branches/${branchId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(branchData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'فشل تعديل الفرع');
        }

        return await response.json();
    } catch (error) {
        console.error('❌ Error updating branch:', error);
        throw error;
    }
};

// ==========================================
// 🗑️ حذف الفرع (Admin/Merchant only)
// ==========================================
export const deleteBranch = async (branchId: string) => {
    try {
        const token = localStorage.getItem('authToken');

        const response = await fetch(`${API_URL}/api/branches/${branchId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'فشل حذف الفرع');
        }

        return await response.json();
    } catch (error) {
        console.error('❌ Error deleting branch:', error);
        throw error;
    }
};
