import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { 
  ArrowRight, 
  Shield, 
  Users, 
  UserPlus, 
  Settings as SettingsIcon,
  CheckCircle,
  AlertCircle,
  Loader,
  X,
  MapPin,
  Mail,
  Lock
} from 'lucide-react';
import { createMosqueUser } from '../utils/storage';
import { getAllMosques } from '../utils/mosqueUtils';
import { MosqueData, COUNTRIES } from '../types';

interface AdminPanelProps {
  user: User | null;
  onLogout: () => void;
  onBack: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ user, onLogout, onBack }) => {
  const [activeTab, setActiveTab] = useState<'mosques' | 'admin'>('mosques');
  const [mosques, setMosques] = useState<MosqueData[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Form state for creating new mosque
  const [newMosque, setNewMosque] = useState({
    email: '',
    password: '',
    mosqueName: '',
    city: '',
    country: 'المملكة العربية السعودية',
    latitude: 24.7136,
    longitude: 46.6753
  });

  // Load mosques on component mount
  useEffect(() => {
    loadMosques();
  }, []);

  const loadMosques = async () => {
    setLoading(true);
    try {
      const mosquesData = await getAllMosques();
      setMosques(mosquesData);
    } catch (error) {
      console.error('خطأ في تحميل المساجد:', error);
      setErrorMessage('فشل في تحميل قائمة المساجد');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMosque = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await createMosqueUser(
        newMosque.email,
        newMosque.password,
        newMosque.mosqueName,
        {
          latitude: newMosque.latitude,
          longitude: newMosque.longitude,
          city: newMosque.city,
          country: newMosque.country
        }
      );

      setSuccessMessage(`تم إنشاء حساب المسجد "${newMosque.mosqueName}" بنجاح!`);
      
      // Reset form
      setNewMosque({
        email: '',
        password: '',
        mosqueName: '',
        city: '',
        country: 'المملكة العربية السعودية',
        latitude: 24.7136,
        longitude: 46.6753
      });

      // Reload mosques list
      await loadMosques();

      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error: any) {
      console.error('خطأ في إنشاء حساب المسجد:', error);
      setErrorMessage(error.message || 'فشل في إنشاء حساب المسجد');
    } finally {
      setCreating(false);
    }
  };

  const clearMessages = () => {
    setSuccessMessage('');
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
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
              <Shield className="w-8 h-8 text-red-400" />
              <h1 className="text-3xl font-bold">لوحة تحكم المسؤول</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* معلومات المستخدم */}
            {user && (
              <div className="flex items-center gap-3 px-4 py-2 bg-white/10 rounded-xl border border-white/20">
                <div className="text-sm">
                  <div className="font-medium">{user.email}</div>
                  <div className="text-red-300 text-xs">مسؤول</div>
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
          </div>
        </div>

        {/* رسائل النجاح والخطأ */}
        {successMessage && (
          <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-200" />
              <span className="text-green-200">{successMessage}</span>
            </div>
            <button onClick={clearMessages} className="text-green-200 hover:text-green-100">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-200" />
              <span className="text-red-200">{errorMessage}</span>
            </div>
            <button onClick={clearMessages} className="text-red-200 hover:text-red-100">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* التبويبات */}
        <div className="flex gap-2 mb-8 bg-white/5 p-2 rounded-xl">
          <button
            onClick={() => setActiveTab('mosques')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              activeTab === 'mosques'
                ? 'bg-red-500 text-white shadow-lg'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>إدارة حسابات المساجد</span>
          </button>
          
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
              activeTab === 'admin'
                ? 'bg-red-500 text-white shadow-lg'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <SettingsIcon className="w-4 h-4" />
            <span>إدارة حساب المسؤول</span>
          </button>
        </div>

        {/* محتوى التبويبات */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
          {activeTab === 'mosques' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold mb-6">إدارة حسابات المساجد</h2>
              
              {/* نموذج إنشاء مسجد جديد */}
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-green-400" />
                  إنشاء حساب مسجد جديد
                </h3>
                
                <form onSubmit={handleCreateMosque} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* البريد الإلكتروني */}
                    <div>
                      <label className="block text-white/90 text-sm font-medium mb-2">
                        <Mail className="w-4 h-4 inline mr-2" />
                        البريد الإلكتروني
                      </label>
                      <input
                        type="email"
                        value={newMosque.email}
                        onChange={(e) => setNewMosque({ ...newMosque, email: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
                        placeholder="mosque@example.com"
                        required
                        disabled={creating}
                      />
                    </div>

                    {/* كلمة المرور */}
                    <div>
                      <label className="block text-white/90 text-sm font-medium mb-2">
                        <Lock className="w-4 h-4 inline mr-2" />
                        كلمة المرور
                      </label>
                      <input
                        type="password"
                        value={newMosque.password}
                        onChange={(e) => setNewMosque({ ...newMosque, password: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
                        placeholder="••••••••"
                        required
                        disabled={creating}
                        minLength={6}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* اسم المسجد */}
                    <div>
                      <label className="block text-white/90 text-sm font-medium mb-2">
                        اسم المسجد
                      </label>
                      <input
                        type="text"
                        value={newMosque.mosqueName}
                        onChange={(e) => setNewMosque({ ...newMosque, mosqueName: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
                        placeholder="مسجد النور"
                        required
                        disabled={creating}
                      />
                    </div>

                    {/* المدينة */}
                    <div>
                      <label className="block text-white/90 text-sm font-medium mb-2">
                        <MapPin className="w-4 h-4 inline mr-2" />
                        المدينة
                      </label>
                      <input
                        type="text"
                        value={newMosque.city}
                        onChange={(e) => setNewMosque({ ...newMosque, city: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
                        placeholder="الرياض"
                        required
                        disabled={creating}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* الدولة */}
                    <div>
                      <label className="block text-white/90 text-sm font-medium mb-2">
                        الدولة
                      </label>
                      <select
                        value={newMosque.country}
                        onChange={(e) => setNewMosque({ ...newMosque, country: e.target.value })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
                        disabled={creating}
                      >
                        {COUNTRIES.map(country => (
                          <option key={country.key} value={country.name} className="bg-red-900">
                            {country.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* خط العرض */}
                    <div>
                      <label className="block text-white/90 text-sm font-medium mb-2">
                        خط العرض
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={newMosque.latitude}
                        onChange={(e) => setNewMosque({ ...newMosque, latitude: parseFloat(e.target.value) || 0 })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
                        disabled={creating}
                      />
                    </div>

                    {/* خط الطول */}
                    <div>
                      <label className="block text-white/90 text-sm font-medium mb-2">
                        خط الطول
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={newMosque.longitude}
                        onChange={(e) => setNewMosque({ ...newMosque, longitude: parseFloat(e.target.value) || 0 })}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
                        disabled={creating}
                      />
                    </div>
                  </div>

                  {/* زر الإنشاء */}
                  <button
                    type="submit"
                    disabled={creating}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
                  >
                    {creating ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader className="w-5 h-5 animate-spin" />
                        <span>جاري إنشاء الحساب...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <UserPlus className="w-5 h-5" />
                        <span>إنشاء حساب مسجد جديد</span>
                      </div>
                    )}
                  </button>
                </form>
              </div>

              {/* قائمة المساجد الموجودة */}
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  المساجد المسجلة ({mosques.length})
                </h3>
                
                {loading ? (
                  <div className="text-center py-8">
                    <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-400" />
                    <p className="text-white/70">جاري تحميل المساجد...</p>
                  </div>
                ) : mosques.length === 0 ? (
                  <div className="text-center py-8 text-white/70">
                    <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">لا توجد مساجد مسجلة حالياً</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mosques.map((mosque) => (
                      <div
                        key={mosque.id}
                        className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all duration-300"
                      >
                        <h4 className="font-semibold text-white mb-2">{mosque.mosqueName}</h4>
                        <div className="space-y-1 text-sm text-white/70">
                          <p className="flex items-center gap-2">
                            <Mail className="w-3 h-3" />
                            {mosque.email}
                          </p>
                          <p className="flex items-center gap-2">
                            <MapPin className="w-3 h-3" />
                            {mosque.location.city}, {mosque.location.country}
                          </p>
                          <p className="text-xs">
                            تاريخ الإنشاء: {mosque.createdAt.toLocaleDateString('ar-SA')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'admin' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold mb-6">إدارة حساب المسؤول</h2>
              
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10 text-center">
                <SettingsIcon className="w-16 h-16 mx-auto mb-4 text-white/50" />
                <h3 className="text-xl font-semibold mb-2">إعدادات حساب المسؤول</h3>
                <p className="text-white/70 mb-4">
                  هذا القسم سيتم تطويره لاحقاً لإدارة إعدادات حساب المسؤول
                </p>
                <div className="text-sm text-white/50">
                  <p>الحساب الحالي: {user?.email}</p>
                  <p>الصلاحية: مسؤول</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;