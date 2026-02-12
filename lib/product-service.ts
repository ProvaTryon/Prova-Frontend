/**
 * 🛍️ Product Service
 * ====================================
 * خدمة إدارة المنتجات - جلب البيانات من Backend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ==========================================
// 📦 Product Type Definition
// ==========================================
export interface Product {
    id: string
    name: string
    brand: string
    price: number
    salePrice?: number
    category: string
    sizes: string[]
    colors: string[]
    image: string
    images: string[]
    description: string
    inStock: boolean
    stock?: number
    rating?: number
    reviews?: number
    createdAt?: string
    merchantName?: string
}

// ==========================================
// � Transform backend product to frontend format
// ==========================================
const transformProduct = (backendProduct: any): Product => {
    return {
        id: backendProduct._id || backendProduct.id,
        name: backendProduct.name || '',
        brand: backendProduct.brand || '',
        price: backendProduct.price || 0,
        salePrice: backendProduct.salePrice,
        category: backendProduct.category || '',
        sizes: backendProduct.sizes || [],
        colors: backendProduct.colors || [],
        image: backendProduct.images?.[0] || backendProduct.image || '',
        images: backendProduct.images || [],
        description: backendProduct.description || '',
        inStock: backendProduct.stock > 0 || backendProduct.inStock || false,
        stock: backendProduct.stock,
        rating: backendProduct.rating,
        reviews: backendProduct.reviews,
        createdAt: backendProduct.createdAt,
        merchantName: backendProduct.merchantName || '',
    };
};

// ==========================================
// 📦 جلب جميع المنتجات
// ==========================================
export const getAllProducts = async (): Promise<Product[]> => {
    try {
        const response = await fetch(`${API_URL}/api/products`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('فشل جلب المنتجات');
        }

        const data = await response.json();
        return (data || []).map(transformProduct);
    } catch (error) {
        console.error('❌ Error fetching products:', error);
        throw error;
    }
};

// ==========================================
// 🔍 جلب منتج واحد بواسطة ID
// ==========================================
export const getProductById = async (productId: string): Promise<Product> => {
    try {
        const response = await fetch(`${API_URL}/api/products/${productId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('فشل جلب المنتج');
        }

        const data = await response.json();
        return transformProduct(data);
    } catch (error) {
        console.error('❌ Error fetching product:', error);
        throw error;
    }
};

// ==========================================
// 🔎 البحث عن منتجات
// ==========================================
export const searchProducts = async (query: string): Promise<Product[]> => {
    try {
        const response = await fetch(`${API_URL}/api/products/search?q=${encodeURIComponent(query)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('فشل البحث عن المنتجات');
        }

        const data = await response.json();
        return (data || []).map(transformProduct);
    } catch (error) {
        console.error('❌ Error searching products:', error);
        throw error;
    }
};

// ==========================================
// 🏷️ جلب المنتجات حسب الفئة
// ==========================================
export const getProductsByCategory = async (category: string): Promise<Product[]> => {
    try {
        const response = await fetch(`${API_URL}/api/products/category/${encodeURIComponent(category)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('فشل جلب المنتجات حسب الفئة');
        }

        const data = await response.json();
        return (data || []).map(transformProduct);
    } catch (error) {
        console.error('❌ Error fetching products by category:', error);
        throw error;
    }
};

// ==========================================
// 👤 جلب منتجات التاجر
// ==========================================
export const getProductsByMerchant = async (merchantId: string): Promise<Product[]> => {
    try {
        const response = await fetch(`${API_URL}/api/products/merchant/${merchantId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('فشل جلب منتجات التاجر');
        }

        const data = await response.json();
        return (data || []).map(transformProduct);
    } catch (error) {
        console.error('❌ Error fetching merchant products:', error);
        throw error;
    }
};

// ==========================================
// ➕ إنشاء منتج جديد (Admin/Merchant only)
// ==========================================
export const createProduct = async (productData: any) => {
    try {
        const token = localStorage.getItem('authToken');

        console.log('📤 Creating product with data:', productData);
        console.log('📤 Token:', token ? 'exists' : 'missing');

        const response = await fetch(`${API_URL}/api/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(productData),
        });

        console.log('📥 Create response status:', response.status);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ Create product error:', errorData);

            // Handle validation errors
            let errorMessage = errorData.error || errorData.msg || errorData.message || `Failed to create product (${response.status})`;
            if (errorData.errors && Array.isArray(errorData.errors)) {
                const validationErrors = errorData.errors.map((e: any) => e.message || e.msg || JSON.stringify(e)).join(', ');
                errorMessage = `Validation error: ${validationErrors}`;
            }
            throw new Error(errorMessage);
        }

        const result = await response.json();
        console.log('✅ Product created:', result);
        return result;
    } catch (error) {
        console.error('❌ Error creating product:', error);
        throw error;
    }
};

// ==========================================
// ✏️ تعديل منتج (Admin/Merchant only)
// ==========================================
export const updateProduct = async (productId: string, productData: any) => {
    try {
        const token = localStorage.getItem('authToken');

        console.log('📤 Updating product:', productId, productData);
        console.log('📤 Token:', token ? 'exists' : 'missing');

        const response = await fetch(`${API_URL}/api/products/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(productData),
        });

        console.log('📥 Update response status:', response.status);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ Update product error:', errorData);

            // Handle validation errors
            let errorMessage = errorData.error || errorData.msg || errorData.message || `Failed to update product (${response.status})`;
            if (errorData.errors && Array.isArray(errorData.errors)) {
                const validationErrors = errorData.errors.map((e: any) => e.message || e.msg || JSON.stringify(e)).join(', ');
                errorMessage = `Validation error: ${validationErrors}`;
            }
            throw new Error(errorMessage);
        }

        const result = await response.json();
        console.log('✅ Product updated:', result);
        return result;
    } catch (error) {
        console.error('❌ Error updating product:', error);
        throw error;
    }
};

// ==========================================
// 🗑️ حذف منتج (Admin/Merchant only)
// ==========================================
export const deleteProduct = async (productId: string) => {
    try {
        const token = localStorage.getItem('authToken');

        const response = await fetch(`${API_URL}/api/products/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'فشل حذف المنتج');
        }

        return await response.json();
    } catch (error) {
        console.error('❌ Error deleting product:', error);
        throw error;
    }
};

// ==========================================
// 🏪 جلب منتجات التاجر حسب الاسم (Frontend filtering)
// ==========================================
export const getProductsByMerchantName = async (merchantName: string): Promise<Product[]> => {
    try {
        // Fetch all products and filter by merchantName on frontend
        const allProducts = await getAllProducts();
        return allProducts.filter(
            (product) => product.merchantName?.toLowerCase() === merchantName.toLowerCase()
        );
    } catch (error) {
        console.error('❌ Error fetching products by merchant name:', error);
        throw error;
    }
};

// ==========================================
// 📦 Export as namespace for backward compatibility
// ==========================================
export const productService = {
    getAllProducts,
    getProductById,
    searchProducts,
    getProductsByCategory,
    getProductsByMerchant,
    getProductsByMerchantName,
    createProduct,
    updateProduct,
    deleteProduct,
};
