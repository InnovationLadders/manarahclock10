import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { ReactComponent as ManarahLogo } from '../assets/ManarahLogo.svg';
import { useCurrentTime } from '../hooks/useTime';
import { usePrayerTimes } from '../hooks/usePrayerTimes';
import { getNextPrayer, formatTime, formatCountdown, getHijriDate, getGregorianDate } from '../utils/prayerCalculations';
import PrayerTimesBar from './PrayerTimesBar';
import CountdownCircle from './CountdownCircle';
import DuasPanel from './DuasPanel';
import AnnouncementsPanel from './AnnouncementsPanel';

interface MainDisplayProps {
  user?: User | null;
  mosqueFound?: boolean;
  mosqueId?: string;
}

const MainDisplay: React.FC<MainDisplayProps> = ({ user, mosqueFound = true, mosqueId }) => {
  const currentTime = useCurrentTime();
  const { prayerTimes, settings, loading } = usePrayerTimes(user, mosqueId);
  const [currentBackgroundIndex, setCurrentBackgroundIndex] = useState(0);
  const [backgroundLoadError, setBackgroundLoadError] = useState(false);

  const nextPrayer = prayerTimes ? getNextPrayer(prayerTimes, settings) : null;
  const isPortrait = settings.displayMode === 'portrait';
  
  // تدوير الخلفيات تلقائياً
  useEffect(() => {
    if (settings.rotateBackgrounds && settings.backgrounds.length > 1) {
      const interval = setInterval(() => {
        setCurrentBackgroundIndex(prev => 
          (prev + 1) % settings.backgrounds.length
        );
        // إعادة تعيين حالة خطأ التحميل عند تغيير الخلفية
        setBackgroundLoadError(false);
      }, settings.rotationInterval * 1000);
      
      return () => clearInterval(interval);
    }
  }, [settings.rotateBackgrounds, settings.rotationInterval, settings.backgrounds.length]);
  
  // إعادة تعيين الفهرس إذا تم تغيير الخلفيات
  useEffect(() => {
    if (currentBackgroundIndex >= settings.backgrounds.length) {
      setCurrentBackgroundIndex(0);
    }
    // إعادة تعيين حالة خطأ التحميل عند تغيير قائمة الخلفيات
    setBackgroundLoadError(false);
  }, [settings.backgrounds.length, currentBackgroundIndex]);
  
  // تحديد الخلفية الحالية
  const getCurrentBackground = () => {
    if (settings.rotateBackgrounds) {
      return settings.backgrounds[currentBackgroundIndex];
    } else if (settings.selectedBackgroundId) {
      const selectedBg = settings.backgrounds.find(bg => bg.id === settings.selectedBackgroundId);
      return selectedBg || settings.backgrounds[0];
    }
    return settings.backgrounds[0];
  };
  
  const currentBackground = getCurrentBackground();
  
  // معالج خطأ تحميل الخلفية
  const handleBackgroundError = (error: any) => {
    console.error('خطأ في تحميل الخلفية:', currentBackground?.url, error);
    setBackgroundLoadError(true);
  };
  
  // إعادة تعيين خطأ التحميل عند تغيير الخلفية الحالية
  useEffect(() => {
    setBackgroundLoadError(false);
  }, [currentBackground?.id]);
  
  // تحويل objectFit إلى فئات CSS
  const getObjectFitClass = (objectFit: string) => {
    switch (objectFit) {
      case 'cover': return 'object-cover';
      case 'contain': return 'object-contain';
      case 'fill': return 'object-fill';
      default: return 'object-cover';
    }
  };
  
  // تحويل objectPosition إلى فئات CSS
  const getObjectPositionClass = (objectPosition: string) => {
    switch (objectPosition) {
      case 'center': return 'object-center';
      case 'top': return 'object-top';
      case 'bottom': return 'object-bottom';
      case 'left': return 'object-left';
      case 'right': return 'object-right';
      default: return 'object-center';
    }
  };
  
  // تحويل objectFit إلى background-size
  const getBackgroundSize = (objectFit: string) => {
    switch (objectFit) {
      case 'cover': return 'cover';
      case 'contain': return 'contain';
      case 'fill': return '100% 100%';
      default: return 'cover';
    }
  };
  
  // تحويل objectPosition إلى background-position
  const getBackgroundPosition = (objectPosition: string) => {
    switch (objectPosition) {
      case 'center': return 'center';
      case 'top': return 'top';
      case 'bottom': return 'bottom';
      case 'left': return 'left';
      case 'right': return 'right';
      default: return 'center';
    }
  };

  // عرض شاشة تحميل إذا كانت الإعدادات قيد التحميل
  if (loading || !settings) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl font-medium">
            {mosqueId ? `جاري تحميل بيانات المسجد...` : 'جاري تحميل الإعدادات...'}
          </p>
        </div>
      </div>
    );
  }

  // عرض رسالة خطأ إذا لم يتم العثور على المسجد
  if (!mosqueFound) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-red-900 via-red-800 to-red-900 text-white">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-24 h-24 mx-auto mb-6 opacity-50">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Amiri, serif' }}>
            المسجد غير موجود
          </h1>
          <p className="text-xl mb-6 text-red-200" style={{ fontFamily: 'Cairo, sans-serif' }}>
            عذراً، لم يتم العثور على بيانات هذا المسجد في النظام
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-white/20 hover:bg-white/30 border border-white/30 rounded-xl transition-all duration-300 flex items-center gap-2 mx-auto"
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
  return (
    <div className={`h-screen flex flex-col text-white relative ${
      isPortrait ? 'main-display-portrait' : ''
    }`}>
      {/* الخلفية */}
      {currentBackground && (
        <>
          {backgroundLoadError ? (
            // خلفية احتياطية عند فشل التحميل
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white/30">
                  <div className="w-16 h-16 mx-auto mb-4 opacity-50">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21,15 16,10 5,21"/>
                    </svg>
                  </div>
                  <p className="text-sm">تعذر تحميل الخلفية</p>
                </div>
              </div>
            </div>
          ) : currentBackground.type === 'image' ? (
            <img
              src={currentBackground.url}
              alt=""
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${getObjectFitClass(currentBackground.objectFit)} ${getObjectPositionClass(currentBackground.objectPosition)}`}
              onError={handleBackgroundError}
              onLoad={() => setBackgroundLoadError(false)}
            />
          ) : (
            <video
              className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${getObjectFitClass(currentBackground.objectFit)} ${getObjectPositionClass(currentBackground.objectPosition)}`}
              src={currentBackground.url}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              onLoadedData={() => {
                console.log('تم تحميل الفيديو بنجاح:', currentBackground.url);
                setBackgroundLoadError(false);
              }}
              onError={handleBackgroundError}
              onLoadStart={() => setBackgroundLoadError(false)}
            />
          )}
        </>
      )}
      
      {/* طبقة تراكب شفافة */}
      <div className={`absolute inset-0 ${
        backgroundLoadError 
          ? 'bg-gradient-to-br from-black/80 via-black/60 to-black/80' 
          : 'bg-gradient-to-br from-black/60 via-black/40 to-black/60'
      }`} />

      {/* الشعار في الزاوية العلوية اليمنى */}
      <div className="absolute top-4 right-4 z-50">
        <img
          src="/logo MANARAH 25.svg"
          alt="شعار منارة"
          className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 object-contain drop-shadow-2xl"
          style={{
            filter: 'drop-shadow(0 0 10px rgba(0, 0, 0, 0.5))'
          }}
        />
      </div>

      {/* المحتوى حسب نوع الشاشة */}
      {settings.screenType === 'dawahScreen' ? (
        // الشاشة الدعوية (التخطيط الأصلي)
        <>
          {/* اسم المسجد */}
          <div 
            className="relative z-10 text-center py-2 md:py-3 lg:py-4 flex-shrink-0"
            style={{
              transform: `translate(${settings.layout.mosqueName.xOffset}%, ${settings.layout.mosqueName.yOffset}%) scale(${settings.layout.mosqueName.scale})`,
              transformOrigin: 'center center'
            }}
          >
            <h1
              className="mb-1 drop-shadow-2xl"
              style={{
                fontFamily: `${settings.fontSettings.mosqueName.fontFamily}, serif`,
                fontWeight: settings.fontSettings.mosqueName.fontWeight,
                fontSize: isPortrait ? 'clamp(1.2rem, 5vw, 2.5rem)' : 'clamp(2rem, 4vw, 5rem)',
                color: settings.colors.mosqueName,
                textAlign: 'center',
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                lineHeight: '1.3',
                maxWidth: '90%',
                margin: '0 auto'
              }}
            >
              {settings.mosqueName}
            </h1>
            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent mx-auto drop-shadow-lg"></div>
          </div>

          {/* المحتوى الرئيسي */}
          <div className={`relative z-10 flex-grow px-2 md:px-4 lg:px-6 min-h-0 ${
            isPortrait ? 'flex flex-col' : 'flex'
          }`}>
            
            {isPortrait ? (
              // تخطيط طولي محسن
              <>
                {/* قسم الوقت والتاريخ - مضغوط */}
                <div className="flex-shrink-0">
                  {/* الوقت الرئيسي */}
                  <div 
                    className="text-center mb-1"
                    style={{
                      transform: `translate(${settings.layout.mainTime.xOffset}%, ${settings.layout.mainTime.yOffset}%) scale(${settings.layout.mainTime.scale})`,
                      transformOrigin: 'center center'
                    }}
                  >
                    <div
                      className="drop-shadow-2xl"
                      style={{
                        fontFamily: `${settings.fontSettings.mainTime.fontFamily}, sans-serif`,
                        fontWeight: settings.fontSettings.mainTime.fontWeight,
                        fontSize: 'clamp(1.8rem, 7vw, 3.5rem)',
                        color: settings.colors.mainTime
                      }}
                    >
                      {currentTime.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: true
                      }).replace(/\s*(AM|PM)$/g, '')}
                    </div>
                  </div>
                  
                  {/* التاريخ الهجري والميلادي */}
                  <div 
                    className="text-center mb-2"
                    style={{
                      transform: `translate(${settings.layout.gregorianHijriDate.xOffset}%, ${settings.layout.gregorianHijriDate.yOffset}%) scale(${settings.layout.gregorianHijriDate.scale})`,
                      transformOrigin: 'center center'
                    }}
                  >
                    <div className="space-y-0.5">
                      <div
                        className="drop-shadow-lg"
                        style={{
                          fontFamily: `${settings.fontSettings.gregorianDate.fontFamily}, sans-serif`,
                          fontWeight: settings.fontSettings.gregorianDate.fontWeight,
                          fontSize: 'clamp(0.7rem, 2.2vw, 1rem)',
                          color: settings.colors.gregorianDate
                        }}
                      >
                        {getGregorianDate()}
                      </div>
                      <div
                        className="drop-shadow-lg"
                        style={{
                          fontFamily: `${settings.fontSettings.hijriDate.fontFamily}, serif`,
                          fontWeight: settings.fontSettings.hijriDate.fontWeight,
                          fontSize: 'clamp(0.8rem, 2.5vw, 1.2rem)',
                          color: settings.colors.hijriDate
                        }}
                      >
                        {getHijriDate()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* العد التنازلي - مضغوط */}
                {nextPrayer && (
                  <div className="flex-shrink-0 mb-2">
                    <CountdownCircle
                      nextPrayer={nextPrayer}
                      countdown={formatCountdown(nextPrayer.isIqamah ? nextPrayer.iqamahTime : nextPrayer.time)}
                      xOffset={settings.layout.countdownCircle.xOffset}
                      yOffset={settings.layout.countdownCircle.yOffset}
                      scale={settings.layout.countdownCircle.scale * 0.8}
                      settings={settings}
                    />
                  </div>
                )}

                {/* الأدعية والإعلانات - مرنة */}
                <div className="flex-1 flex flex-col gap-2 min-h-0">
                  {/* الأدعية */}
                  {settings.showDuasPanel && (
                    <div 
                      className="flex-1 min-h-0"
                      style={{
                        transform: `translate(${settings.layout.duasPanel.xOffset}%, ${settings.layout.duasPanel.yOffset}%) scale(${settings.layout.duasPanel.scale})`,
                        transformOrigin: 'center center'
                      }}
                    >
                      <DuasPanel duas={settings.duas} settings={settings} />
                    </div>
                  )}

                  {/* الإعلانات */}
                  {settings.showAnnouncementsPanel && (
                    <div 
                      className="flex-1 min-h-0"
                      style={{
                        transform: `translate(${settings.layout.announcementsPanel.xOffset}%, ${settings.layout.announcementsPanel.yOffset}%) scale(${settings.layout.announcementsPanel.scale})`,
                        transformOrigin: 'center center'
                      }}
                    >
                      <AnnouncementsPanel announcements={settings.announcements} settings={settings} />
                    </div>
                  )}
                </div>
              </>
            ) : (
              // تخطيط أفقي (الحالي)
              <>
                {/* الأدعية - الجانب الأيمن */}
                {settings.showDuasPanel && (
                  <div 
                    className={`pr-2 md:pr-3 lg:pr-4 ${
                      settings.showAnnouncementsPanel ? 'w-1/4' : 'w-1/3'
                    }`}
                    style={{
                      transform: `translate(${settings.layout.duasPanel.xOffset}%, ${settings.layout.duasPanel.yOffset}%) scale(${settings.layout.duasPanel.scale})`,
                      transformOrigin: 'center center'
                    }}
                  >
                    <DuasPanel duas={settings.duas} settings={settings} />
                  </div>
                )}

                {/* الوسط - الوقت والعد التنازلي */}
                <div className={`flex-1 grid grid-cols-[1fr_auto] gap-4 px-4 md:px-6 lg:px-8 ${
                  !settings.showDuasPanel && !settings.showAnnouncementsPanel ? 'mx-8' : ''
                }`}>
                  {/* الوقت والتاريخ - وسط الشاشة */}
                  <div className="flex flex-col items-center justify-center">
                    {/* الوقت الرئيسي */}
                    <div 
                      className="text-center mb-2 md:mb-3 lg:mb-4"
                      style={{
                        transform: `translate(${settings.layout.mainTime.xOffset}%, ${settings.layout.mainTime.yOffset}%) scale(${settings.layout.mainTime.scale})`,
                        transformOrigin: 'center center'
                      }}
                    >
                      <div
                        className="drop-shadow-2xl"
                        style={{
                          fontFamily: `${settings.fontSettings.mainTime.fontFamily}, sans-serif`,
                          fontWeight: settings.fontSettings.mainTime.fontWeight,
                          fontSize: 'clamp(3rem, 6vw, 7rem)',
                          color: settings.colors.mainTime
                        }}
                      >
                        {currentTime.toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                          hour12: true
                        }).replace(/\s*(AM|PM)$/g, '')}
                      </div>
                    </div>
                    
                    {/* التاريخ الهجري والميلادي */}
                    <div 
                      className="text-center"
                      style={{
                        transform: `translate(${settings.layout.gregorianHijriDate.xOffset}%, ${settings.layout.gregorianHijriDate.yOffset}%) scale(${settings.layout.gregorianHijriDate.scale})`,
                        transformOrigin: 'center center'
                      }}
                    >
                      <div className="space-y-1 md:space-y-2">
                        <div
                          className="drop-shadow-lg"
                          style={{
                            fontFamily: `${settings.fontSettings.gregorianDate.fontFamily}, sans-serif`,
                            fontWeight: settings.fontSettings.gregorianDate.fontWeight,
                            fontSize: 'clamp(0.9rem, 1.5vw, 1.5rem)',
                            color: settings.colors.gregorianDate
                          }}
                        >
                          {getGregorianDate()}
                        </div>
                        <div
                          className="drop-shadow-lg"
                          style={{
                            fontFamily: `${settings.fontSettings.hijriDate.fontFamily}, serif`,
                            fontWeight: settings.fontSettings.hijriDate.fontWeight,
                            fontSize: 'clamp(1rem, 1.8vw, 2rem)',
                            color: settings.colors.hijriDate
                          }}
                        >
                          {getHijriDate()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* العد التنازلي للأذان القادم - الجانب الأيسر */}
                  {nextPrayer && (
                    <div className="flex items-center justify-center">
                      <CountdownCircle
                        nextPrayer={nextPrayer}
                        countdown={formatCountdown(nextPrayer.isIqamah ? nextPrayer.iqamahTime : nextPrayer.time)}
                        xOffset={settings.layout.countdownCircle.xOffset}
                        yOffset={settings.layout.countdownCircle.yOffset}
                        scale={settings.layout.countdownCircle.scale}
                        settings={settings}
                      />
                    </div>
                  )}
                </div>

                {/* الإعلانات - الجانب الأيسر */}
                {settings.showAnnouncementsPanel && (
                  <div 
                    className={`pl-2 md:pl-3 lg:pl-4 ${
                      settings.showDuasPanel ? 'w-1/4' : 'w-1/3'
                    }`}
                    style={{
                      transform: `translate(${settings.layout.announcementsPanel.xOffset}%, ${settings.layout.announcementsPanel.yOffset}%) scale(${settings.layout.announcementsPanel.scale})`,
                      transformOrigin: 'center center'
                    }}
                  >
                    <AnnouncementsPanel announcements={settings.announcements} settings={settings} />
                  </div>
                )}
              </>
            )}
          </div>

          {/* شريط أوقات الصلاة في الأسفل - مع إمكانية التقلص */}
          {prayerTimes && (
            <div 
              className="relative z-10 flex-shrink"
              style={{
                transform: `translate(${settings.layout.prayerTimesBar.xOffset}%, ${settings.layout.prayerTimesBar.yOffset}%) scale(${settings.layout.prayerTimesBar.scale})`,
                transformOrigin: 'center center',
                marginBottom: isPortrait ? '20px' : '0px'
              }}
            >
              <PrayerTimesBar prayerTimes={prayerTimes} settings={settings} />
            </div>
          )}
        </>
      ) : (
        // شاشة مواقيت الصلاة (التخطيط الجديد)
        <>
          {/* القسم العلوي: اسم المسجد والوقت والتاريخ */}
          <div className="relative z-10 flex-shrink-0 px-4 md:px-6 lg:px-8 py-4 md:py-6 text-center">
            {isPortrait ? (
              // تخطيط عمودي - العناصر مكدسة عمودياً
              <>
                {/* اسم المسجد */}
                <div 
                  style={{
                    transform: `translate(${settings.layout.mosqueName.xOffset}%, ${settings.layout.mosqueName.yOffset}%) scale(${settings.layout.mosqueName.scale})`,
                    transformOrigin: 'center center'
                  }}
                >
                  <h1
                    className="font-bold mb-2 drop-shadow-2xl"
                    style={{
                      fontFamily: `${settings.fontSettings.mosqueName.fontFamily}, serif`,
                      fontWeight: settings.fontSettings.mosqueName.fontWeight,
                      fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                      color: settings.colors.mosqueName,
                      textAlign: 'center',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                      lineHeight: '1.3',
                      maxWidth: '90%',
                      margin: '0 auto'
                    }}
                  >
                    {settings.mosqueName}
                  </h1>
                </div>

                {/* الوقت الرئيسي */}
                <div 
                  className="mb-2"
                  style={{
                    transform: `translate(${settings.layout.mainTime.xOffset}%, ${settings.layout.mainTime.yOffset}%) scale(${settings.layout.mainTime.scale})`,
                    transformOrigin: 'center center'
                  }}
                >
                  <div 
                    className="font-bold drop-shadow-2xl" 
                    style={{ 
                      fontFamily: 'Cairo, sans-serif',
                      fontSize: 'clamp(2rem, 6vw, 3rem)',
                      color: settings.colors.mainTime
                    }}
                  >
                    {currentTime.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: true
                    }).replace(/\s*(AM|PM)$/g, '')}
                  </div>
                </div>
                
                {/* التاريخ الهجري والميلادي */}
                <div 
                  style={{
                    transform: `translate(${settings.layout.gregorianHijriDate.xOffset}%, ${settings.layout.gregorianHijriDate.yOffset}%) scale(${settings.layout.gregorianHijriDate.scale})`,
                    transformOrigin: 'center center'
                  }}
                >
                  <div className="space-y-1">
                    <div 
                      className="drop-shadow-lg" 
                      style={{ 
                        fontFamily: 'Cairo, sans-serif',
                        fontSize: 'clamp(0.8rem, 2vw, 1rem)',
                        color: settings.colors.gregorianDate
                      }}
                    >
                      {getGregorianDate()}
                    </div>
                    <div
                      className="drop-shadow-lg"
                      style={{
                        fontFamily: `${settings.fontSettings.hijriDate.fontFamily}, serif`,
                        fontWeight: settings.fontSettings.hijriDate.fontWeight,
                        fontSize: 'clamp(0.9rem, 2.2vw, 1.2rem)',
                        color: settings.colors.hijriDate
                      }}
                    >
                      {getHijriDate()}
                    </div>
                  </div>
                </div>

                {/* العد التنازلي للأذان القادم - حجم أكبر في الوضع العمودي */}
                {nextPrayer && (
                  <div 
                    className="mt-8"
                    style={{
                      transform: `translate(${settings.layout.countdownCircle.xOffset}%, ${settings.layout.countdownCircle.yOffset}%) scale(${settings.layout.countdownCircle.scale * 1.0})`,
                      transformOrigin: 'center center'
                    }}
                  >
                    <CountdownCircle
                      nextPrayer={nextPrayer}
                      countdown={formatCountdown(nextPrayer.isIqamah ? nextPrayer.iqamahTime : nextPrayer.time)}
                      xOffset={0}
                      yOffset={0}
                      scale={1}
                      settings={settings}
                    />
                  </div>
                )}
              </>
            ) : (
              // تخطيط أفقي - العد التنازلي على الجانب
              <>
                {/* اسم المسجد */}
                <div 
                  style={{
                    transform: `translate(${settings.layout.mosqueName.xOffset}%, ${settings.layout.mosqueName.yOffset}%) scale(${settings.layout.mosqueName.scale})`,
                    transformOrigin: 'center center'
                  }}
                >
                  <h1
                    className="font-bold mb-2 drop-shadow-2xl"
                    style={{
                      fontFamily: `${settings.fontSettings.mosqueName.fontFamily}, serif`,
                      fontWeight: settings.fontSettings.mosqueName.fontWeight,
                      fontSize: 'clamp(2rem, 3vw, 3rem)',
                      color: settings.colors.mosqueName,
                      textAlign: 'center',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                      lineHeight: '1.3',
                      maxWidth: '90%',
                      margin: '0 auto'
                    }}
                  >
                    {settings.mosqueName}
                  </h1>
                </div>

                {/* الوقت الرئيسي */}
                <div 
                  className="mb-2"
                  style={{
                    transform: `translate(${settings.layout.mainTime.xOffset}%, ${settings.layout.mainTime.yOffset}%) scale(${settings.layout.mainTime.scale})`,
                    transformOrigin: 'center center'
                  }}
                >
                  <div 
                    className="font-bold drop-shadow-2xl" 
                    style={{ 
                      fontFamily: 'Cairo, sans-serif',
                      fontSize: 'clamp(2.5rem, 4vw, 4rem)',
                      color: settings.colors.mainTime
                    }}
                  >
                    {currentTime.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: true
                    }).replace(/\s*(AM|PM)$/g, '')}
                  </div>
                </div>
                
                {/* التاريخ الهجري والميلادي */}
                <div 
                  style={{
                    transform: `translate(${settings.layout.gregorianHijriDate.xOffset}%, ${settings.layout.gregorianHijriDate.yOffset}%) scale(${settings.layout.gregorianHijriDate.scale})`,
                    transformOrigin: 'center center'
                  }}
                >
                  <div className="space-y-1">
                    <div 
                      className="drop-shadow-lg" 
                      style={{ 
                        fontFamily: 'Cairo, sans-serif',
                        fontSize: 'clamp(1rem, 1.5vw, 1.2rem)',
                        color: settings.colors.gregorianDate
                      }}
                    >
                      {getGregorianDate()}
                    </div>
                    <div
                      className="drop-shadow-lg"
                      style={{
                        fontFamily: `${settings.fontSettings.hijriDate.fontFamily}, serif`,
                        fontWeight: settings.fontSettings.hijriDate.fontWeight,
                        fontSize: 'clamp(1.1rem, 1.8vw, 1.5rem)',
                        color: settings.colors.hijriDate
                      }}
                    >
                      {getHijriDate()}
                    </div>
                  </div>
                </div>

                {/* العد التنازلي للأذان القادم - الجانب الأيسر */}
                {nextPrayer && (
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <CountdownCircle
                      nextPrayer={nextPrayer}
                      countdown={formatCountdown(nextPrayer.isIqamah ? nextPrayer.iqamahTime : nextPrayer.time)}
                      xOffset={settings.layout.countdownCircle.xOffset}
                      yOffset={settings.layout.countdownCircle.yOffset}
                      scale={settings.layout.countdownCircle.scale * 0.8}
                      settings={settings}
                    />
                  </div>
                )}
              </>
            )}
          </div>

          {/* القسم الأوسط: أوقات الصلاة الكبيرة */}
          {prayerTimes && (
            <div 
              className="relative z-10 flex-grow flex items-center justify-center px-2 md:px-4"
              style={{
                transform: `translate(${settings.layout.prayerTimesBar.xOffset}%, ${settings.layout.prayerTimesBar.yOffset}%) scale(${settings.layout.prayerTimesBar.scale})`,
                transformOrigin: 'center center'
              }}
            >
                <PrayerTimesBar prayerTimes={prayerTimes} settings={settings} isLargeDisplay={true} isVerticalLayout={isPortrait} />
            </div>
          )}

          {/* القسم السفلي: الأدعية والإعلانات المصغرة */}
          <div className="relative z-10 flex-shrink-0 px-2 md:px-4 pb-6">
            <div className={`${
              isPortrait 
                ? 'flex flex-col gap-3' 
                : settings.showDuasPanel && settings.showAnnouncementsPanel
                  ? 'grid grid-cols-2 gap-2'
                  : 'flex justify-center'
            }`}>
              {/* الأدعية */}
              {settings.showDuasPanel && (
                <div 
                  className={!settings.showAnnouncementsPanel && !isPortrait ? 'max-w-md' : ''}
                  style={{
                    transform: `translate(${settings.layout.duasPanel.xOffset}%, ${settings.layout.duasPanel.yOffset}%) scale(${settings.layout.duasPanel.scale})`,
                    transformOrigin: 'center center'
                  }}
                >
                  <DuasPanel duas={settings.duas} settings={settings} isSmallDisplay={true} />
                </div>
              )}

              {/* الإعلانات */}
              {settings.showAnnouncementsPanel && (
                <div 
                  className={!settings.showDuasPanel && !isPortrait ? 'max-w-md' : ''}
                  style={{
                    transform: `translate(${settings.layout.announcementsPanel.xOffset}%, ${settings.layout.announcementsPanel.yOffset}%) scale(${settings.layout.announcementsPanel.scale})`,
                    transformOrigin: 'center center'
                  }}
                >
                  <AnnouncementsPanel announcements={settings.announcements} settings={settings} isSmallDisplay={true} />
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MainDisplay;