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
      <div className="h-full flex flex-col">
        <h2
          className={`text-center ${
            isSmallDisplay ? 'mb-3 md:mb-4' : 'mb-4 md:mb-6 lg:mb-8'
          }`}
          style={{
            fontFamily: `${settings.fontSettings.announcementsFontFamily}, sans-serif`,
            fontWeight: settings.fontSettings.announcementsFontWeight,
            fontSize: isSmallDisplay ? 'clamp(0.8rem, 1.2vw, 1.2rem)' : 'clamp(1rem, 1.8vw, 2rem)',
            color: settings.colors.announcementsTitle
          }}
        >
          إعلانات المسجد
        </h2>

        <div className="flex-1 flex items-center justify-center">
          <p
            ref={textRef}
            className="leading-relaxed text-center"
            style={{
              fontFamily: `${settings.fontSettings.announcementsFontFamily}, sans-serif`,
              fontWeight: settings.fontSettings.announcementsFontWeight,
              fontSize: `${dynamicFontSize}px`,
              color: settings.colors.announcementsText
            }}
          >
            {announcements[currentIndex]}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementsPanel;