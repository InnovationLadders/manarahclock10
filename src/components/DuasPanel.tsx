import React, { useState, useEffect, useRef } from 'react';
import { Settings } from '../types';

interface DuasPanelProps {
  duas: string[];
  settings: Settings;
  isSmallDisplay?: boolean;
}

const DuasPanel: React.FC<DuasPanelProps> = ({ duas, settings, isSmallDisplay = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dynamicFontSize, setDynamicFontSize] = useState(settings.fontSettings.duasFontSize);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (duas.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % duas.length);
    }, 10000); // تغيير كل 10 ثوانٍ

    return () => clearInterval(interval);
  }, [duas.length]);

  // تصغير الخط التلقائي عند تغيير النص أو الإعدادات
  useEffect(() => {
    if (!textRef.current || duas.length === 0) return;

    const adjustFontSize = () => {
      const element = textRef.current;
      if (!element) return;

      // الحد الأدنى لحجم الخط (12 بكسل للشاشات الصغيرة، 14 للكبيرة)
      const minFontSize = isSmallDisplay ? 12 : 14;
      
      // حجم الخط الأصلي من الإعدادات
      const originalFontSize = isSmallDisplay 
        ? Math.max(settings.fontSettings.duasFontSize * 0.7, 14)
        : settings.fontSettings.duasFontSize;

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
  }, [currentIndex, settings.fontSettings.duasFontSize, isSmallDisplay, duas]);

  if (duas.length === 0) return null;

  return (
    <div className="h-full flex flex-col">
      <div className="h-full flex flex-col">
        <h2
          className={`text-center ${
            isSmallDisplay ? 'mb-3 md:mb-4' : 'mb-4 md:mb-6 lg:mb-8'
          }`}
          style={{
            fontFamily: `${settings.fontSettings.duasFontFamily}, serif`,
            fontWeight: settings.fontSettings.duasFontWeight,
            fontSize: isSmallDisplay ? 'clamp(0.8rem, 1.2vw, 1.2rem)' : 'clamp(1rem, 1.8vw, 2rem)',
            color: settings.colors.duasTitle
          }}
        >
          أدعية وأذكار
        </h2>

        <div className="flex-1 flex items-center justify-center">
          <p
            ref={textRef}
            className="leading-relaxed text-center"
            style={{
              fontFamily: `${settings.fontSettings.duasFontFamily}, serif`,
              fontWeight: settings.fontSettings.duasFontWeight,
              fontSize: `${dynamicFontSize}px`,
              color: settings.colors.duasText
            }}
          >
            {duas[currentIndex]}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DuasPanel;