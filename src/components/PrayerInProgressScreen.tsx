import React from 'react';
import { X } from 'lucide-react';
import { Settings } from '../types';

interface PrayerInProgressScreenProps {
  currentTime: Date;
  settings: Settings;
  onExit?: () => void;
}

const PrayerInProgressScreen: React.FC<PrayerInProgressScreenProps> = ({ 
  currentTime, 
  settings,
  onExit
}) => {
  const isPortrait = settings.displayMode === 'portrait';
  
  return (
    <div className={`h-screen bg-black text-white flex flex-col items-center justify-center relative ${
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

      {/* الوقت الحالي */}
      <div className="text-center mb-8 md:mb-12 lg:mb-16">
        <div 
          className="font-bold drop-shadow-2xl" 
          style={{ 
            fontFamily: 'Cairo, sans-serif',
            fontSize: isPortrait ? 'clamp(3rem, 8vw, 5rem)' : 'clamp(4rem, 8vw, 8rem)',
            color: '#ffffff'
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

      {/* الآية الكريمة */}
      <div className="text-center px-8 md:px-16 lg:px-24">
        <div 
          className="leading-relaxed drop-shadow-2xl"
          style={{ 
            fontFamily: 'Amiri, serif',
            fontSize: isPortrait ? 'clamp(2rem, 6vw, 3.5rem)' : 'clamp(2.5rem, 5vw, 4rem)',
            color: '#ffffff',
            lineHeight: '1.6'
          }}
        >
          الَّذِينَ هُمْ فِي صَلَاتِهِمْ خَاشِعُونَ
        </div>
        
        {/* خط زخرفي */}
        <div className="mt-6 md:mt-8 lg:mt-12">
          <div className="w-32 md:w-48 lg:w-64 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent mx-auto drop-shadow-lg"></div>
        </div>
      </div>

      {/* نقاط زخرفية في الزوايا */}
      <div className="absolute top-8 right-8 w-4 h-4 bg-white/20 rounded-full"></div>
      <div className="absolute top-8 left-8 w-4 h-4 bg-white/20 rounded-full"></div>
      <div className="absolute bottom-8 right-8 w-4 h-4 bg-white/20 rounded-full"></div>
      <div className="absolute bottom-8 left-8 w-4 h-4 bg-white/20 rounded-full"></div>
    </div>
  );
};

export default PrayerInProgressScreen;