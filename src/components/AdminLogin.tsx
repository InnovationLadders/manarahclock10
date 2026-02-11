import React, { useState } from 'react';
import { signInWithEmailAndPassword, User } from 'firebase/auth';
import { auth } from '../firebase';
import { checkAdminStatus } from '../utils/adminUtils';
import { Eye, EyeOff, LogIn, ArrowRight, Shield } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: (user: User) => void;
  onBack: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Authenticate user
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Check if user has admin privileges
      const isAdmin = await checkAdminStatus(user);
      
      if (isAdmin) {
        console.log('✅ Admin login successful');
        onLoginSuccess(user);
      } else {
        console.log('❌ User is not an admin');
        setError('ليس لديك صلاحيات إدارية للوصول إلى هذه الصفحة');
        // Sign out the user since they're not an admin
        await auth.signOut();
      }
    } catch (error: any) {
      console.error('خطأ في تسجيل دخول المسؤول:', error);
      
      // Translate error messages to Arabic
      switch (error.code) {
        case 'auth/user-not-found':
          setError('البريد الإلكتروني غير مسجل');
          break;
        case 'auth/wrong-password':
          setError('كلمة المرور غير صحيحة');
          break;
        case 'auth/invalid-email':
          setError('البريد الإلكتروني غير صالح');
          break;
        case 'auth/too-many-requests':
          setError('تم تجاوز عدد المحاولات المسموح، حاول مرة أخرى لاحقاً');
          break;
        case 'auth/network-request-failed':
          setError('خطأ في الاتصال بالإنترنت');
          break;
        default:
          setError('حدث خطأ في تسجيل الدخول، حاول مرة أخرى');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-gray-900 flex items-center justify-center p-4">
      {/* خلفية متحركة */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* زر العودة */}
        <button
          onClick={onBack}
          className="absolute -top-16 right-0 flex items-center gap-2 text-white/70 hover:text-white transition-colors duration-300"
        >
          <ArrowRight className="w-5 h-5" />
          <span>العودة</span>
        </button>

        {/* بطاقة تسجيل الدخول */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
          {/* الشعار والعنوان */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">تسجيل دخول المسؤول</h1>
            <p className="text-white/70">ادخل بيانات حساب المسؤول</p>
          </div>

          {/* نموذج تسجيل الدخول */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* حقل البريد الإلكتروني */}
            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all duration-300"
                placeholder="admin@example.com"
                required
                disabled={loading}
              />
            </div>

            {/* حقل كلمة المرور */}
            <div>
              <label className="block text-white/90 text-sm font-medium mb-2">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all duration-300 pr-12"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors duration-300"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* رسالة الخطأ */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 text-red-200 text-sm text-center">
                {error}
              </div>
            )}

            {/* زر تسجيل الدخول */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>جاري تسجيل الدخول...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Shield className="w-5 h-5" />
                  <span>دخول لوحة التحكم</span>
                </div>
              )}
            </button>
          </form>

          {/* معلومات إضافية */}
          <div className="mt-6 text-center">
            <p className="text-white/50 text-xs">
              هذه الصفحة مخصصة للمسؤولين فقط
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;