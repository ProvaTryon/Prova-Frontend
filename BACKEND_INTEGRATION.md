# 🔗 دليل ربط Frontend بـ Backend

## ✅ ما تم عمله:

### 1. Backend (Express.js)
- ✅ تم تحديث CORS للسماح بـ `http://localhost:3000`
- ✅ Auth APIs جاهزة على `/api/auth/*`
- ✅ Backend شغال على `http://localhost:5000`

### 2. Frontend (Next.js)
- ✅ تم إنشاء `lib/auth-service.ts` - خدمة API
- ✅ تم إنشاء `lib/auth-context-real.tsx` - Context يستخدم API حقيقي
- ✅ تم إنشاء `.env.local` - إعدادات البيئة

---

## 🚀 كيفية التفعيل:

### الطريقة الأولى: استبدال ملف auth-context.tsx

```bash
# احفظ النسخة القديمة (Mock)
cd frontend
mv lib/auth-context.tsx lib/auth-context-mock.tsx

# استخدم النسخة الجديدة (Real API)
mv lib/auth-context-real.tsx lib/auth-context.tsx
```

### الطريقة الثانية: تعديل يدوي

افتح `frontend/app/layout.tsx` وغيّر:

```tsx
// من:
import { AuthProvider } from "@/lib/auth-context"

// إلى:
import { AuthProvider } from "@/lib/auth-context-real"
```

---

## 🧪 اختبار الربط:

### 1. تأكد من تشغيل Backend:
```bash
cd backend-web
npm run dev
# يجب أن ترى: Server is running on port 5000
```

### 2. تأكد من تشغيل Frontend:
```bash
cd frontend
pnpm dev
# يجب أن ترى: ready - started server on http://localhost:3000
```

### 3. جرب التسجيل:
1. اذهب إلى: http://localhost:3000/en/signup
2. سجل حساب جديد
3. إذا نجح، سترى Token في Console
4. سيتم تحويلك للصفحة الرئيسية

### 4. جرب تسجيل الدخول:
1. اذهب إلى: http://localhost:3000/en/login
2. استخدم البيانات التي سجلتها
3. إذا نجح، سيتم تسجيل دخولك

---

## 🔍 التحقق من نجاح الربط:

### في Browser Console (F12):
```javascript
// تحقق من وجود Token
localStorage.getItem('authToken')
// يجب أن ترى: JWT Token طويل

// تحقق من بيانات المستخدم
JSON.parse(localStorage.getItem('user'))
// يجب أن ترى: {id, name, email, role}
```

### في Network Tab:
عند تسجيل الدخول/التسجيل، يجب أن ترى:
- `POST http://localhost:5000/api/auth/login` - Status 200
- Response: `{success: true, token: "...", user: {...}}`

---

## 🐛 حل المشاكل:

### ❌ خطأ: "CORS policy blocked"
**الحل:**
```bash
# تأكد من تشغيل Backend على port 5000
# تأكد من تشغيل Frontend على port 3000
```

### ❌ خطأ: "Network request failed"
**الحل:**
```bash
# تأكد من أن Backend شغال
curl http://localhost:5000/health
# يجب أن ترى: {"status":"OK"}
```

### ❌ خطأ: "Token invalid"
**الحل:**
```javascript
// امسح البيانات القديمة
localStorage.clear()
// سجل دخول مرة أخرى
```

---

## 📊 المقارنة:

| الميزة | Mock (القديم) | Real API (الجديد) |
|-------|-------------|------------------|
| البيانات | مخزنة في الكود | مخزنة في MongoDB |
| المستخدمين | 3 مستخدمين ثابتين | غير محدود |
| Token | لا يوجد | JWT حقيقي |
| الأمان | ضعيف | قوي (bcrypt + JWT) |
| التطوير | سريع | واقعي |

---

## 🎯 الخطوات التالية:

بعد التأكد من نجاح الربط:

1. ✅ ربط Products API
2. ✅ ربط Orders API
3. ✅ ربط Cart API
4. ✅ إضافة Upload للصور
5. ✅ إضافة Pagination
6. ✅ إضافة Search & Filter

---

## 📝 ملاحظات مهمة:

⚠️ **في Development:**
- استخدم `http://localhost:5000` للـ Backend
- استخدم `http://localhost:3000` للـ Frontend

⚠️ **في Production:**
- غيّر `NEXT_PUBLIC_API_URL` في `.env.local`
- مثال: `https://api.yoursite.com`

⚠️ **الأمان:**
- لا ترفع `.env.local` على Git
- غيّر `JWT_SECRET` في Production
- استخدم HTTPS في Production
