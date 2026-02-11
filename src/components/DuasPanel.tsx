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
      <div className={`bg-gradient-to-b from-emerald-600/20 to-teal-600/20 backdrop-blur-sm rounded-2xl border border-white/20 h-full ${
        isSmallDisplay ? 'p-2 md:p-3' : 'p-3 md:p-4 lg:p-6'
      }`}>
        <h2
          className={`text-center ${
            isSmallDisplay ? 'mb-2 md:mb-3' : 'mb-3 md:mb-4 lg:mb-6'
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
          <div className="text-center">
            <p
              ref={textRef}
              className="leading-relaxed"
              style={{
                fontFamily: `${settings.fontSettings.duasFontFamily}, serif`,
                fontWeight: settings.fontSettings.duasFontWeight,
                fontSize: `${dynamicFontSize}px`,
                color: settings.colors.duasText
              }}
            >
              {duas[currentIndex]}
            </p>
            
            {/* مؤشر الصفحات */}
            <div className={`flex justify-center space-x-2 space-x-reverse ${
              isSmallDisplay ? 'mt-2 md:mt-3' : 'mt-3 md:mt-4 lg:mt-6'
            }`}>
              {duas.map((_, index) => (
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

export default DuasPanel;