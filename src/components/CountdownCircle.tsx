import React from 'react';
import { NextPrayer, Settings } from '../types';

interface CountdownCircleProps {
  nextPrayer: NextPrayer;
  countdown: string;
  xOffset: number;
  yOffset: number;
  scale: number;
  settings: Settings;
}

const CountdownCircle: React.FC<CountdownCircleProps> = ({ 
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
      {/* الدائرة الخارجية */}
      <div 
        className="rounded-full border-4 border-white/20 flex items-center justify-center relative"
        style={{
          '--outer-circle-size': 'min(20vw, 300px, 30vh)',
          '--outer-circle-radius': 'calc(var(--outer-circle-size) / 2)',
          width: 'var(--outer-circle-size)',
          height: 'var(--outer-circle-size)',
        } as React.CSSProperties}
      >
        {/* الدائرة الداخلية */}
        <div 
          className="rounded-full bg-white/10 backdrop-blur-sm flex flex-col items-center justify-center border-2 border-white/30"
          style={{
            width: 'calc(var(--outer-circle-size) * 0.8)',
            height: 'calc(var(--outer-circle-size) * 0.8)',
          } as React.CSSProperties}
        >
          {/* نوع العد التنازلي */}
          <div
            className="mb-1 md:mb-2 drop-shadow-lg text-center leading-tight"
            style={{
              fontFamily: `${settings.fontSettings.prayerNames.fontFamily}, serif`,
              fontWeight: settings.fontSettings.prayerNames.fontWeight,
              fontSize: 'clamp(0.6rem, 1vw, 1.2rem)',
              color: settings.colors.countdownType
            }}
          >
            {nextPrayer.isIqamah ? 'الوقت المتبقي للإقامة' : 'الوقت المتبقي للأذان'}
          </div>

          {/* اسم الصلاة */}
          <div
            className="mb-2 md:mb-3 drop-shadow-lg text-center"
            style={{
              fontFamily: `${settings.fontSettings.prayerNames.fontFamily}, serif`,
              fontWeight: settings.fontSettings.prayerNames.fontWeight,
              fontSize: 'clamp(1rem, 2vw, 2.5rem)',
              color: settings.colors.prayerName
            }}
          >
            صلاة {nextPrayer.name}
          </div>

          {/* العد التنازلي */}
          <div
            className="drop-shadow-lg text-center"
            style={{
              fontFamily: `${settings.fontSettings.countdown.fontFamily}, sans-serif`,
              fontWeight: settings.fontSettings.countdown.fontWeight,
              fontSize: 'clamp(1.2rem, 2.5vw, 3rem)',
              color: settings.colors.countdownTimer
            }}
          >
            {countdown}
          </div>
        </div>
        
        {/* نقاط زخرفية حول الدائرة */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute bg-white/40 rounded-full"
            style={{
              width: 'clamp(6px, 0.6vw, 12px)',
              height: 'clamp(6px, 0.6vw, 12px)',
              top: '50%',
              left: '50%',
              transform: `translate(-50%, -50%) rotate(${i * 30}deg) translateY(calc(var(--outer-circle-radius) * -1))`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default CountdownCircle;