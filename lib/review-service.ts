/**
 * ⭐ Review Service
 * ====================================
 * خدمة إدارة التقييمات والتعليقات
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ==========================================
// ⭐ جلب تقييمات المنتج
// ==========================================
export const getProductReviews = async (productId: string) => {
    try {
        const response = await fetch(`${API_URL}/api/reviews/product/${productId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('فشل جلب التقييمات');
        }

        return await response.json();
    } catch (error) {
        console.error('❌ Error fetching product reviews:', error);
        throw error;
    }
};

// ==========================================
// 👤 جلب تقييمات المستخدم
// ==========================================
export const getUserReviews = async (userId: string) => {
    try {
        const response = await fetch(`${API_URL}/api/reviews/user/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('فشل جلب تقييمات المستخدم');
        }

        return await response.json();
    } catch (error) {
        console.error('❌ Error fetching user reviews:', error);
        throw error;
    }
};

// ==========================================
// ➕ إضافة تقييم جديد
// ==========================================
export const addReview = async (reviewData: any) => {
    try {
        const token = localStorage.getItem('authToken');

        const response = await fetch(`${API_URL}/api/reviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(reviewData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'فشل إضافة التقييم');
        }

        return await response.json();
    } catch (error) {
        console.error('❌ Error adding review:', error);
        throw error;
    }
};

// ==========================================
// ✏️ تعديل التقييم
// ==========================================
export const updateReview = async (reviewId: string, reviewData: any) => {
    try {
        const token = localStorage.getItem('authToken');

        const response = await fetch(`${API_URL}/api/reviews/${reviewId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(reviewData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'فشل تعديل التقييم');
        }

        return await response.json();
    } catch (error) {
        console.error('❌ Error updating review:', error);
        throw error;
    }
};

// ==========================================
// 🗑️ حذف التقييم
// ==========================================
export const deleteReview = async (reviewId: string) => {
    try {
        const token = localStorage.getItem('authToken');

        const response = await fetch(`${API_URL}/api/reviews/${reviewId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'فشل حذف التقييم');
        }

        return await response.json();
    } catch (error) {
        console.error('❌ Error deleting review:', error);
        throw error;
    }
};
