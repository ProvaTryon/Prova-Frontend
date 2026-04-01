/**
 * 🔐 Auth Service
 * ====================================
 * خدمة مركزية لجميع عمليات المصادقة
 * تتواصل مع Backend API
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface AuthApiResponse {
  tokens?: {
    accessToken?: string;
    refreshToken?: string;
  };
  token?: string;
  user?: unknown;
}

interface GoogleCredentialResponse {
  credential?: string;
}

interface GooglePromptNotification {
  isNotDisplayed?: () => boolean;
  isSkippedMoment?: () => boolean;
  isDismissedMoment?: () => boolean;
}

interface GoogleAccountsId {
  initialize: (options: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
    use_fedcm_for_prompt?: boolean;
  }) => void;
  prompt: (
    momentListener?: (notification: GooglePromptNotification) => void,
  ) => void;
  renderButton: (
    parent: HTMLElement,
    options: {
      type?: string;
      theme?: string;
      size?: string;
      text?: string;
      width?: number;
    },
  ) => void;
}

interface GoogleAccountsOAuth2 {
  initCodeClient: (options: {
    client_id: string;
    scope: string;
    ux_mode: string;
    callback: (response: { code?: string; error?: string }) => void;
  }) => { requestCode: () => void };
  initTokenClient: (options: {
    client_id: string;
    scope: string;
    callback: (response: { access_token?: string; error?: string }) => void;
  }) => { requestAccessToken: () => void };
}

let googleScriptPromise: Promise<void> | null = null;

const saveAuthSession = (data: AuthApiResponse): void => {
  if (typeof window === 'undefined') return;

  if (data.tokens?.accessToken) {
    localStorage.setItem('authToken', data.tokens.accessToken);
    if (data.tokens.refreshToken) {
      localStorage.setItem('refreshToken', data.tokens.refreshToken);
    }
  } else if (data.token) {
    localStorage.setItem('authToken', data.token);
  }

  if (data.user) {
    localStorage.setItem('user', JSON.stringify(data.user));
  }
};

const loadGoogleIdentityScript = async (): Promise<void> => {
  if (typeof window === 'undefined') {
    throw new Error('Google Sign-In is only available in browser');
  }

  const accountsId = (
    window as Window & { google?: { accounts?: { id?: GoogleAccountsId } } }
  ).google?.accounts?.id;

  if (accountsId) return;

  if (googleScriptPromise) {
    await googleScriptPromise;
    return;
  }

  googleScriptPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.getElementById(
      'google-identity-script',
    ) as HTMLScriptElement | null;

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener(
        'error',
        () => reject(new Error('Failed to load Google Sign-In SDK')),
        { once: true },
      );
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-identity-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error('Failed to load Google Sign-In SDK'));
    document.head.appendChild(script);
  });

  await googleScriptPromise;
};

const getGoogleAccountsId = (): GoogleAccountsId => {
  const accountsId = (
    window as Window & { google?: { accounts?: { id?: GoogleAccountsId } } }
  ).google?.accounts?.id;

  if (!accountsId) {
    throw new Error('Google Sign-In SDK is unavailable');
  }

  return accountsId;
};

/**
 * Returns either { idToken } from One Tap or { accessToken } from OAuth popup.
 */
export const getGoogleToken = async (): Promise<
  { idToken: string; accessToken?: undefined } | { accessToken: string; idToken?: undefined }
> => {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!clientId) {
    throw new Error('NEXT_PUBLIC_GOOGLE_CLIENT_ID is not configured');
  }

  await loadGoogleIdentityScript();

  // On localhost, skip One Tap entirely — GSI's origin check fires a
  // console.error that Next.js dev mode surfaces as a visible error overlay.
  const isLocalhost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1');

  if (!isLocalhost) {
    try {
      const credential = await tryOneTapFlow(clientId);
      return { idToken: credential };
    } catch (oneTapError) {
      console.warn(
        '⚠️ One Tap failed, falling back to OAuth popup:',
        (oneTapError as Error).message,
      );
    }
  }

  const token = await oauthTokenClientFlow(clientId);
  return { accessToken: token };
};

/** @deprecated Use getGoogleToken instead */
export const getGoogleIdToken = async (): Promise<string> => {
  const result = await getGoogleToken();
  if (result.idToken) return result.idToken;
  if (result.accessToken) return result.accessToken;
  throw new Error('Google authentication did not return a token');
};

/**
 * One Tap / FedCM flow (requires authorized JS origin in Google Console)
 */
const tryOneTapFlow = (clientId: string): Promise<string> => {
  const accountsId = getGoogleAccountsId();

  return new Promise<string>((resolve, reject) => {
    let settled = false;

    const finish = (callback: () => void): void => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      callback();
    };

    const timeoutId = window.setTimeout(() => {
      finish(() => reject(new Error('Google Sign-In timed out')));
    }, 60000);

    accountsId.initialize({
      client_id: clientId,
      callback: (response) => {
        finish(() => {
          if (!response.credential) {
            reject(new Error('Google did not return a credential token'));
            return;
          }
          resolve(response.credential);
        });
      },
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    accountsId.prompt((notification) => {
      const notDisplayed = notification.isNotDisplayed?.() ?? false;
      const skipped = notification.isSkippedMoment?.() ?? false;
      const dismissed = notification.isDismissedMoment?.() ?? false;

      if (notDisplayed || skipped || dismissed) {
        finish(() => reject(new Error('Google Sign-In prompt not available')));
      }
    });
  });
};

/**
 * OAuth 2.0 Token Client flow via Google's SDK.
 * Uses google.accounts.oauth2.initTokenClient which opens a Google-managed
 * consent popup. This does NOT require Authorized JavaScript Origins,
 * so it works on localhost without any Google Console configuration.
 * Returns an access_token (not an id_token).
 */
const oauthTokenClientFlow = (clientId: string): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const oauth2 = (
      window as Window & {
        google?: { accounts?: { oauth2?: GoogleAccountsOAuth2 } };
      }
    ).google?.accounts?.oauth2;

    if (!oauth2) {
      reject(new Error('Google OAuth2 SDK is unavailable'));
      return;
    }

    const tokenClient = oauth2.initTokenClient({
      client_id: clientId,
      scope: 'openid email profile',
      callback: (response) => {
        if (response.error) {
          reject(new Error(`Google OAuth error: ${response.error}`));
          return;
        }
        if (!response.access_token) {
          reject(new Error('No access token received from Google'));
          return;
        }
        resolve(response.access_token);
      },
    });

    tokenClient.requestAccessToken();
  });
};

// ==========================================
// 📝 تسجيل مستخدم جديد
// ==========================================
// 📝 تسجيل مستخدم جديد
// ==========================================
export const register = async (userData: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  birth_date?: string;
  confirmPassword?: string;
  role?: string;
  companyName?: string;
  companyId?: string;
  nationalId?: string;
  tryonImage?: string;
  tryonSideImage?: string;
}) => {
  try {
    // Log what we're sending to backend
    console.log('📤 Sending to backend:', userData);

    const response = await fetch(`${API_URL}/api/auth/signUp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      // Log full backend error for debugging
      console.error('❌ Backend Error Response:', {
        status: response.status,
        statusText: response.statusText,
        data: data,
        errors: data.errors,
      });

      // Try to extract detailed error messages
      let errorMessage = data.msg || data.message || data.error || `فشل التسجيل (${response.status})`;

      if (data.errors && Array.isArray(data.errors)) {
        const errorDetails = data.errors
          .map((err: { message?: string; msg?: string }) => err.message || err.msg)
          .filter(Boolean)
          .join(', ');
        if (errorDetails) {
          errorMessage = errorDetails;
        }
      }

      throw new Error(errorMessage);
    }

    // Don't save user to localStorage on signup - account needs OTP verification first
    return data;
  } catch (error) {
    console.error('❌ Register Error Details:', error);
    console.error('❌ Error Message:', (error as Error).message);
    throw error;
  }
};

// ==========================================
// 🔐 تسجيل الدخول
// ==========================================
export const login = async (credentials: {
  email: string;
  password: string;
}) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      // Log full backend error for debugging
      console.error('❌ Backend Error Response:', {
        status: response.status,
        statusText: response.statusText,
        data: data,
      });
      throw new Error(data.msg || data.message || data.error || `فشل تسجيل الدخول (${response.status})`);
    }

    // حفظ Token في localStorage
    // Backend returns `tokens` object with `accessToken` and `refreshToken`
    saveAuthSession(data as AuthApiResponse);

    return data;
  } catch (error) {
    console.error('❌ Login Error Details:', error);
    console.error('❌ Error Message:', (error as Error).message);
    throw error;
  }
};

export const googleAuth = async (
  token: string | { idToken?: string; accessToken?: string },
) => {
  try {
    // Support both old (string = idToken) and new ({ idToken?, accessToken? }) signatures
    const body =
      typeof token === 'string'
        ? { idToken: token }
        : token;

    const response = await fetch(`${API_URL}/api/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.msg || data.message || data.error || 'Google sign-in failed',
      );
    }

    saveAuthSession(data as AuthApiResponse);
    return data;
  } catch (error) {
    console.error('❌ Google Auth Error Details:', error);
    throw error;
  }
};

// ==========================================
// ✅ Verify Signup OTP (Email Verification)
// ==========================================
export const verifySignupOTP = async (email: string, otp: string) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/verify-signup-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otp }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.msg || data.message || data.error || 'OTP verification failed');
    }

    saveAuthSession(data as AuthApiResponse);

    return data;
  } catch (error) {
    console.error('❌ Verify Signup OTP Error:', error);
    throw error;
  }
};

// ==========================================
// 🔄 Resend Signup OTP
// ==========================================
export const resendSignupOTP = async (email: string) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/resend-signup-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.msg || data.message || data.error || 'Failed to resend OTP');
    }

    return data;
  } catch (error) {
    console.error('❌ Resend Signup OTP Error:', error);
    throw error;
  }
};

// ==========================================
// 🚪 تسجيل الخروج
// ==========================================
export const logout = async () => {
  try {
    const token = localStorage.getItem('authToken');

    // Call backend to invalidate token server-side
    if (token) {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
    }
  } catch (error) {
    console.error('❌ Logout API Error:', error);
    // Continue with local cleanup even if API call fails
  } finally {
    // Always clear local storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
};

// ==========================================
// � تحديث Token
// ==========================================
export const refreshToken = async () => {
  try {
    const response = await fetch(`${API_URL}/api/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'فشل تحديث Token');
    }

    // حفظ Token الجديد
    if (data.token) {
      localStorage.setItem('authToken', data.token);
    }

    return data;
  } catch (error) {
    console.error('❌ Refresh Token Error:', error);
    throw error;
  }
};

// ==========================================
// 🔑 تغيير كلمة المرور
// ==========================================
export const changePassword = async (passwords: {
  currentPassword: string;
  newPassword: string;
}) => {
  try {
    const token = localStorage.getItem('authToken');

    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${API_URL}/api/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(passwords),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'فشل تغيير كلمة المرور');
    }

    return data;
  } catch (error) {
    console.error('❌ Change Password Error:', error);
    throw error;
  }
};

// ==========================================
// 🔐 نسيان كلمة المرور
// ==========================================
export const forgotPassword = async (email: string) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/forgotPassword`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'فشل إرسال رابط إعادة تعيين');
    }

    return data;
  } catch (error) {
    console.error('❌ Forgot Password Error:', error);
    throw error;
  }
};

// ==========================================
// ✔️ التحقق من رمز إعادة التعيين
// ==========================================
export const verifyResetCode = async (resetCode: string) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/verifyResetCode`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ resetCode }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'رمز غير صحيح');
    }

    return data;
  } catch (error) {
    console.error('❌ Verify Reset Code Error:', error);
    throw error;
  }
};

// ==========================================
// 🔐 إعادة تعيين كلمة المرور
// ==========================================
export const resetPassword = async (resetCode: string, newPassword: string) => {
  try {
    const response = await fetch(`${API_URL}/api/auth/resetPassword`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ resetCode, newPassword }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'فشل إعادة تعيين كلمة المرور');
    }

    return data;
  } catch (error) {
    console.error('❌ Reset Password Error:', error);
    throw error;
  }
};

// ==========================================
// 🔍 التحقق من وجود Token
// ==========================================
export const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('authToken');
  }
  return null;
};

// ==========================================
// 👤 الحصول على المستخدم من localStorage
// ==========================================
export const getStoredUser = () => {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
  return null;
};

// ==========================================
// ✅ التحقق من تسجيل الدخول
// ==========================================
export const isAuthenticated = () => {
  return !!getToken();
};
