/**
 * 🎯 Recommendation Service
 * ====================================
 * خدمة التوصيات الشخصية والمنتجات الشهيرة
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ==========================================
// 🎯 جلب التوصيات الشخصية
// ==========================================
export const getPersonalizedRecommendations = async () => {
    try {
        const token = localStorage.getItem('authToken');

        const response = await fetch(`${API_URL}/api/recommendations/personalized`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('فشل جلب التوصيات الشخصية');
        }

        return await response.json();
    } catch (error) {
        console.error('❌ Error fetching personalized recommendations:', error);
        throw error;
    }
};

// ==========================================
// 👥 جلب التوصيات التعاونية
// ==========================================
export const getCollaborativeRecommendations = async () => {
    try {
        const token = localStorage.getItem('authToken');

        const response = await fetch(`${API_URL}/api/recommendations/collaborative`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('فشل جلب التوصيات التعاونية');
        }

        return await response.json();
    } catch (error) {
        console.error('❌ Error fetching collaborative recommendations:', error);
        throw error;
    }
};

// ==========================================
// 📊 جلب التوصيات المحتوى
// ==========================================
export const getContentBasedRecommendations = async () => {
    try {
        const token = localStorage.getItem('authToken');

        const response = await fetch(`${API_URL}/api/recommendations/content-based`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('فشل جلب توصيات المحتوى');
        }

        return await response.json();
    } catch (error) {
        console.error('❌ Error fetching content-based recommendations:', error);
        throw error;
    }
};

// ==========================================
// � جلب المنتجات المشابهة
// ==========================================
export const getSimilarProducts = async (productId: string) => {
    try {
        const response = await fetch(`${API_URL}/api/recommendations/similar/${productId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('فشل جلب المنتجات المشابهة');
        }

        return await response.json();
    } catch (error) {
        console.error('❌ Error fetching similar products:', error);
        throw error;
    }
};

// ==========================================
// �🔥 جلب المنتجات الشهيرة
// ==========================================
export const getPopularProducts = async () => {
    try {
        const response = await fetch(`${API_URL}/api/recommendations/popular`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('فشل جلب المنتجات الشهيرة');
        }

        return await response.json();
    } catch (error) {
        console.error('❌ Error fetching popular products:', error);
        throw error;
    }
};

// ==========================================
// 📈 جلب المنتجات الرائجة
// ==========================================
export const getTrendingProducts = async () => {
    try {
        const response = await fetch(`${API_URL}/api/recommendations/trending`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('فشل جلب المنتجات الرائجة');
        }

        return await response.json();
    } catch (error) {
        console.error('❌ Error fetching trending products:', error);
        throw error;
    }
};

// ==========================================
// 👁️ تتبع مشاهدة المنتج
// ==========================================
export const trackProductView = async (productId: string) => {
    try {
        const token = localStorage.getItem('authToken');

        const response = await fetch(`${API_URL}/api/recommendations/track-view`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ productId }),
        });

        if (!response.ok) {
            throw new Error('فشل تتبع المشاهدة');
        }

        return await response.json();
    } catch (error) {
        console.error('❌ Error tracking product view:', error);
        throw error;
    }
};

// ==========================================
// 🖱️ تتبع نقرة المنتج
// ==========================================
export const trackProductClick = async (productId: string) => {
    try {
        const token = localStorage.getItem('authToken');

        const response = await fetch(`${API_URL}/api/recommendations/track-click`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ productId }),
        });

        if (!response.ok) {
            throw new Error('فشل تتبع النقرة');
        }

        return await response.json();
    } catch (error) {
        console.error('❌ Error tracking product click:', error);
        throw error;
    }
};
