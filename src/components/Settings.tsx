import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { 
  ArrowRight, 
  Save, 
  MapPin, 
  Image, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff,
  Upload,
  RefreshCw,
  Download,
  Shield,
  Monitor,
  Smartphone,
  Clock,
  MessageSquare,
  Palette,
  Type,
  Settings as SettingsIcon,
  X,
  CheckCircle,
  AlertCircle,
  Loader,
  Lock,
  Key
} from 'lucide-react';
import { Settings as SettingsType, BackgroundItem, COUNTRIES, CALCULATION_METHODS, MADHABS, FONT_FAMILIES, getRecommendedCalculationMethod, getRecommendedMadhab } from '../types';
import { getSettings, saveSettings, uploadBackgroundImage, addBackgroundToSettings, removeBackgroundFromSettings, deleteBackgroundImage, updateUserPassword } from '../utils/storage';
import LayoutColorSettings from './LayoutColorSettings';
import LocationPicker from './LocationPicker';

interface SettingsProps {
  onBack: () => void;
  onRefreshSettings: () => void;
  updateAvailable?: boolean;
  onUpdate?: () => void;
  onClearCache?: () => void;
  user: User | null;
  onLogout: () => void;
}

const Settings: React.FC<SettingsProps> = ({ 
  onBack, 
  onRefreshSettings, 
  updateAvailable, 
  onUpdate, 
  onClearCache,
  user,
  onLogout,
}) => {
  const [settings, setSettings] = useState<SettingsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<'basic' | 'security' | 'backgrounds' | 'layout' | 'content' | 'advanced'>('basic');
  const [previewMode, setPreviewMode] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  // تحميل الإعدادات عند بدء التشغيل
  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        const { settings: loadedSettings } = await getSettings(user);
        setSettings(loadedSettings);
      } catch (error) {
        console.error('خطأ في تحميل الإعدادات:', error);
        setSaveError('فشل في تحميل الإعدادات');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    
    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);

    try {
      await saveSettings(settings, user);
      setSaveSuccess(true);
      onRefreshSettings();
      
      // إخفاء رسالة النجاح بعد 3 ثوانٍ
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error: any) {
      console.error('خطأ في حفظ الإعدادات:', error);
      if (error.message === 'PERMISSION_DENIED') {
        setSaveError('تم حفظ الإعدادات محلياً فقط - يتطلب تحديث صلاحيات قاعدة البيانات');
      } else {
        setSaveError('حدث خطأ في حفظ الإعدادات');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // التحقق من نوع الملف
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      setSaveError('يرجى اختيار ملف صورة أو فيديو صالح');
      return;
    }

    // التحقق من حجم الملف (الحد الأقصى 10 ميجابايت)
    if (file.size > 10 * 1024 * 1024) {
      setSaveError('حجم الملف كبير جداً. الحد الأقصى 10 ميجابايت');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setSaveError('');

    try {
      // رفع الصورة إلى Firebase Storage
      const uploadedBackground = await uploadBackgroundImage(file, user, (progress) => {
        setUploadProgress(progress);
      });

      if (settings) {
        // إضافة الخلفية الجديدة إلى الإعدادات المحلية
        const updatedSettingsWithBackground = addBackgroundToSettings(settings, uploadedBackground);
        
        // تعيين الصورة المرفوعة كخلفية حالية
        const updatedSettings = {
          ...updatedSettingsWithBackground,
          selectedBackgroundId: uploadedBackground.id
        };
        
        // تحديث الحالة المحلية
        setSettings(updatedSettings);
        
        // حفظ الإعدادات النهائية
        await saveSettings(updatedSettings, user);
        
        // إشعار المكون الأب بالتحديث
        onRefreshSettings();
      }

      console.log('✅ تم رفع وحفظ الخلفية بنجاح');
      
    } catch (error: any) {
      console.error('💥 خطأ في رفع الصورة:', error);
      setSaveError(error.message || 'فشل في رفع الصورة');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      // إعادة تعيين قيمة input
      event.target.value = '';
    }
  };

  const handleDeleteBackground = async (backgroundId: string) => {
    if (!user || !settings) return;

    // التأكد من عدم حذف الخلفيات الافتراضية
    const background = settings.backgrounds.find(bg => bg.id === backgroundId);
    if (!background) return;

    // التحقق من أن هذه خلفية مرفوعة من المستخدم (تحتوي على Firebase Storage URL)
    if (!background.url.includes('firebasestorage.googleapis.com')) {
      setSaveError('لا يمكن حذف الخلفيات الافتراضية');
      return;
    }

    if (!confirm(`هل أنت متأكد من حذف الخلفية "${background.name}"؟`)) {
      return;
    }

    try {
      await deleteBackgroundImage(backgroundId, user);

      if (settings) {
        // حذف الخلفية من الإعدادات المحلية
        const updatedSettings = removeBackgroundFromSettings(settings, backgroundId);
        
        // تحديث الحالة المحلية
        setSettings(updatedSettings);
        
        // حفظ الإعدادات المحدثة
        await saveSettings(updatedSettings, user);
        
        // إشعار المكون الأب بالتحديث
        onRefreshSettings();
      }

      console.log('✅ تم حذف الخلفية بنجاح');
      
    } catch (error: any) {
      console.error('💥 خطأ في حذف الخلفية:', error);
      setSaveError(error.message || 'فشل في حذف الخلفية');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('كلمات المرور غير متطابقة');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setPasswordError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }
    
    setChangingPassword(true);
    setPasswordError('');
    setPasswordSuccess(false);
    
    try {
      await updateUserPassword(user, passwordData.newPassword);
      setPasswordSuccess(true);
      setPasswordData({ newPassword: '', confirmPassword: '' });
      
      // إخفاء رسالة النجاح بعد 3 ثوانٍ
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (error: any) {
      console.error('خطأ في تغيير كلمة المرور:', error);
      setPasswordError(error.message || 'فشل في تغيير كلمة المرور');
    } finally {
      setChangingPassword(false);
    }
  };

  const updateSettings = (updates: Partial<SettingsType>) => {
    if (!settings) return;
    setSettings({ ...settings, ...updates });
  };

  const updateLocation = (field: string, value: any) => {
    if (!settings) return;
    setSettings({
      ...settings,
      location: {
        ...settings.location,
        [field]: value
      }
    });
  };

  const updateIqamahDelay = (prayer: string, delay: number) => {
    if (!settings) return;
    setSettings({
      ...settings,
      iqamahDelays: {
        ...settings.iqamahDelays,
        [prayer]: delay
      }
    });
  };

  const updatePrayerTimeAdjustment = (prayer: string, minutes: number) => {
    if (!settings) return;
    setSettings({
      ...settings,
      prayerTimeAdjustments: {
        ...settings.prayerTimeAdjustments,
        [prayer]: minutes
      }
    });
  };

  const updatePrayerDuration = (prayer: string, duration: number) => {
    if (!settings) return;
    setSettings({
      ...settings,
      prayerDuration: {
        ...settings.prayerDuration,
        [prayer]: duration
      }
    });
  };

  const updateDuas = (index: number, value: string) => {
    if (!settings) return;
    const newDuas = [...settings.duas];
    newDuas[index] = value;
    setSettings({ ...settings, duas: newDuas });
  };

  const addDua = () => {
    if (!settings) return;
    setSettings({ ...settings, duas: [...settings.duas, ''] });
  };

  const removeDua = (index: number) => {
    if (!settings) return;
    const newDuas = settings.duas.filter((_, i) => i !== index);
    setSettings({ ...settings, duas: newDuas });
  };

  const updateAnnouncements = (index: number, value: string) => {
    if (!settings) return;
    const newAnnouncements = [...settings.announcements];
    newAnnouncements[index] = value;
    setSettings({ ...settings, announcements: newAnnouncements });
  };

  const addAnnouncement = () => {
    if (!settings) return;
    setSettings({ ...settings, announcements: [...settings.announcements, ''] });
  };

  const removeAnnouncement = (index: number) => {
    if (!settings) return;
    const newAnnouncements = settings.announcements.filter((_, i) => i !== index);
    setSettings({ ...settings, announcements: newAnnouncements });
  };

  if (loading || !settings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl font-medium">جاري تحميل الإعدادات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white p-4">
      <div className="max-w-6xl mx-auto">
        {/* الرأس */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300"
            >
              <ArrowRight className="w-5 h-5" />
              <span>العودة</span>
            </button>
            <div className="flex items-center gap-3">
              <SettingsIcon className="w-8 h-8 text-blue-400" />
              <h1 className="text-3xl font-bold">إعدادات المسجد</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* معلومات المستخدم */}
            {user && (
              <div className="flex items-center gap-3 px-4 py-2 bg-white/10 rounded-xl border border-white/20">
                <div className="text-sm">
                  <div className="font-medium">{user.email}</div>
                </div>
                <button
                  onClick={onLogout}
                  className="text-red-300 hover:text-red-200 transition-colors duration-300"
                  title="تسجيل الخروج"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* زر الحفظ */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-500 rounded-xl transition-all duration-300 font-medium"
            >
              {saving ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>حفظ</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* رسائل النجاح والخطأ */}
        {saveSuccess && (
          <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 mb-6 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-200" />
            <span className="text-green-200">تم حفظ الإعدادات بنجاح!</span>
          </div>
        )}

        {saveError && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-200" />
            <span className="text-red-200">{saveError}</span>
          </div>
        )}

        {/* التبويبات */}
        <div className="flex flex-wrap gap-2 mb-8 bg-white/5 p-2 rounded-xl">
          {[
            { key: 'basic', label: 'الأساسيات', icon: SettingsIcon },
            { key: 'security', label: 'الأمان', icon: Lock },
            { key: 'backgrounds', label: 'الخلفيات', icon: Image },
            { key: 'layout', label: 'التخطيط والألوان', icon: Palette },
            { key: 'content', label: 'المحتوى', icon: MessageSquare },
            { key: 'advanced', label: 'متقدم', icon: Clock }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                activeTab === tab.key
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* محتوى التبويبات */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
          {activeTab === 'basic' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold mb-6">الإعدادات الأساسية</h2>
              
              {/* اسم المسجد */}
              <div>
                <label className="block text-white/90 text-sm font-medium mb-2">
                  اسم المسجد
                </label>
                <input
                  type="text"
                  value={settings.mosqueName}
                  onChange={(e) => updateSettings({ mosqueName: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  placeholder="مسجد النور"
                />
              </div>

              {/* الموقع الجغرافي */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">
                    المدينة
                  </label>
                  <input
                    type="text"
                    value={settings.location.city}
                    onChange={(e) => updateLocation('city', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    placeholder="الرياض"
                  />
                </div>
                
                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">
                    الدولة
                  </label>
                  <select
                    value={settings.location.country}
                    onChange={(e) => updateLocation('country', e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  >
                    {COUNTRIES.map(country => (
                      <option key={country.key} value={country.name} className="bg-blue-900">
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-white/90 text-sm font-medium">
                    الموقع الجغرافي (خط العرض والطول)
                  </label>
                  <button
                    onClick={() => setShowLocationPicker(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-200 rounded-lg transition-all duration-300 text-sm"
                  >
                    <MapPin className="w-4 h-4" />
                    اختيار من الخريطة
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/70 text-xs mb-1">خط العرض</label>
                    <input
                      type="number"
                      step="any"
                      value={settings.location.latitude}
                      onChange={(e) => updateLocation('latitude', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-white/70 text-xs mb-1">خط الطول</label>
                    <input
                      type="number"
                      step="any"
                      value={settings.location.longitude}
                      onChange={(e) => updateLocation('longitude', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* طريقة الحساب والمذهب */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">
                    طريقة حساب أوقات الصلاة
                  </label>
                  <select
                    value={settings.calculationMethod}
                    onChange={(e) => updateSettings({ calculationMethod: e.target.value as any })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  >
                    {CALCULATION_METHODS.map(method => (
                      <option key={method.key} value={method.key} className="bg-blue-900">
                        {method.name} - {method.region}
                      </option>
                    ))}
                  </select>
                  {getRecommendedCalculationMethod(settings.location.country) !== settings.calculationMethod && (
                    <div className="mt-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-200 text-sm">
                      💡 الطريقة الموصى بها لـ {settings.location.country}: {CALCULATION_METHODS.find(m => m.key === getRecommendedCalculationMethod(settings.location.country))?.name}
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">
                    المذهب الفقهي
                  </label>
                  <select
                    value={settings.madhab}
                    onChange={(e) => updateSettings({ madhab: e.target.value as any })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  >
                    {MADHABS.map(madhab => (
                      <option key={madhab.key} value={madhab.key} className="bg-blue-900">
                        {madhab.name}
                      </option>
                    ))}
                  </select>
                  {getRecommendedMadhab(settings.location.country) !== settings.madhab && (
                    <div className="mt-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-200 text-sm">
                      💡 المذهب الموصى به لـ {settings.location.country}: {MADHABS.find(m => m.key === getRecommendedMadhab(settings.location.country))?.name}
                    </div>
                  )}
                  <div className="mt-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-200 text-sm">
                    <strong>ملاحظة:</strong> المذهب المالكي والشافعي متطابقان في حساب وقت العصر (طول الظل = 1)، بينما المذهب الحنفي يؤخر وقت العصر (طول الظل = 2).
                  </div>
                </div>
              </div>

              {/* وضع العرض ونوع الشاشة */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">
                    وضع العرض
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => updateSettings({ displayMode: 'landscape' })}
                      className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all duration-300 ${
                        settings.displayMode === 'landscape'
                          ? 'bg-blue-500/20 border-blue-500/30 text-blue-200'
                          : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      <Monitor className="w-5 h-5" />
                      <span>أفقي</span>
                    </button>
                    <button
                      onClick={() => updateSettings({ displayMode: 'portrait' })}
                      className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all duration-300 ${
                        settings.displayMode === 'portrait'
                          ? 'bg-blue-500/20 border-blue-500/30 text-blue-200'
                          : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      <Smartphone className="w-5 h-5" />
                      <span>طولي</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-white/90 text-sm font-medium mb-2">
                    نوع الشاشة
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => updateSettings({ screenType: 'dawahScreen' })}
                      className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all duration-300 ${
                        settings.screenType === 'dawahScreen'
                          ? 'bg-blue-500/20 border-blue-500/30 text-blue-200'
                          : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      <MessageSquare className="w-5 h-5" />
                      <span>دعوية</span>
                    </button>
                    <button
                      onClick={() => updateSettings({ screenType: 'prayerTimes' })}
                      className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all duration-300 ${
                        settings.screenType === 'prayerTimes'
                          ? 'bg-blue-500/20 border-blue-500/30 text-blue-200'
                          : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      <Clock className="w-5 h-5" />
                      <span>مواقيت</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold mb-6">إعدادات الأمان</h2>
              
              {/* تغيير كلمة المرور */}
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <Key className="w-5 h-5 text-yellow-400" />
                  تغيير كلمة المرور
                </h3>
                
                {/* رسائل النجاح والخطأ للكلمة المرور */}
                {passwordSuccess && (
                  <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-3 mb-4 flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-200" />
                    <span className="text-green-200">تم تغيير كلمة المرور بنجاح!</span>
                  </div>
                )}

                {passwordError && (
                  <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 mb-4 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-200" />
                    <span className="text-red-200">{passwordError}</span>
                  </div>
                )}
                
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/90 text-sm font-medium mb-2">
                        كلمة المرور الجديدة
                      </label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                        placeholder="••••••••"
                        required
                        disabled={changingPassword}
                        minLength={6}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-white/90 text-sm font-medium mb-2">
                        تأكيد كلمة المرور
                      </label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                        placeholder="••••••••"
                        required
                        disabled={changingPassword}
                        minLength={6}
                      />
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={changingPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                    className="flex items-center gap-2 px-6 py-3 bg-yellow-500/20 hover:bg-yellow-500/30 disabled:bg-gray-500/20 border border-yellow-500/30 disabled:border-gray-500/30 text-yellow-200 disabled:text-gray-400 rounded-xl transition-all duration-300 font-medium"
                  >
                    {changingPassword ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        <span>جاري تغيير كلمة المرور...</span>
                      </>
                    ) : (
                      <>
                        <Key className="w-4 h-4" />
                        <span>تغيير كلمة المرور</span>
                      </>
                    )}
                  </button>
                </form>
                
                <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-yellow-200 text-sm">
                    <strong>ملاحظة:</strong> كلمة المرور يجب أن تكون 6 أحرف على الأقل. بعد تغيير كلمة المرور، ستحتاج لتسجيل الدخول مرة أخرى.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'backgrounds' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">إدارة الخلفيات</h2>
                
                {/* زر رفع صورة جديدة */}
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="background-upload"
                    disabled={uploading}
                  />
                  <label
                    htmlFor="background-upload"
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 cursor-pointer ${
                      uploading
                        ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                        : 'bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-200'
                    }`}
                  >
                    {uploading ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        <span>جاري الرفع... {uploadProgress}%</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>رفع صورة جديدة</span>
                      </>
                    )}
                  </label>
                </div>
              </div>

              {/* شريط التقدم للرفع */}
              {uploading && (
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}

              {/* إعدادات تدوير الخلفيات */}
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-white">تدوير الخلفيات تلقائياً</h3>
                  <button
                    onClick={() => updateSettings({ rotateBackgrounds: !settings.rotateBackgrounds })}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                      settings.rotateBackgrounds
                        ? 'bg-green-500/20 text-green-200 border border-green-500/30'
                        : 'bg-gray-500/20 text-gray-200 border border-gray-500/30'
                    }`}
                  >
                    {settings.rotateBackgrounds ? 'مفعل' : 'معطل'}
                  </button>
                </div>
                
                {settings.rotateBackgrounds && (
                  <div>
                    <label className="block text-white/90 text-sm font-medium mb-2">
                      فترة التدوير (بالثواني): {settings.rotationInterval}
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="300"
                      step="10"
                      value={settings.rotationInterval}
                      onChange={(e) => updateSettings({ rotationInterval: parseInt(e.target.value) })}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                )}
              </div>

              {/* قائمة الخلفيات */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {settings.backgrounds.map((background) => (
                  <div
                    key={background.id}
                    className={`relative group bg-white/5 rounded-xl border overflow-hidden transition-all duration-300 ${
                      settings.selectedBackgroundId === background.id
                        ? 'border-blue-500/50 ring-2 ring-blue-500/30'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    {/* معاينة الخلفية */}
                    <div className="aspect-video relative overflow-hidden">
                      {background.type === 'image' ? (
                        <img
                          src={background.url}
                          alt={background.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.pexels.com/photos/96957/pexels-photo-96957.jpeg?auto=compress&cs=tinysrgb&w=400&h=225';
                          }}
                        />
                      ) : (
                        <video
                          src={background.url}
                          className="w-full h-full object-cover"
                          muted
                          loop
                          onMouseEnter={(e) => e.currentTarget.play()}
                          onMouseLeave={(e) => e.currentTarget.pause()}
                        />
                      )}
                      
                      {/* طبقة تراكب مع الأزرار */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                        <button
                          onClick={() => updateSettings({ selectedBackgroundId: background.id })}
                          className={`p-2 rounded-lg transition-all duration-300 ${
                            settings.selectedBackgroundId === background.id
                              ? 'bg-blue-500 text-white'
                              : 'bg-white/20 text-white hover:bg-white/30'
                          }`}
                          title="تحديد كخلفية"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {/* زر الحذف - فقط للخلفيات المرفوعة من المستخدم */}
                        {background.url.includes('firebasestorage.googleapis.com') && (
                          <button
                            onClick={() => handleDeleteBackground(background.id)}
                            className="p-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-200 rounded-lg transition-all duration-300"
                            title="حذف الخلفية"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* معلومات الخلفية */}
                    <div className="p-4">
                      <h4 className="font-medium text-white mb-2 truncate">{background.name}</h4>
                      <div className="flex items-center justify-between text-sm text-white/70">
                        <span className="capitalize">{background.type}</span>
                        {settings.selectedBackgroundId === background.id && (
                          <span className="text-blue-300 font-medium">محددة</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'layout' && (
            <LayoutColorSettings
              settings={settings}
              onSettingsChange={setSettings}
              previewMode={previewMode}
              onPreviewModeChange={setPreviewMode}
            />
          )}

          {activeTab === 'content' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold mb-6">إدارة المحتوى</h2>
              
              {/* الأدعية */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">الأدعية والأذكار</h3>
                  <button
                    onClick={addDua}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-200 rounded-lg transition-all duration-300"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة دعاء</span>
                  </button>
                </div>
                
                <div className="space-y-4">
                  {settings.duas.map((dua, index) => (
                    <div key={index} className="flex gap-3">
                      <textarea
                        value={dua}
                        onChange={(e) => updateDuas(index, e.target.value)}
                        className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none"
                        rows={2}
                        placeholder="أدخل الدعاء هنا..."
                      />
                      <button
                        onClick={() => removeDua(index)}
                        className="p-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-200 rounded-xl transition-all duration-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* الإعلانات */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">إعلانات المسجد</h3>
                  <button
                    onClick={addAnnouncement}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-200 rounded-lg transition-all duration-300"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة إعلان</span>
                  </button>
                </div>
                
                <div className="space-y-4">
                  {settings.announcements.map((announcement, index) => (
                    <div key={index} className="flex gap-3">
                      <textarea
                        value={announcement}
                        onChange={(e) => updateAnnouncements(index, e.target.value)}
                        className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none"
                        rows={2}
                        placeholder="أدخل الإعلان هنا..."
                      />
                      <button
                        onClick={() => removeAnnouncement(index)}
                        className="p-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-200 rounded-xl transition-all duration-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* أذكار ما بعد الصلاة */}
              <div>
                <h3 className="text-xl font-semibold mb-4">أذكار ما بعد الصلاة</h3>
                <textarea
                  value={settings.postPrayerDhikrText}
                  onChange={(e) => updateSettings({ postPrayerDhikrText: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none"
                  rows={8}
                  placeholder="أدخل أذكار ما بعد الصلاة هنا..."
                />
              </div>

              {/* إعدادات إظهار النوافذ */}
              <div className="border-t border-white/10 pt-8">
                <h3 className="text-xl font-semibold mb-6">إعدادات عرض النوافذ</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* إظهار نافذة الأدعية */}
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                    <div>
                      <h4 className="font-medium text-white mb-1">نافذة الأدعية والأذكار</h4>
                      <p className="text-sm text-white/70">إظهار أو إخفاء نافذة الأدعية والأذكار في الشاشة الرئيسية</p>
                    </div>
                    <button
                      onClick={() => updateSettings({ showDuasPanel: !settings.showDuasPanel })}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                        settings.showDuasPanel
                          ? 'bg-green-500/20 text-green-200 border border-green-500/30'
                          : 'bg-gray-500/20 text-gray-200 border border-gray-500/30'
                      }`}
                    >
                      {settings.showDuasPanel ? 'مرئية' : 'مخفية'}
                    </button>
                  </div>

                  {/* إظهار نافذة الإعلانات */}
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                    <div>
                      <h4 className="font-medium text-white mb-1">نافذة إعلانات المسجد</h4>
                      <p className="text-sm text-white/70">إظهار أو إخفاء نافذة إعلانات المسجد في الشاشة الرئيسية</p>
                    </div>
                    <button
                      onClick={() => updateSettings({ showAnnouncementsPanel: !settings.showAnnouncementsPanel })}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                        settings.showAnnouncementsPanel
                          ? 'bg-green-500/20 text-green-200 border border-green-500/30'
                          : 'bg-gray-500/20 text-gray-200 border border-gray-500/30'
                      }`}
                    >
                      {settings.showAnnouncementsPanel ? 'مرئية' : 'مخفية'}
                    </button>
                  </div>
                </div>

                {/* ملاحظة */}
                <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-blue-200 text-sm">
                    <strong>ملاحظة:</strong> عند إخفاء إحدى النوافذ، ستتوسع النافذة الأخرى لتملأ المساحة المتاحة في الشاشة الدعوية. في شاشة مواقيت الصلاة، ستظهر النوافذ المرئية فقط في القسم السفلي.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold mb-6">الإعدادات المتقدمة</h2>
              
              {/* تأخير الإقامة */}
              <div>
                <h3 className="text-xl font-semibold mb-4">تأخير الإقامة (بالدقائق)</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {[
                    { key: 'fajr', name: 'الفجر' },
                    { key: 'sunrise', name: 'الشروق' },
                    { key: 'dhuhr', name: 'الظهر' },
                    { key: 'asr', name: 'العصر' },
                    { key: 'maghrib', name: 'المغرب' },
                    { key: 'isha', name: 'العشاء' }
                  ].map((prayer) => (
                    <div key={prayer.key}>
                      <label className="block text-white/90 text-sm font-medium mb-2">
                        {prayer.name}
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="60"
                        value={settings.iqamahDelays[prayer.key as keyof typeof settings.iqamahDelays]}
                        onChange={(e) => updateIqamahDelay(prayer.key, parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* تعديل أوقات الأذان */}
              <div>
                <h3 className="text-xl font-semibold mb-4">تعديل أوقات الأذان (بالدقائق)</h3>
                <p className="text-white/70 text-sm mb-4">
                  يمكنك إضافة أو طرح دقائق من الأوقات المحسوبة تلقائياً لكل صلاة. القيم الموجبة تؤخر الوقت والقيم السالبة تقدمه.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {[
                    { key: 'fajr', name: 'الفجر' },
                    { key: 'sunrise', name: 'الشروق' },
                    { key: 'dhuhr', name: 'الظهر' },
                    { key: 'asr', name: 'العصر' },
                    { key: 'maghrib', name: 'المغرب' },
                    { key: 'isha', name: 'العشاء' }
                  ].map((prayer) => (
                    <div key={prayer.key}>
                      <label className="block text-white/90 text-sm font-medium mb-2">
                        {prayer.name}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="-30"
                          max="30"
                          value={settings.prayerTimeAdjustments[prayer.key as keyof typeof settings.prayerTimeAdjustments]}
                          onChange={(e) => updatePrayerTimeAdjustment(prayer.key, parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                        />
                        <span className="text-white/60 text-xs">د</span>
                      </div>
                      <div className="mt-1 text-xs text-white/50">
                        {settings.prayerTimeAdjustments[prayer.key as keyof typeof settings.prayerTimeAdjustments] > 0 
                          ? `+${settings.prayerTimeAdjustments[prayer.key as keyof typeof settings.prayerTimeAdjustments]} دقيقة` 
                          : settings.prayerTimeAdjustments[prayer.key as keyof typeof settings.prayerTimeAdjustments] < 0
                          ? `${settings.prayerTimeAdjustments[prayer.key as keyof typeof settings.prayerTimeAdjustments]} دقيقة`
                          : 'بدون تعديل'
                        }
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-yellow-200 text-sm">
                    <strong>ملاحظة:</strong> هذه التعديلات تطبق على الأوقات المحسوبة تلقائياً وتؤثر على جميع العمليات المرتبطة بأوقات الصلاة مثل العد التنازلي وشاشات الصلاة.
                  </p>
                </div>
              </div>
              {/* مدة الصلاة */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">مدة الصلاة (بالدقائق)</h3>
                  <button
                    onClick={() => updateSettings({ enablePrayerInProgressScreen: !settings.enablePrayerInProgressScreen })}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                      settings.enablePrayerInProgressScreen
                        ? 'bg-green-500/20 text-green-200 border border-green-500/30'
                        : 'bg-gray-500/20 text-gray-200 border border-gray-500/30'
                    }`}
                  >
                    {settings.enablePrayerInProgressScreen ? 'مفعل' : 'معطل'}
                  </button>
                </div>
                
                {settings.enablePrayerInProgressScreen && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {[
                      { key: 'fajr', name: 'الفجر' },
                      { key: 'sunrise', name: 'الشروق' },
                      { key: 'dhuhr', name: 'الظهر' },
                      { key: 'asr', name: 'العصر' },
                      { key: 'maghrib', name: 'المغرب' },
                      { key: 'isha', name: 'العشاء' }
                    ].map((prayer) => (
                      <div key={prayer.key}>
                        <label className="block text-white/90 text-sm font-medium mb-2">
                          {prayer.name}
                        </label>
                        <input
                          type="number"
                          min="5"
                          max="30"
                          value={settings.prayerDuration[prayer.key as keyof typeof settings.prayerDuration]}
                          onChange={(e) => updatePrayerDuration(prayer.key, parseInt(e.target.value) || 10)}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* أذكار ما بعد الصلاة */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">شاشة أذكار ما بعد الصلاة</h3>
                  <button
                    onClick={() => updateSettings({ enablePostPrayerDhikrScreen: !settings.enablePostPrayerDhikrScreen })}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                      settings.enablePostPrayerDhikrScreen
                        ? 'bg-green-500/20 text-green-200 border border-green-500/30'
                        : 'bg-gray-500/20 text-gray-200 border border-gray-500/30'
                    }`}
                  >
                    {settings.enablePostPrayerDhikrScreen ? 'مفعل' : 'معطل'}
                  </button>
                </div>
                
                {settings.enablePostPrayerDhikrScreen && (
                  <div>
                    <label className="block text-white/90 text-sm font-medium mb-2">
                      مدة عرض الأذكار (بالدقائق): {settings.postPrayerDhikrDuration}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="15"
                      step="1"
                      value={settings.postPrayerDhikrDuration}
                      onChange={(e) => updateSettings({ postPrayerDhikrDuration: parseInt(e.target.value) })}
                      className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                )}
              </div>

              {/* إعدادات التطبيق */}
              <div className="border-t border-white/10 pt-8">
                <h3 className="text-xl font-semibold mb-4">إعدادات التطبيق</h3>
                <div className="flex flex-wrap gap-4">
                  {updateAvailable && onUpdate && (
                    <button
                      onClick={onUpdate}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-200 rounded-lg transition-all duration-300"
                    >
                      <Download className="w-4 h-4" />
                      <span>تحديث التطبيق</span>
                    </button>
                  )}
                  
                  {onClearCache && (
                    <button
                      onClick={onClearCache}
                      className="flex items-center gap-2 px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 text-orange-200 rounded-lg transition-all duration-300"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>مسح التخزين المؤقت</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showLocationPicker && (
        <LocationPicker
          latitude={settings.location.latitude}
          longitude={settings.location.longitude}
          onLocationChange={(lat, lng) => {
            updateLocation('latitude', lat);
            updateLocation('longitude', lng);
          }}
          onClose={() => setShowLocationPicker(false)}
        />
      )}
    </div>
  );
};

export default Settings;