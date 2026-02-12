/**
 * 💬 Customer Service
 * ====================================
 * خدمة إدارة وكلاء خدمة العملاء (Admin only)
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ==========================================
// 📋 جلب جميع وكلاء خدمة العملاء (Admin only)
// ==========================================
export const getAllAgents = async () => {
    try {
        const token = localStorage.getItem('authToken');

        const response = await fetch(`${API_URL}/api/customer-service`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('فشل جلب الوكلاء');
        }

        return await response.json();
    } catch (error) {
        console.error('❌ Error fetching agents:', error);
        throw error;
    }
};

// ==========================================
// 🔍 جلب بيانات الوكيل (Admin only)
// ==========================================
export const getAgentById = async (agentId: string) => {
    try {
        const token = localStorage.getItem('authToken');

        const response = await fetch(`${API_URL}/api/customer-service/${agentId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('فشل جلب بيانات الوكيل');
        }

        return await response.json();
    } catch (error) {
        console.error('❌ Error fetching agent:', error);
        throw error;
    }
};

// ==========================================
// ➕ إضافة وكيل جديد (Admin only)
// ==========================================
export const addAgent = async (agentData: any) => {
    try {
        const token = localStorage.getItem('authToken');

        const response = await fetch(`${API_URL}/api/customer-service`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(agentData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'فشل إضافة الوكيل');
        }

        return await response.json();
    } catch (error) {
        console.error('❌ Error adding agent:', error);
        throw error;
    }
};

// ==========================================
// ✏️ تعديل بيانات الوكيل (Admin only)
// ==========================================
export const updateAgent = async (agentId: string, agentData: any) => {
    try {
        const token = localStorage.getItem('authToken');

        const response = await fetch(`${API_URL}/api/customer-service/${agentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(agentData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'فشل تعديل بيانات الوكيل');
        }

        return await response.json();
    } catch (error) {
        console.error('❌ Error updating agent:', error);
        throw error;
    }
};

// ==========================================
// 🗑️ حذف الوكيل (Admin only)
// ==========================================
export const deleteAgent = async (agentId: string) => {
    try {
        const token = localStorage.getItem('authToken');

        const response = await fetch(`${API_URL}/api/customer-service/${agentId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'فشل حذف الوكيل');
        }

        return await response.json();
    } catch (error) {
        console.error('❌ Error deleting agent:', error);
        throw error;
    }
};
