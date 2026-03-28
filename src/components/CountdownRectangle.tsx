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
      <div className="flex flex-col items-center justify-center">
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
    </div>
  );
};

export default CountdownRectangle;
