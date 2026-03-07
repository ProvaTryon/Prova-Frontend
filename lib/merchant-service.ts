/**
 * 🏪 Merchant Service
 * ====================================
 * خدمة إدارة التجار - جلب البيانات من Backend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ==========================================
// ✍️ تسجيل تاجر جديد
// ==========================================
export const registerMerchant = async (merchantData: any) => {
    try {
        const response = await fetch(`${API_URL}/api/merchants/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(merchantData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'فشل تسجيل التاجر');
        }

        return await response.json();
    } catch (error) {
        console.error('❌ Error registering merchant:', error);
        throw error;
    }
};

// ==========================================
// 📋 جلب جميع التجار (Admin only)
// ==========================================
export const getAllMerchants = async () => {
    try {
        const token = localStorage.getItem('authToken');

        console.log('📤 Fetching merchants with token:', token ? 'exists' : 'missing');

        const response = await fetch(`${API_URL}/api/merchants/admin/merchants`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        console.log('📥 Merchants response status:', response.status);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ Merchants fetch error:', errorData);
            throw new Error(errorData.msg || errorData.error || `Failed to fetch merchants (${response.status})`);
        }

        const data = await response.json();
        console.log('✅ Merchants loaded:', data?.length || 0);
        return data;
    } catch (error) {
        console.error('❌ Error fetching merchants:', error);
        throw error;
    }
};

// ==========================================
// 🔍 جلب تاجر بواسطة ID
// ==========================================
export const getMerchantById = async (merchantId: string) => {
    try {
        const token = localStorage.getItem('authToken');

        const response = await fetch(`${API_URL}/api/merchants/profile/${merchantId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('فشل جلب بيانات التاجر');
        }

        return await response.json();
    } catch (error) {
        console.error('❌ Error fetching merchant:', error);
        throw error;
    }
};

// ==========================================
// 📊 جلب لوحة تحكم التاجر
// ==========================================
export const getMerchantDashboard = async (merchantId: string) => {
    try {
        const token = localStorage.getItem('authToken');

        const response = await fetch(`${API_URL}/api/merchants/${merchantId}/dashboard`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('فشل جلب لوحة التحكم');
        }

        return await response.json();
    } catch (error) {
        console.error('❌ Error fetching merchant dashboard:', error);
        throw error;
    }
};

// ==========================================
// 🛍️ جلب منتجات التاجر
// ==========================================
export const getMerchantProducts = async (merchantId: string) => {
    try {
        const token = localStorage.getItem('authToken');

        const response = await fetch(`${API_URL}/api/merchants/${merchantId}/products`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('فشل جلب منتجات التاجر');
        }

        return await response.json();
    } catch (error) {
        console.error('❌ Error fetching merchant products:', error);
        throw error;
    }
};

// ==========================================
// 📦 جلب طلبات التاجر
// ==========================================
export const getMerchantOrders = async (merchantId: string) => {
    try {
        const token = localStorage.getItem('authToken');

        const response = await fetch(`${API_URL}/api/merchants/${merchantId}/orders`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('فشل جلب طلبات التاجر');
        }

        return await response.json();
    } catch (error) {
        console.error('❌ Error fetching merchant orders:', error);
        throw error;
    }
};

// ==========================================
// ✏️ تعديل بيانات التاجر
// ==========================================
export const updateMerchant = async (merchantId: string, merchantData: any) => {
    try {
        const token = localStorage.getItem('authToken');

        const response = await fetch(`${API_URL}/api/merchants/${merchantId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(merchantData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'فشل تعديل بيانات التاجر');
        }

        return await response.json();
    } catch (error) {
        console.error('❌ Error updating merchant:', error);
        throw error;
    }
};

// ==========================================
// 🗑️ حذف تاجر (Admin only)
// ==========================================
export const deleteMerchant = async (merchantId: string) => {
    try {
        const token = localStorage.getItem('authToken');

        const response = await fetch(`${API_URL}/api/merchants/admin/merchant/${merchantId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'فشل حذف التاجر');
        }

        return await response.json();
    } catch (error) {
        console.error('❌ Error deleting merchant:', error);
        throw error;
    }
};
