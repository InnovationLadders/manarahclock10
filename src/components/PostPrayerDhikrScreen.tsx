import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Settings } from '../types';

interface PostPrayerDhikrScreenProps {
  settings: Settings;
  remainingTime: number; // بالثواني
  onExit?: () => void;
}

const PostPrayerDhikrScreen: React.FC<PostPrayerDhikrScreenProps> = ({ 
  settings, 
  remainingTime,
  onExit
}) => {
  const [dynamicFontSize, setDynamicFontSize] = useState(settings.fontSettings.postPrayerDhikrFontSize);
  const textRef = useRef<HTMLDivElement>(null);
  const isPortrait = settings.displayMode === 'portrait';

  // تصغير الخط التلقائي عند تغيير النص أو الإعدادات
  useEffect(() => {
    if (!textRef.current) return;

    const adjustFontSize = () => {
      const element = textRef.current;
      if (!element) return;

      // الحد الأدنى لحجم الخط
      const minFontSize = isPortrait ? 12 : 14;
      
      // حجم الخط الأصلي من الإعدادات
      const originalFontSize = Math.round(settings.fontSettings.postPrayerDhikrFontSize * 0.8);

      let currentFontSize = originalFontSize;
      
      // تطبيق حجم الخط الأصلي أولاً
      element.style.fontSize = `${currentFontSize}px`;
      
      // التحقق من الفيض وتقليل الخط تدريجياً
      let attempts = 0;
      const maxAttempts = 30; // تجنب الحلقة اللانهائية
      
      while (element.scrollHeight > element.clientHeight && currentFontSize > minFontSize && attempts < maxAttempts) {
        currentFontSize -= 1;
        element.style.fontSize = `${currentFontSize}px`;
        attempts++;
      }
      
      setDynamicFontSize(currentFontSize);
    };

    // تأخير قصير للسماح للعنصر بالتحديث
    const timeoutId = setTimeout(adjustFontSize, 100);
    
    return () => clearTimeout(timeoutId);
  }, [settings.fontSettings.postPrayerDhikrFontSize, isPortrait, settings.postPrayerDhikrText]);

  // تنسيق الوقت المتبقي
  const formatRemainingTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`h-screen bg-white text-black flex flex-col relative overflow-hidden ${
      isPortrait ? 'main-display-portrait' : ''
    }`}>
      {/* زر الخروج */}
      {onExit && (
        <button
          onClick={onExit}
          className={`fixed z-50 p-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full border border-white/30 transition-all duration-300 ${
            isPortrait 
              ? 'top-24 right-8 transform -rotate-90 origin-top-right' 
              : 'top-4 right-4'
          }`}
          title="العودة للشاشة الرئيسية"
        >
          <X className={`w-6 h-6 text-white ${isPortrait ? 'transform rotate-90' : ''}`} />
        </button>
      )}

      {/* خلفية زخرفية */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 border-4 border-black/30 rotate-45 rounded-lg"></div>
        <div className="absolute top-32 right-20 w-24 h-24 border-4 border-black/20 rotate-12 rounded-full"></div>
        <div className="absolute bottom-20 left-32 w-40 h-40 border-4 border-black/25 -rotate-12 rounded-lg"></div>
        <div className="absolute bottom-40 right-16 w-28 h-28 border-4 border-black/20 rotate-45 rounded-full"></div>
      </div>

      {/* العنوان */}
      <div className="flex-shrink-0 text-center py-4 md:py-6 lg:py-8">
        <h1 
          className="font-bold drop-shadow-2xl mb-4"
          style={{ 
            fontFamily: 'Amiri, serif',
            fontSize: isPortrait ? 'clamp(1.5rem, 4vw, 2.5rem)' : 'clamp(2rem, 3vw, 3rem)',
            color: '#000000'
          }}
        >
          أذكار ما بعد الصلاة
        </h1>
        
        {/* خط زخرفي */}
        <div className="mt-2">
          <div className="w-24 md:w-32 lg:w-48 h-0.5 bg-gradient-to-r from-transparent via-black/20 to-transparent mx-auto drop-shadow-lg"></div>
        </div>
      </div>

      {/* النص الرئيسي */}
      <div className="flex-1 flex flex-col justify-start px-6 md:px-12 lg:px-16 py-2 min-h-0 overflow-hidden">
        <div className="w-full max-w-6xl mx-auto flex-1 flex flex-col justify-center">
          <div
            ref={textRef}
            className="text-center leading-relaxed drop-shadow-lg overflow-y-auto flex-1 flex items-start justify-center pt-4"
            style={{
              fontFamily: `${settings.fontSettings.postPrayerDhikrFontFamily}, serif`,
              fontWeight: settings.fontSettings.postPrayerDhikrFontWeight,
              fontSize: `${dynamicFontSize}px`,
              color: '#000000',
              lineHeight: '1.6'
            }}
          >
            <div>
              {settings.postPrayerDhikrText.split('\n')
                .filter(line => line.trim() !== '')
                .map((line, index, filteredLines) => (
                  <React.Fragment key={index}>
                    <span>• {line.trim()}</span>
                    {index < filteredLines.length - 1 && <br />}
                  </React.Fragment>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostPrayerDhikrScreen;