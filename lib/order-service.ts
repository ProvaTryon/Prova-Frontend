/**
 * 📦 Order Service
 * ====================================
 * خدمة إدارة الطلبات - جلب البيانات من Backend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ==========================================
// 📋 جلب جميع الطلبات (Admin/Merchant only)
// ==========================================
export const getAllOrders = async () => {
    try {
        const token = localStorage.getItem('authToken');

        console.log('📤 Fetching orders with token:', token ? 'exists' : 'missing');

        const response = await fetch(`${API_URL}/api/orders`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        console.log('📥 Orders response status:', response.status);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ Orders fetch error:', errorData);
            throw new Error(errorData.msg || errorData.error || `Failed to fetch orders (${response.status})`);
        }

        const data = await response.json();
        console.log('✅ Orders loaded:', data?.length || 0);
        return data;
    } catch (error) {
        console.error('❌ Error fetching orders:', error);
        throw error;
    }
};

// ==========================================
// 🔍 جلب طلب واحد بواسطة ID
// ==========================================
export const getOrderById = async (orderId: string) => {
    try {
        const token = localStorage.getItem('authToken');

        const response = await fetch(`${API_URL}/api/orders/${orderId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('فشل جلب الطلب');
        }

        return await response.json();
    } catch (error) {
        console.error('❌ Error fetching order:', error);
        throw error;
    }
};

// ==========================================
// 👤 جلب طلبات المستخدم
// ==========================================
export const getUserOrders = async (userId: string) => {
    try {
        const token = localStorage.getItem('authToken');

        const response = await fetch(`${API_URL}/api/orders/user/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('فشل جلب طلبات المستخدم');
        }

        return await response.json();
    } catch (error) {
        console.error('❌ Error fetching user orders:', error);
        throw error;
    }
};

// ==========================================
// ➕ إنشاء طلب جديد
// ==========================================
export const createOrder = async (orderData: any) => {
    try {
        const token = localStorage.getItem('authToken');

        const response = await fetch(`${API_URL}/api/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(orderData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'فشل إنشاء الطلب');
        }

        return await response.json();
    } catch (error) {
        console.error('❌ Error creating order:', error);
        throw error;
    }
};

// ==========================================
// ✏️ تعديل الطلب
// ==========================================
export const updateOrder = async (orderId: string, orderData: any) => {
    try {
        const token = localStorage.getItem('authToken');

        const response = await fetch(`${API_URL}/api/orders/${orderId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(orderData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'فشل تعديل الطلب');
        }

        return await response.json();
    } catch (error) {
        console.error('❌ Error updating order:', error);
        throw error;
    }
};

// ==========================================
// 🔄 تغيير حالة الطلب (Admin/Merchant only)
// Uses the dedicated /api/orders/:id/status endpoint
// ==========================================
export const changeOrderStatus = async (orderId: string, statusData: { status: string }, orderData?: any) => {
    try {
        const token = localStorage.getItem('authToken');

        console.log('📤 Changing order status:', orderId, statusData);

        // Use the dedicated status endpoint
        // Build the payload with required order data for validation
        const updatePayload = orderData ? {
            user: typeof orderData.user === 'object' ? orderData.user._id : orderData.user,
            products: orderData.products?.map((p: any) => typeof p === 'object' ? p._id : p) || [],
            total: orderData.total,
            address: orderData.address,
            paymentMethod: orderData.paymentMethod,
            status: statusData.status,
        } : statusData;

        const response = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(updatePayload),
        });

        console.log('📥 Status change response:', response.status);

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            console.error('❌ Status change error:', error);
            throw new Error(error.msg || error.message || 'فشل تغيير حالة الطلب');
        }

        const result = await response.json();
        console.log('✅ Status changed successfully:', result);
        return result;
    } catch (error) {
        console.error('❌ Error changing order status:', error);
        throw error;
    }
};

// ==========================================
// 🗑️ حذف الطلب
// ==========================================
export const deleteOrder = async (orderId: string) => {
    try {
        const token = localStorage.getItem('authToken');

        console.log('📤 Deleting order:', orderId);

        const response = await fetch(`${API_URL}/api/orders/${orderId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        console.log('📥 Delete response status:', response.status);

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            console.error('❌ Delete error:', error);
            throw new Error(error.msg || error.message || 'فشل حذف الطلب');
        }

        const result = await response.json();
        console.log('✅ Order deleted:', result);
        return result;
    } catch (error) {
        console.error('❌ Error deleting order:', error);
        throw error;
    }
};
