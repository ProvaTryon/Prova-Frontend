/**
 * 👗 Virtual Try-On (VTON) Service
 * ====================================
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// ==========================================
// 🏷️ Category-based model routing
// ==========================================

const UPPER_BODY_CATEGORIES = new Set([
    'shirt', 'shirts', 't-shirt', 't-shirts', 'tshirt', 'tshirts',
    'blouse', 'blouses', 'jacket', 'jackets', 'coat', 'coats',
    'sweater', 'sweaters', 'hoodie', 'hoodies', 'top', 'tops',
    'vest', 'vests', 'cardigan', 'cardigans', 'polo', 'polos',
]);

const LOWER_BODY_CATEGORIES = new Set([
    'pant', 'pants', 'trouser', 'trousers', 'jeans',
    'shorts', 'skirt', 'skirts', 'legging', 'leggings',
]);

export type VtonModel = 'vton2d' | 'vton360';

/**
 * Determine which VTON model to use based on product category.
 * - Lowerbody → VTON2D
 * - Upperbody → VTON360
 * - Unknown   → VTON2D (fallback)
 */
export function getVtonModel(category?: string): VtonModel {
    if (!category) return 'vton2d';
    const cat = category.toLowerCase().trim();
    if (UPPER_BODY_CATEGORIES.has(cat)) return 'vton360';
    if (LOWER_BODY_CATEGORIES.has(cat)) return 'vton2d';
    return 'vton2d';
}

/** Validate that a File is an accepted image type. */
export function validateImageFile(file: File): void {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        throw new Error(`Invalid image type: ${file.type}. Accepted: JPEG, PNG, WebP.`);
    }
}

// ==========================================
// 🔒 Shared authenticated fetch
// ==========================================

/** Parse an error response into a human-readable message. */
async function parseErrorResponse(response: Response): Promise<string> {
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
        const body = await response.json();
        const msg = body.msg || body.message || '';
        if (msg.includes('<!DOCTYPE') || msg.includes('<html')) {
            return 'AI service is currently unavailable. Please try again later.';
        }
        return msg || `Error: ${response.status} ${response.statusText}`;
    }
    return `Error: ${response.status} ${response.statusText}`;
}

/**
 * Authenticated POST that sends FormData and expects a binary image back.
 * Returns an object URL for the result image.
 */
async function postForImage(
    url: string,
    formData: FormData,
    signal?: AbortSignal,
): Promise<string> {
    const token = localStorage.getItem('authToken');
    if (!token) {
        throw new Error('Authentication required. Please log in.');
    }

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
        signal,
    });

    if (!response.ok) {
        throw new Error(await parseErrorResponse(response));
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
}

// ==========================================
// 👗 VTON2D — lowerbody try-on
// ==========================================
export interface TryOnOptions {
    modelType?: string;
    category?: number;   // 0=upper, 1=lower, 2=full
    scale?: number;
    sample?: number;
    signal?: AbortSignal;
}

export const processTryOn = async (
    personImageFile: File,
    garmentImageFile: File,
    options?: TryOnOptions,
): Promise<string> => {
    const formData = new FormData();
    formData.append('person_image', personImageFile);
    formData.append('garment_image', garmentImageFile);

    if (options?.modelType) formData.append('modelType', options.modelType);
    if (options?.category !== undefined) formData.append('category', String(options.category));
    if (options?.scale !== undefined) formData.append('scale', String(options.scale));
    if (options?.sample !== undefined) formData.append('sample', String(options.sample));

    return postForImage(`${API_URL}/api/vton/process`, formData, options?.signal);
};

// ==========================================
// 🔄 VTON360 — upperbody try-on
// ==========================================

export const processVton360TryOn = async (
    personImageFile: File,
    garmentImageFile: File,
    signal?: AbortSignal,
): Promise<string> => {
    const formData = new FormData();
    formData.append('person_image', personImageFile);
    formData.append('garment_image', garmentImageFile);

    return postForImage(`${API_URL}/api/vton360/simple-process`, formData, signal);
};

// ==========================================
// 🛠️ Helpers
// ==========================================

export const urlToFile = async (url: string, filename: string): Promise<File> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], filename, { type: blob.type });
};

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

export const revokeObjectURL = (url: string): void => {
    if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
    }
};
