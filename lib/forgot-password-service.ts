const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ==========================================
// 📧 Step 1: Send OTP to Email
// ==========================================
export const sendResetOTP = async (email: string) => {
    try {
        console.log('📤 Sending forgot password request for:', email);

        const response = await fetch(`${API_URL}/api/auth/forgotPassword`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('❌ Backend Error:', {
                status: response.status,
                data: data,
            });
            throw new Error(data.msg || `فشل الطلب (${response.status})`);
        }

        console.log('✅ OTP sent successfully');
        return data;
    } catch (error) {
        console.error('❌ Send OTP Error:', error);
        throw error;
    }
};

// ==========================================
// ✅ Step 2: Verify OTP Code
// ==========================================
export const verifyResetOTP = async (email: string, otp: string) => {
    try {
        console.log('📤 Verifying OTP for:', email);

        const response = await fetch(`${API_URL}/api/auth/verifyResetCode`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, otp }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('❌ Backend Error:', {
                status: response.status,
                data: data,
            });
            throw new Error(data.msg || `فشل التحقق (${response.status})`);
        }

        console.log('✅ OTP verified successfully');
        return data;
    } catch (error) {
        console.error('❌ Verify OTP Error:', error);
        throw error;
    }
};

// ==========================================
// 🔐 Step 3: Reset Password
// ==========================================
export const resetPassword = async (
    email: string,
    otp: string,
    newPassword: string,
    confirmedNewPassword: string
) => {
    try {
        console.log('📤 Resetting password for:', email);

        const response = await fetch(`${API_URL}/api/auth/resetPassword`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                otp,
                newPassword,
                confirmedNewPassword,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('❌ Backend Error:', {
                status: response.status,
                data: data,
            });
            throw new Error(data.msg || `فشل إعادة تعيين كلمة المرور (${response.status})`);
        }

        console.log('✅ Password reset successfully');
        return data;
    } catch (error) {
        console.error('❌ Reset Password Error:', error);
        throw error;
    }
};
