import React from 'react';
import { NextPrayer, Settings } from '../types';

interface CountdownRectangleProps {
  nextPrayer: NextPrayer;
  countdown: string;
  xOffset: number;
  yOffset: number;
  scale: number;
  settings: Settings;
}

const CountdownRectangle: React.FC<CountdownRectangleProps> = ({
  nextPrayer,
  countdown,
  xOffset,
  yOffset,
  scale,
  settings
}) => {
  return (
    <div
      className="relative flex items-center justify-center"
      style={{
        transform: `translate(${xOffset}%, ${yOffset}%) scale(${scale})`,
        transformOrigin: 'center center'
      }}
    >
      {/* المستطيل الرئيسي */}
      <div
        className="relative border-2 border-white/30 flex items-center justify-center"
        style={{
          width: 'clamp(280px, 30vw, 450px)',
          height: 'clamp(180px, 20vh, 280px)',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 0 20px rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* الزخرفة اليمنى */}
        <div className="absolute right-0 top-0 bottom-0 flex items-center justify-center opacity-30" style={{ width: '60px' }}>
          <svg width="50" height="100%" viewBox="0 0 50 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* نمط زخرفي إسلامي بسيط */}
            <path d="M25 10 L35 30 L25 50 L15 30 Z" fill="rgba(255, 255, 255, 0.4)" />
            <path d="M25 60 L35 80 L25 100 L15 80 Z" fill="rgba(255, 255, 255, 0.3)" />
            <path d="M25 110 L35 130 L25 150 L15 130 Z" fill="rgba(255, 255, 255, 0.4)" />
            <path d="M25 160 L35 180 L25 200 L15 180 Z" fill="rgba(255, 255, 255, 0.3)" />
            <circle cx="25" cy="20" r="3" fill="rgba(255, 255, 255, 0.5)" />
            <circle cx="25" cy="70" r="3" fill="rgba(255, 255, 255, 0.5)" />
            <circle cx="25" cy="120" r="3" fill="rgba(255, 255, 255, 0.5)" />
            <circle cx="25" cy="170" r="3" fill="rgba(255, 255, 255, 0.5)" />
          </svg>
        </div>

        {/* الزخرفة اليسرى */}
        <div className="absolute left-0 top-0 bottom-0 flex items-center justify-center opacity-30" style={{ width: '60px', transform: 'scaleX(-1)' }}>
          <svg width="50" height="100%" viewBox="0 0 50 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* نمط زخرفي إسلامي بسيط مماثل */}
            <path d="M25 10 L35 30 L25 50 L15 30 Z" fill="rgba(255, 255, 255, 0.4)" />
            <path d="M25 60 L35 80 L25 100 L15 80 Z" fill="rgba(255, 255, 255, 0.3)" />
            <path d="M25 110 L35 130 L25 150 L15 130 Z" fill="rgba(255, 255, 255, 0.4)" />
            <path d="M25 160 L35 180 L25 200 L15 180 Z" fill="rgba(255, 255, 255, 0.3)" />
            <circle cx="25" cy="20" r="3" fill="rgba(255, 255, 255, 0.5)" />
            <circle cx="25" cy="70" r="3" fill="rgba(255, 255, 255, 0.5)" />
            <circle cx="25" cy="120" r="3" fill="rgba(255, 255, 255, 0.5)" />
            <circle cx="25" cy="170" r="3" fill="rgba(255, 255, 255, 0.5)" />
          </svg>
        </div>

        {/* المحتوى */}
        <div className="relative z-10 flex flex-col items-center justify-center px-16 py-4">
          {/* نوع العد التنازلي */}
          <div
            className="mb-1.5 drop-shadow-lg text-center leading-tight"
            style={{
              fontFamily: `${settings.fontSettings.prayerNames.fontFamily}, serif`,
              fontWeight: settings.fontSettings.prayerNames.fontWeight,
              fontSize: 'clamp(0.65rem, 1vw, 1.1rem)',
              color: settings.colors.countdownType
            }}
          >
            {nextPrayer.isIqamah ? 'الوقت المتبقي للإقامة' : 'الوقت المتبقي للأذان'}
          </div>

          {/* خط فاصل */}
          <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-white/40 to-transparent mb-2"></div>

          {/* اسم الصلاة */}
          <div
            className="mb-2 drop-shadow-lg text-center leading-tight"
            style={{
              fontFamily: `${settings.fontSettings.prayerNames.fontFamily}, serif`,
              fontWeight: settings.fontSettings.prayerNames.fontWeight,
              fontSize: 'clamp(1.2rem, 2vw, 2.5rem)',
              color: settings.colors.prayerName
            }}
          >
            صلاة {nextPrayer.name}
          </div>

          {/* خط فاصل */}
          <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-white/40 to-transparent mb-2"></div>

          {/* العد التنازلي */}
          <div
            className="drop-shadow-lg text-center leading-tight"
            style={{
              fontFamily: `${settings.fontSettings.countdown.fontFamily}, sans-serif`,
              fontWeight: settings.fontSettings.countdown.fontWeight,
              fontSize: 'clamp(1.4rem, 2.5vw, 3.2rem)',
              color: settings.colors.countdownTimer,
              letterSpacing: '0.05em'
            }}
          >
            {countdown}
          </div>
        </div>

        {/* نقاط زخرفية في الزوايا */}
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-white/40"></div>
        <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-white/40"></div>
        <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-white/40"></div>
        <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-white/40"></div>
      </div>
    </div>
  );
};

export default CountdownRectangle;
