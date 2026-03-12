/**
 * 👗 Virtual Try-On (VTON) Service
 * ====================================
 * خدمة معالجة الملابس الافتراضية
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ==========================================
// 👗 معالجة البروفة الافتراضية
// ==========================================
export interface TryOnOptions {
    modelType?: string;  // Model type (default: 'dc')
    category?: number;   // Category: 0=upper, 1=lower, 2=full (default: 2)
    scale?: number;      // Scale factor (default: 2.0)
    sample?: number;     // Sample count (default: 4)
}

export const processTryOn = async (
    personImageFile: File,
    garmentImageFile: File,
    options?: TryOnOptions
): Promise<string> => {
    try {
        const token = localStorage.getItem('authToken');

        if (!token) {
            throw new Error('Authentication required. Please log in.');
        }

        // إنشاء FormData لتحميل الصور
        const formData = new FormData();
        formData.append('person_image', personImageFile);
        formData.append('garment_image', garmentImageFile);

        // Add optional parameters
        if (options?.modelType) formData.append('modelType', options.modelType);
        if (options?.category !== undefined) formData.append('category', String(options.category));
        if (options?.scale !== undefined) formData.append('scale', String(options.scale));
        if (options?.sample !== undefined) formData.append('sample', String(options.sample));

        const response = await fetch(`${API_URL}/api/vton/process`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            body: formData,
        });

        if (!response.ok) {
            // Try to parse error message from response
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const error = await response.json();
                const msg = error.msg || error.message || 'فشل معالجة البروفة الافتراضية';
                // Detect HTML error pages forwarded from backend
                if (msg.includes('<!DOCTYPE') || msg.includes('<html')) {
                    throw new Error('AI service is currently unavailable. Please try again later.');
                }
                throw new Error(msg);
            }
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        // Backend returns binary image data (image/png)
        const blob = await response.blob();
        return URL.createObjectURL(blob);
    } catch (error) {
        console.error('❌ Error processing try-on:', error);
        throw error;
    }
};

/**
 * Helper function to convert a URL to a File object
 */
export const urlToFile = async (url: string, filename: string): Promise<File> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type });
};

/**
 * Helper function to convert base64 data URL to File
 */
export const dataURLToFile = (dataURL: string, filename: string): File => {
    const arr = dataURL.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
};

/**
 * Clean up object URL to prevent memory leaks
 */
export const revokeObjectURL = (url: string): void => {
    if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
    }
};
