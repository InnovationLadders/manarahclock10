import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useSearchParams } from 'react-router-dom';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from './firebase';
import { usePrayerTimes } from './hooks/usePrayerTimes';
import { useCurrentTime } from './hooks/useTime';
import { getScreenState } from './utils/prayerCalculations';
import MainDisplay from './components/MainDisplay';
import Settings from './components/Settings';
import Login from './components/Login';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './components/AdminPanel';
import PrayerInProgressScreen from './components/PrayerInProgressScreen';
import PostPrayerDhikrScreen from './components/PostPrayerDhikrScreen';
import { usePWAUpdate } from './hooks/usePWAUpdate';
import MosquesLandingPage from './components/MosquesLandingPage';
import { checkAdminStatus } from './utils/adminUtils';
import { Settings as SettingsIcon, Maximize, Minimize } from 'lucide-react';

const MainApp: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const { updateAvailable, reloadApp, clearCache } = usePWAUpdate();
  const [showControls, setShowControls] = useState(true);
  const [manualScreenOverride, setManualScreenOverride] = useState<'mainDisplay' | null>(null);
  const hideTimer = useRef<NodeJS.Timeout | null>(null);
  const currentTime = useCurrentTime();
  
  // الحصول على mosqueId من URL parameters
  const mosqueId = searchParams.get('mosqueId');
  
  console.log('🔗 [App] URL Parameters - mosqueId:', mosqueId);
  console.log('🔗 [App] نوع mosqueId:', typeof mosqueId, 'القيمة:', JSON.stringify(mosqueId));
  console.log('🔗 [App] جميع معاملات URL:', Object.fromEntries(searchParams.entries()));
  
  // إذا لم يكن هناك mosqueId، توجيه المستخدم إلى الصفحة الرئيسية
  useEffect(() => {
    if (!mosqueId) {
      console.log('❌ [App] لا يوجد mosqueId، توجيه للصفحة الرئيسية');
      navigate('/', { replace: true });
    } else {
      console.log('✅ [App] تم العثور على mosqueId:', mosqueId);
    }
  }, [mosqueId, navigate]);
  
  const { prayerTimes, settings, mosqueFound, refreshSettings, loading } = usePrayerTimes(user, mosqueId || undefined);

  // تحديد حالة الشاشة التلقائية
  const automaticScreenState = (prayerTimes && settings) ? getScreenState(prayerTimes, settings) : { state: 'mainDisplay' as const };
  
  // تحديد حالة الشاشة الفعلية (مع مراعاة التجاوز اليدوي)
  const effectiveScreenState = manualScreenOverride ? { state: manualScreenOverride } : automaticScreenState;

  // دالة للخروج من الشاشات الخاصة والعودة للشاشة الرئيسية
  const handleExitSpecialScreen = () => {
    // تعيين تجاوز يدوي للعودة للشاشة الرئيسية
    setManualScreenOverride('mainDisplay');
  };

  // تحديد وضع العرض
  const isPortrait = settings.displayMode === 'portrait';

  useEffect(() => {
    // مراقبة حالة المصادقة
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        // Check if user is admin
        const isAdmin = await checkAdminStatus(user);
        setUserIsAdmin(isAdmin);
      } else {
        setUserIsAdmin(false);
      }
      
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // مراقبة تغييرات وضع ملء الشاشة
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // مراقبة حالة الشاشة التلقائية لإلغاء التجاوز اليدوي عند الحاجة
  useEffect(() => {
    // إذا كان هناك تجاوز يدوي وأصبحت الحالة التلقائية هي الشاشة الرئيسية
    // فهذا يعني أن الفترة الخاصة انتهت طبيعياً، يمكن إلغاء التجاوز اليدوي
    if (manualScreenOverride === 'mainDisplay' && automaticScreenState.state === 'mainDisplay') {
      setManualScreenOverride(null);
    }
  }, [automaticScreenState.state, manualScreenOverride]);

  // إخفاء الأزرار تلقائياً بعد 5 ثوانٍ من التحميل
  useEffect(() => {
    const initialTimer = setTimeout(() => {
      setShowControls(false);
    }, 5000);

    return () => clearTimeout(initialTimer);
  }, []);

  // إظهار الأزرار عند تمرير الماوس
  const handleMouseEnter = () => {
    if (hideTimer.current) {
      clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
    setShowControls(true);
  };

  // إخفاء الأزرار بعد 30 ثانية من مغادرة الماوس
  const handleMouseLeave = () => {
    hideTimer.current = setTimeout(() => {
      setShowControls(false);
    }, 30000);
  };

  const handleSettingsClick = () => {
    // Always show login page when settings is clicked
    setShowLogin(true);
  };

  const handleLoginSuccess = (user: User) => {
    setShowLogin(false);
    setShowSettings(true);
  };

  const handleAdminLoginSuccess = (user: User) => {
    setUser(user);
    setUserIsAdmin(true);
    navigate('/admin-panel');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setShowSettings(false);
      setUserIsAdmin(false);
      navigate('/');
    } catch (error) {
      console.error('خطأ في تسجيل الخروج:', error);
    }
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        // الدخول في وضع ملء الشاشة
        await document.documentElement.requestFullscreen();
      } else {
        // الخروج من وضع ملء الشاشة
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('خطأ في تبديل وضع ملء الشاشة:', error);
    }
  };

  // عرض شاشة تسجيل الدخول
  if (showLogin) {
    return (
      <Login
        onLoginSuccess={handleLoginSuccess}
        onBack={() => setShowLogin(false)}
      />
    );
  }

  // عرض شاشة الإعدادات
  if (showSettings) {
    return (
      <Settings
        onBack={() => setShowSettings(false)}
        onRefreshSettings={refreshSettings}
        updateAvailable={updateAvailable}
        onUpdate={reloadApp}
        onClearCache={clearCache}
        user={user}
        onLogout={handleLogout}
      />
    );
  }

  // إذا لم يكن هناك mosqueId، لا تعرض شيئاً (سيتم التوجيه للصفحة الرئيسية)
  if (!mosqueId) {
    return null;
  }

  // عرض شاشة تحميل جميلة أثناء تحميل البيانات
  if (loading || !prayerTimes || !settings) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-emerald-900 via-blue-900 to-purple-900 text-white relative overflow-hidden">
        {/* خلفية إسلامية متحركة */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 border-4 border-white/30 rotate-45 rounded-lg animate-spin-slow"></div>
          <div className="absolute top-32 right-20 w-24 h-24 border-4 border-white/20 rotate-12 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 left-32 w-40 h-40 border-4 border-white/25 -rotate-12 rounded-lg animate-spin-slow"></div>
          <div className="absolute bottom-40 right-16 w-28 h-28 border-4 border-white/20 rotate-45 rounded-full animate-pulse"></div>
        </div>

        <div className="text-center z-10 max-w-md mx-auto p-8">
          {/* الشعار */}
          <div className="mb-8 flex justify-center">
            <img
              src="/logo MANARAH 25.svg"
              alt="شعار منارة"
              className="w-24 h-24 object-contain drop-shadow-2xl animate-pulse"
            />
          </div>

          {/* دائرة التحميل */}
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 border-8 border-white/20 rounded-full"></div>
            <div className="absolute inset-0 border-8 border-t-white border-r-white/50 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          </div>

          {/* رسالة التحميل */}
          <h2 className="text-3xl font-bold mb-4 drop-shadow-2xl animate-pulse" style={{ fontFamily: 'Amiri, serif' }}>
            جاري تحميل بيانات المسجد
          </h2>

          <p className="text-xl text-emerald-200 mb-6 drop-shadow-lg" style={{ fontFamily: 'Cairo, sans-serif' }}>
            يرجى الانتظار قليلاً...
          </p>

          {/* نقاط متحركة */}
          <div className="flex justify-center gap-2 mb-8">
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>

          {/* زر العودة للطوارئ */}
          <button
            onClick={() => navigate('/', { replace: true })}
            className="mt-4 px-6 py-3 bg-white/20 hover:bg-white/30 border border-white/30 rounded-xl transition-all duration-300 flex items-center gap-2 mx-auto text-white backdrop-blur-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>العودة للصفحة الرئيسية</span>
          </button>
        </div>
      </div>
    );
  }

  // عرض شاشة الصلاة
  if (effectiveScreenState.state === 'prayerInProgress') {
    return (
      <PrayerInProgressScreen
        currentTime={currentTime}
        settings={settings}
        onExit={handleExitSpecialScreen}
      />
    );
  }

  // عرض شاشة أذكار ما بعد الصلاة
  if (effectiveScreenState.state === 'postPrayerDhikr') {
    return (
      <PostPrayerDhikrScreen
        settings={settings}
        remainingTime={automaticScreenState.remainingTime || 0}
        onExit={handleExitSpecialScreen}
      />
    );
  }

  return (
    <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <MainDisplay user={user} mosqueFound={mosqueFound} mosqueId={mosqueId} />
      
      {/* أزرار التحكم */}
      <div className={`fixed flex gap-3 z-50 transition-all duration-300 ${
        isPortrait 
          ? 'top-24 right-8 transform -rotate-90 origin-top-right' 
          : 'top-4 right-4'
      } ${
        showControls 
          ? 'opacity-100 pointer-events-auto' 
          : 'opacity-0 pointer-events-none'
      }`}>
        {/* زر ملء الشاشة */}
        <button
          onClick={toggleFullscreen}
          className={`p-3 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full border border-white/20 transition-all duration-300 ${
            isPortrait ? 'transform rotate-90' : ''
          }`}
          title={isFullscreen ? "الخروج من ملء الشاشة" : "ملء الشاشة"}
        >
          {isFullscreen ? (
            <Minimize className={`w-6 h-6 text-white ${isPortrait ? 'transform -rotate-90' : ''}`} />
          ) : (
            <Maximize className={`w-6 h-6 text-white ${isPortrait ? 'transform -rotate-90' : ''}`} />
          )}
        </button>

        {/* زر الإعدادات */}
        <button
          onClick={handleSettingsClick}
          className={`p-3 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-full border border-white/20 transition-all duration-300 ${
            isPortrait ? 'transform rotate-90' : ''
          }`}
          title={user ? "الإعدادات" : "تسجيل الدخول"}
        >
          <SettingsIcon className={`w-6 h-6 text-white ${user ? '' : 'animate-pulse'} ${isPortrait ? 'transform -rotate-90' : ''}`} />
        </button>
      </div>

    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MosquesLandingPage />} />
        <Route path="/admin-login" element={<AdminLogin onLoginSuccess={(user) => window.location.href = '/admin-panel'} onBack={() => window.location.href = '/'} />} />
        <Route path="/admin-panel" element={<AdminPanel user={null} onLogout={() => { signOut(auth); window.location.href = '/'; }} onBack={() => window.location.href = '/'} />} />
        <Route path="/display" element={<MainApp />} />
      </Routes>
    </Router>
  );
}

export default App;