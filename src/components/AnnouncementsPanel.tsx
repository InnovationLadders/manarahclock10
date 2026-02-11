import React, { useState, useEffect, useRef } from 'react';
import { Settings } from '../types';

interface AnnouncementsPanelProps {
  announcements: string[];
  settings: Settings;
  isSmallDisplay?: boolean;
}

const AnnouncementsPanel: React.FC<AnnouncementsPanelProps> = ({ announcements, settings, isSmallDisplay = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dynamicFontSize, setDynamicFontSize] = useState(settings.fontSettings.announcementsFontSize);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (announcements.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 8000); // تغيير كل 8 ثوانٍ

    return () => clearInterval(interval);
  }, [announcements.length]);

  // تصغير الخط التلقائي عند تغيير النص أو الإعدادات
  useEffect(() => {
    if (!textRef.current || announcements.length === 0) return;

    const adjustFontSize = () => {
      const element = textRef.current;
      if (!element) return;

      // الحد الأدنى لحجم الخط (12 بكسل للشاشات الصغيرة، 14 للكبيرة)
      const minFontSize = isSmallDisplay ? 12 : 14;
      
      // حجم الخط الأصلي من الإعدادات
      const originalFontSize = isSmallDisplay 
        ? Math.max(settings.fontSettings.announcementsFontSize * 0.7, 14)
        : settings.fontSettings.announcementsFontSize;

      let currentFontSize = originalFontSize;
      
      // تطبيق حجم الخط الأصلي أولاً
      element.style.fontSize = `${currentFontSize}px`;
      
      // التحقق من الفيض وتقليل الخط تدريجياً
      let attempts = 0;
      const maxAttempts = 20; // تجنب الحلقة اللانهائية
      
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
  }, [currentIndex, settings.fontSettings.announcementsFontSize, isSmallDisplay, announcements]);

  if (announcements.length === 0) return null;

  return (
    <div className="h-full flex flex-col">
      <div className={`bg-gradient-to-b from-cyan-600/20 to-blue-600/20 backdrop-blur-sm rounded-2xl border border-white/20 h-full ${
        isSmallDisplay ? 'p-2 md:p-3' : 'p-3 md:p-4 lg:p-6'
      }`}>
        <h2 
          className={`font-bold text-center ${
            isSmallDisplay ? 'mb-2 md:mb-3' : 'mb-3 md:mb-4 lg:mb-6'
          }`}
          style={{ 
            fontFamily: `${settings.fontSettings.announcementsFontFamily}, sans-serif`,
            fontSize: isSmallDisplay ? 'clamp(0.8rem, 1.2vw, 1.2rem)' : 'clamp(1rem, 1.8vw, 2rem)',
            color: settings.colors.announcementsTitle
          }}
        >
          إعلانات المسجد
        </h2>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p 
              ref={textRef}
              className="leading-relaxed" 
              style={{ 
                fontFamily: `${settings.fontSettings.announcementsFontFamily}, sans-serif`,
                fontSize: `${dynamicFontSize}px`,
                color: settings.colors.announcementsText
              }}
            >
              {announcements[currentIndex]}
            </p>
            
            {/* مؤشر الصفحات */}
            <div className={`flex justify-center space-x-2 space-x-reverse ${
              isSmallDisplay ? 'mt-2 md:mt-3' : 'mt-3 md:mt-4 lg:mt-6'
            }`}>
              {announcements.map((_, index) => (
                <div
                  key={index}
                  className={`rounded-full transition-all duration-300 ${
                    index === currentIndex ? 'bg-white' : 'bg-white/30'
                  }`}
                  style={{
                    width: isSmallDisplay ? 'clamp(6px, 0.5vw, 8px)' : 'clamp(8px, 0.8vw, 12px)',
                    height: isSmallDisplay ? 'clamp(6px, 0.5vw, 8px)' : 'clamp(8px, 0.8vw, 12px)'
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementsPanel;