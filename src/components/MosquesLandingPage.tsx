import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Search, Filter, Clock, Users, Globe, ExternalLink, Fuel as Mosque, Star, Calendar, BookOpen, ChevronDown, RefreshCw, Mail, Phone, Map as MapIcon, Shield } from 'lucide-react';
import { MosqueData, MADHABS } from '../types';
import { getAllMosques, getAvailableCities, getCacheInfo, clearLocalCache } from '../utils/mosqueUtils';
import SEOHelmet from './SEOHelmet';
import { generateOrganizationSchema, generateWebSiteSchema, generateSoftwareApplicationSchema } from '../utils/seoSchemas';

const MosquesLandingPage: React.FC = () => {
  const [mosques, setMosques] = useState<MosqueData[]>([]);
  const [filteredMosques, setFilteredMosques] = useState<MosqueData[]>([]);
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [availableCountries, setAvailableCountries] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMosque, setSelectedMosque] = useState<MosqueData | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [cacheInfo, setCacheInfo] = useState({ hasCache: false, cacheAge: 0, mosquesCount: 0 });

  // صورة المسجد الافتراضية
  const DEFAULT_MOSQUE_IMAGE = 'https://images.pexels.com/photos/2233416/pexels-photo-2233416.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop';

  // تحميل البيانات عند بدء التشغيل
  useEffect(() => {
    loadData();
    updateCacheInfo();
    
    // مراقبة حالة الاتصال بالإنترنت
    const handleOnline = () => {
      setIsOffline(false);
      // إعادة تحميل البيانات عند العودة للاتصال
      loadData();
    };
    
    const handleOffline = () => {
      setIsOffline(true);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [mosquesData, cities] = await Promise.all([
        getAllMosques(),
        getAvailableCities()
      ]);
      
      setMosques(mosquesData);
      setFilteredMosques(mosquesData);
      setAvailableCities(cities);
      
      // Extract unique countries from mosque data
      const countries = [...new Set(mosquesData.map(mosque => mosque.location.country))];
      setAvailableCountries(countries);
      
      // تحديث معلومات التخزين المؤقت
      updateCacheInfo();
    } catch (error) {
      console.error('خطأ في تحميل البيانات:', error);
    } finally {
      setLoading(false);
    }
  };

  // تحديث معلومات التخزين المؤقت
  const updateCacheInfo = () => {
    const info = getCacheInfo();
    setCacheInfo(info);
  };

  // مسح التخزين المؤقت وإعادة التحميل
  const handleClearCache = async () => {
    clearLocalCache();
    await loadData();
  };

  // تطبيق الفلاتر
  useEffect(() => {
    let filtered = mosques;

    // فلتر حسب الدولة
    if (selectedCountry) {
      filtered = filtered.filter(mosque => mosque.location.country === selectedCountry);
    }

    // فلتر حسب المدينة
    if (selectedCity) {
      filtered = filtered.filter(mosque => mosque.location.city === selectedCity);
    }

    // فلتر حسب البحث
    if (searchTerm) {
      filtered = filtered.filter(mosque => 
        mosque.mosqueName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mosque.location.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mosque.location.country.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredMosques(filtered);
  }, [mosques, selectedCity, selectedCountry, searchTerm]);

  const openMosqueDisplay = (mosqueId: string) => {
    window.location.href = `/mosque/${mosqueId}`;
  };

  const resetFilters = () => {
    setSelectedCity('');
    setSelectedCountry('');
    setSearchTerm('');
    setSelectedMosque(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl font-medium text-gray-700">جاري تحميل بيانات المساجد...</p>
        </div>
      </div>
    );
  }

  const organizationSchema = generateOrganizationSchema();
  const websiteSchema = generateWebSiteSchema();
  const softwareSchema = generateSoftwareApplicationSchema();

  const combinedSchema = {
    '@context': 'https://schema.org',
    '@graph': [organizationSchema, websiteSchema, softwareSchema]
  };

  return (
    <div className="landing-page-container" dir="rtl">
      <SEOHelmet
        title="ساعة منارة | ساعة المسجد الذكية لعرض أوقات الصلاة والأذان"
        description="ساعة منارة - ساعة المسجد الذكية والتلفزيونية لعرض أوقات الصلاة والأذان بدقة عالية. نظام متطور لإدارة شاشات المساجد مع عرض الأدعية والإعلانات والمحتوى الدعوي. ساعة مسجد ذكية لجميع المساجد في الوطن العربي."
        keywords="ساعة المسجد الذكية, ساعة مسجد, ساعة منارة, ساعة المسجد التلفزيونية, ساعة اوقات الاذن, أوقات الصلاة, شاشة المسجد, مواقيت الصلاة, نظام المسجد الذكي, عرض أوقات الأذان"
        ogUrl="https://manarah-display.netlify.app/"
        canonical="https://manarah-display.netlify.app/"
        schemaData={combinedSchema}
      />

      {/* الخلفية الإسلامية الجميلة */}
      <div className="fixed inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.pexels.com/photos/2233416/pexels-photo-2233416.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/90 via-blue-900/85 to-purple-900/90" />
        
        {/* نمط هندسي إسلامي */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 border-4 border-white/30 rotate-45 rounded-lg"></div>
          <div className="absolute top-32 right-20 w-24 h-24 border-4 border-white/20 rotate-12 rounded-full"></div>
          <div className="absolute bottom-20 left-32 w-40 h-40 border-4 border-white/25 -rotate-12 rounded-lg"></div>
          <div className="absolute bottom-40 right-16 w-28 h-28 border-4 border-white/20 rotate-45 rounded-full"></div>
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="relative z-10">
        {/* الرأس المحسن */}
        <header className="bg-white/10 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50 shadow-2xl">
          <div className="container mx-auto px-3 sm:px-4 md:px-6 py-3 md:py-6">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-3 lg:gap-0">
              {/* Logo and Title Section */}
              <div className="flex items-center gap-3 sm:gap-4 md:gap-6 w-full lg:w-auto justify-between lg:justify-start">
                <div className="flex items-center gap-3 sm:gap-4 md:gap-6">
                  <div className="p-2 sm:p-3 md:p-4 bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 rounded-xl sm:rounded-2xl md:rounded-3xl shadow-xl md:shadow-2xl transform hover:scale-105 transition-transform duration-300">
                    <img
                      src="/logo_MANARAH_25.svg"
                      alt="ساعة منارة - ساعة المسجد الذكية"
                      width="40"
                      height="40"
                      className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 object-contain drop-shadow-lg"
                    />
                  </div>
                  <div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-0 sm:mb-1 md:mb-2 drop-shadow-2xl" style={{ fontFamily: 'Amiri, serif' }}>
                      ساعة منارة للمساجد
                    </h1>
                    <p className="hidden sm:block text-sm md:text-base lg:text-xl text-emerald-200 drop-shadow-lg" style={{ fontFamily: 'Cairo, sans-serif' }}>
                      نظام عرض أوقات الصلاة والمحتوى الدعوي المتطور
                    </p>
                  </div>
                </div>

                {/* Mobile Connection Status */}
                <div className={`flex lg:hidden items-center gap-2 px-2 py-1 rounded-lg backdrop-blur-sm ${
                  isOffline ? 'bg-red-500/20 border border-red-500/30' : 'bg-green-500/20 border border-green-500/30'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${isOffline ? 'bg-red-400' : 'bg-green-400'} ${!isOffline ? 'animate-pulse' : ''}`} />
                </div>
              </div>

              {/* Desktop Stats and Actions */}
              <div className="flex items-center gap-2 sm:gap-3 md:gap-4 w-full lg:w-auto">
                <div className="hidden xl:flex items-center gap-4 lg:gap-6 xl:gap-8 text-white/90">
                  <div className="flex items-center gap-2 lg:gap-3 bg-white/10 px-3 lg:px-4 py-2 rounded-xl backdrop-blur-sm">
                    <Users className="w-4 lg:w-5 h-4 lg:h-5 text-emerald-300" />
                    <span className="font-medium text-sm lg:text-base">{mosques.length} مسجد</span>
                  </div>
                  <div className="flex items-center gap-2 lg:gap-3 bg-white/10 px-3 lg:px-4 py-2 rounded-xl backdrop-blur-sm">
                    <MapPin className="w-4 lg:w-5 h-4 lg:h-5 text-blue-300" />
                    <span className="font-medium text-sm lg:text-base">{availableCities.length} مدينة</span>
                  </div>
                  {/* مؤشر حالة الاتصال */}
                  <div className={`flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2 rounded-xl backdrop-blur-sm ${
                    isOffline ? 'bg-red-500/20 border border-red-500/30' : 'bg-green-500/20 border border-green-500/30'
                  }`}>
                    <div className={`w-2 lg:w-3 h-2 lg:h-3 rounded-full ${isOffline ? 'bg-red-400' : 'bg-green-400'} ${!isOffline ? 'animate-pulse' : ''}`} />
                    <span className="font-medium text-xs lg:text-sm">
                      {isOffline ? 'غير متصل' : 'متصل'}
                    </span>
                  </div>
                </div>

                <Link
                  to="/display"
                  className="flex-1 lg:flex-none px-3 sm:px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white font-medium rounded-lg md:rounded-xl transition-all duration-300 transform hover:scale-105 shadow-xl flex items-center justify-center gap-2 md:gap-3 text-sm md:text-base"
                >
                  <Clock className="w-4 md:w-5 h-4 md:h-5" />
                  <span className="hidden sm:inline">الشاشة الرئيسية</span>
                  <span className="sm:hidden">الشاشة</span>
                </Link>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-6 py-12">
          {/* معلومات التخزين المؤقت والحالة */}
          {(isOffline || cacheInfo.hasCache) && (
            <div className="bg-white/15 backdrop-blur-xl rounded-3xl p-6 mb-8 border border-white/20 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {isOffline && (
                    <div className="flex items-center gap-3 text-orange-200">
                      <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse" />
                      <span className="font-medium">تعمل في وضع عدم الاتصال - البيانات محفوظة محلياً</span>
                    </div>
                  )}
                  {cacheInfo.hasCache && (
                    <div className="text-white/70 text-sm">
                      آخر تحديث: {cacheInfo.cacheAge < 1 ? 'أقل من ساعة' : `${Math.round(cacheInfo.cacheAge)} ساعة`} • 
                      {cacheInfo.mosquesCount} مسجد محفوظ محلياً
                    </div>
                  )}
                </div>
                
                {cacheInfo.hasCache && (
                  <button
                    onClick={handleClearCache}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all duration-300 flex items-center gap-2 text-sm"
                  >
                    <RefreshCw className="w-4 h-4" />
                    تحديث البيانات
                  </button>
                )}
              </div>
            </div>
          )}

          {/* قسم البحث والفلاتر المحسن */}
          <div className="bg-white/15 backdrop-blur-xl rounded-3xl p-8 mb-12 border border-white/20 shadow-2xl">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* شريط البحث */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-white/60" />
                  <input
                    type="text"
                    placeholder="ابحث عن مسجد أو مدينة..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pr-14 pl-6 py-4 bg-white/20 border border-white/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300 text-white placeholder-white/70 text-lg backdrop-blur-sm"
                  />
                </div>
              </div>

              {/* فلتر الدولة */}
              <div className="lg:w-72">
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full px-6 py-4 bg-white/20 border border-white/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300 text-white text-lg backdrop-blur-sm"
                >
                  <option value="" className="bg-gray-800">جميع الدول</option>
                  {availableCountries.map(country => (
                    <option key={country} value={country} className="bg-gray-800">{country}</option>
                  ))}
                </select>
              </div>

              {/* فلتر المدينة */}
              <div className="lg:w-72">
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-6 py-4 bg-white/20 border border-white/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300 text-white text-lg backdrop-blur-sm"
                >
                  <option value="" className="bg-gray-800">جميع المدن</option>
                  {availableCities.map(city => (
                    <option key={city} value={city} className="bg-gray-800">{city}</option>
                  ))}
                </select>
              </div>

              {/* أزرار الإجراءات */}
              <div className="flex gap-3">
                <button
                  onClick={resetFilters}
                  className="px-6 py-4 bg-white/20 hover:bg-white/30 text-white rounded-2xl transition-all duration-300 flex items-center gap-3 backdrop-blur-sm border border-white/20"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span className="hidden sm:inline">إعادة تعيين</span>
                </button>
              </div>
            </div>

            {/* إحصائيات البحث */}
            <div className="mt-6 flex items-center justify-between text-white/90">
              <div className="text-lg">
                عرض <span className="font-bold text-emerald-300">{filteredMosques.length}</span> من أصل <span className="font-bold text-blue-300">{mosques.length}</span> مسجد
                {selectedCountry && ` في ${selectedCountry}`}
                {selectedCity && ` في ${selectedCity}`}
                {searchTerm && ` يحتوي على "${searchTerm}"`}
                {isOffline && <span className="text-orange-300 mr-2">(وضع عدم الاتصال)</span>}
              </div>
              
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full shadow-lg ${isOffline ? 'bg-orange-500' : 'bg-emerald-500'}`}></div>
                  <span>{isOffline ? 'محلي' : 'نشط'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* قائمة المساجد المحسنة */}
          <div className="bg-white/15 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl mb-12">
            <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-4" style={{ fontFamily: 'Amiri, serif' }}>
              <Users className="w-8 h-8 text-emerald-400" />
              المساجد المسجلة
            </h2>
            
            {filteredMosques.length === 0 ? (
              <div className="text-center py-16 text-white/70">
                <Mosque className="w-24 h-24 mx-auto mb-6 opacity-50" />
                <p className="text-2xl font-medium mb-2">
                  {isOffline && !cacheInfo.hasCache 
                    ? 'لا توجد بيانات محفوظة محلياً' 
                    : 'لا توجد مساجد تطابق معايير البحث'
                  }
                </p>
                <p className="text-lg">
                  {isOffline && !cacheInfo.hasCache 
                    ? 'يرجى الاتصال بالإنترنت لتحميل البيانات' 
                    : 'جرب تعديل الفلاتر أو البحث بكلمات أخرى'
                  }
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredMosques.map((mosque) => (
                  <div
                    key={mosque.id}
                    className="group bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden transition-all duration-300 cursor-pointer hover:bg-white/20 hover:scale-105 hover:shadow-2xl hover:border-emerald-400/50 transform"
                    onClick={() => {
                      openMosqueDisplay(mosque.id);
                    }}
                  >
                    {/* صورة المسجد */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={mosque.imageUrl || DEFAULT_MOSQUE_IMAGE}
                        alt={`${mosque.mosqueName} - ساعة المسجد الذكية في ${mosque.location.city}`}
                        loading="lazy"
                        width="600"
                        height="400"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        onError={(e) => {
                          e.currentTarget.src = DEFAULT_MOSQUE_IMAGE;
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      
                      {/* مؤشر الحالة */}
                      <div className="absolute top-4 right-4 flex items-center gap-2 bg-emerald-500/90 backdrop-blur-sm px-3 py-1 rounded-full">
                        <div className={`w-2 h-2 bg-white rounded-full ${!isOffline ? 'animate-pulse' : ''}`}></div>
                        <span className="text-white text-sm font-medium">{isOffline ? 'محلي' : 'نشط'}</span>
                      </div>

                      {/* زر العرض */}
                      <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full border border-white/30">
                          <ExternalLink className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    </div>

                    {/* معلومات المسجد */}
                    <div className="p-6">
                      <h3
                        className="text-xl font-bold text-white mb-3 group-hover:text-emerald-300 transition-colors duration-300"
                        style={{
                          fontFamily: 'Amiri, serif',
                          textAlign: 'center',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          lineHeight: '1.4',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {mosque.mosqueName}
                      </h3>
                      
                      <div className="space-y-3 text-white/80">
                        <div className="flex items-center gap-3">
                          <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0" />
                          <span className="text-sm">{mosque.location.city}, {mosque.location.country}</span>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <BookOpen className="w-4 h-4 text-purple-400 flex-shrink-0" />
                          <span className="text-sm">
                            {MADHABS.find(m => m.key === mosque.madhab)?.name || mosque.madhab}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Calendar className="w-4 h-4 text-green-400 flex-shrink-0" />
                          <span className="text-sm">{mosque.createdAt.toLocaleDateString('ar-SA')}</span>
                        </div>
                      </div>

                      {/* شريط التقدم للتأثير البصري */}
                      <div className="mt-4 h-1 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* معلومات إضافية محسنة */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white/15 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl text-center group hover:bg-white/20 transition-all duration-300">
              <div className="p-4 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl w-fit mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-xl">
                <Clock className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: 'Amiri, serif' }}>أوقات الصلاة الدقيقة</h3>
              <p className="text-white/80 text-lg leading-relaxed">
                حساب دقيق لأوقات الصلاة حسب الموقع الجغرافي لكل مسجد مع مراعاة المذهب الفقهي
              </p>
            </div>

            <div className="bg-white/15 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl text-center group hover:bg-white/20 transition-all duration-300">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl w-fit mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-xl">
                <Star className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: 'Amiri, serif' }}>محتوى دعوي متنوع</h3>
              <p className="text-white/80 text-lg leading-relaxed">
                عرض الأدعية والأذكار والإعلانات المهمة للمصلين بتصميم جذاب وواضح
              </p>
            </div>

            <div className="bg-white/15 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl text-center group hover:bg-white/20 transition-all duration-300">
              <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl w-fit mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-xl">
                <Globe className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: 'Amiri, serif' }}>وصول من أي مكان</h3>
              <p className="text-white/80 text-lg leading-relaxed">
                إمكانية الوصول للشاشات من أي جهاز متصل بالإنترنت مع دعم كامل للأجهزة المحمولة
              </p>
            </div>
          </div>

          {/* قسم معلومات الاتصال */}
          <div className="bg-white/15 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl mb-12">
            <h2 className="text-3xl font-bold text-white mb-8 text-center" style={{ fontFamily: 'Amiri, serif' }}>
              تواصل معنا
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center group">
                <div className="p-4 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-xl">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">البريد الإلكتروني</h3>
                <p className="text-white/80">sales@innovationladders.com</p>
              </div>

              <div className="text-center group">
                <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-xl">
                  <Phone className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">الهاتف</h3>
                <p className="text-white/80" dir="ltr">+966 55 434 4899</p>
              </div>

              <div className="text-center group">
                <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl w-fit mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-xl">
                  <MapIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">العنوان</h3>
                <p className="text-white/80">جدة، المملكة العربية السعودية</p>
              </div>
            </div>
          </div>
        </div>

        {/* الفوتر المحسن */}
        <footer className="bg-black/30 backdrop-blur-xl border-t border-white/20">
          <div className="container mx-auto px-6 py-12">
            <div className="text-center">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-xl">
                  <img
                    src="/logo_MANARAH_25.svg"
                    alt="ساعة منارة - ساعة المسجد الذكية"
                    width="32"
                    height="32"
                    className="w-8 h-8 object-contain"
                  />
                </div>
                <span className="text-2xl font-bold text-white" style={{ fontFamily: 'Amiri, serif' }}>
                  ساعة منارة للمساجد
                </span>
              </div>

              <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed" style={{ fontFamily: 'Cairo, sans-serif' }}>
                نظام متطور وشامل لعرض أوقات الصلاة والمحتوى الدعوي في المساجد
                <br />
                مع دعم كامل للتخصيص والإدارة السحابية
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-8 text-white/70">
                <span className="text-base sm:text-lg" style={{ fontFamily: 'Cairo, sans-serif' }}>© 2025 جميع الحقوق محفوظة</span>
                <span className="hidden sm:inline text-white/40">•</span>
                <span className="text-base sm:text-lg" style={{ fontFamily: 'Cairo, sans-serif' }}>تطوير سلالم الإبداع</span>
              </div>

              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <p className="text-white/50 text-sm sm:text-base" style={{ fontFamily: 'Cairo, sans-serif' }}>
                    الإصدار 2.0
                  </p>
                  <span className="hidden sm:inline text-white/30">•</span>
                  <Link
                    to="/admin-login"
                    className="group flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-red-400/50 rounded-xl transition-all duration-300 transform hover:scale-105"
                  >
                    <Shield className="w-4 h-4 text-red-400 group-hover:text-red-300 transition-colors" />
                    <span className="text-white/70 group-hover:text-white text-sm sm:text-base transition-colors" style={{ fontFamily: 'Cairo, sans-serif' }}>
                      دخول الأدمن
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default MosquesLandingPage;