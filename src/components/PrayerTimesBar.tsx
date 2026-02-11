import React from 'react';
import { PrayerTimes, Settings } from '../types';
import { formatTime } from '../utils/prayerCalculations';

interface PrayerTimesBarProps {
  prayerTimes: PrayerTimes;
  settings: Settings;
  isLargeDisplay?: boolean;
  isVerticalLayout?: boolean;
}

const PrayerTimesBar: React.FC<PrayerTimesBarProps> = ({ prayerTimes, settings, isLargeDisplay = false, isVerticalLayout = false }) => {
  const prayers = [
    { name: 'الفجر', time: prayerTimes.fajr, delay: settings.iqamahDelays.fajr },
    { name: 'الشروق', time: prayerTimes.sunrise, delay: settings.iqamahDelays.sunrise },
    { name: 'الظهر', time: prayerTimes.dhuhr, delay: settings.iqamahDelays.dhuhr },
    { name: 'العصر', time: prayerTimes.asr, delay: settings.iqamahDelays.asr },
    { name: 'المغرب', time: prayerTimes.maghrib, delay: settings.iqamahDelays.maghrib },
    { name: 'العشاء', time: prayerTimes.isha, delay: settings.iqamahDelays.isha }
  ];

  if (isVerticalLayout) {
    // تخطيط خاص للوضع العمودي - ثلاثة أعمدة منفصلة
    return (
      <div className={`bg-black/50 backdrop-blur-sm border-t border-white/30 ${
        isLargeDisplay ? 'border-2 border-white/40 rounded-2xl mx-4 md:mx-8' : ''
      }`}>
        <div className={`px-4 md:px-6 lg:px-8 ${
          isVerticalLayout ? 'py-4 md:py-6 lg:py-8' : (isLargeDisplay ? 'py-8 md:py-12 lg:py-16' : 'py-3 md:py-4 lg:py-6')
        }`}>
          {/* رؤوس الأعمدة */}
          <div className="grid grid-cols-3 gap-x-8 md:gap-x-12 lg:gap-x-16 mb-4 md:mb-6 lg:mb-8">
            <div className="text-right">
              <h3 
                className="font-bold drop-shadow-lg"
                style={{ 
                  fontFamily: `${settings.fontSettings.prayerNames.fontFamily}, serif`,
                  fontWeight: settings.fontSettings.prayerNames.fontWeight,
                  fontSize: 'clamp(1.2rem, 3vw, 2rem)',
                  color: settings.colors.prayerNamesBar
                }}
              >
                الصلاة
              </h3>
            </div>
            <div className="text-center">
              <h3 
                className="font-bold drop-shadow-lg"
                style={{ 
                  fontFamily: `${settings.fontSettings.prayerNames.fontFamily}, serif`,
                  fontWeight: settings.fontSettings.prayerNames.fontWeight,
                  fontSize: 'clamp(1.2rem, 3vw, 2rem)',
                  color: settings.colors.adhanTimes
                }}
              >
                الأذان
              </h3>
            </div>
            <div className="text-center">
              <h3 
                className="font-bold drop-shadow-lg"
                style={{ 
                  fontFamily: `${settings.fontSettings.prayerNames.fontFamily}, serif`,
                  fontWeight: settings.fontSettings.prayerNames.fontWeight,
                  fontSize: 'clamp(1.2rem, 3vw, 2rem)',
                  color: settings.colors.iqamahTimes
                }}
              >
                الإقامة
              </h3>
            </div>
          </div>
          
          {/* صفوف الصلوات */}
          <div className="space-y-3 md:space-y-4 lg:space-y-6">
            {prayers.map((prayer) => {
              const iqamahTime = new Date(prayer.time.getTime() + prayer.delay * 60000);
              
              return (
                <div key={prayer.name} className="grid grid-cols-3 gap-x-8 md:gap-x-12 lg:gap-x-16 items-center">
                  {/* اسم الصلاة */}
                  <div className="text-right">
                    <h4 
                      className="font-bold drop-shadow-lg"
                      style={{ 
                        fontFamily: `${settings.fontSettings.prayerNames.fontFamily}, serif`,
                  fontWeight: settings.fontSettings.prayerNames.fontWeight,
                        fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
                        color: settings.colors.prayerNamesBar
                      }}
                    >
                      {prayer.name}
                    </h4>
                  </div>
                  
                  {/* وقت الأذان */}
                  <div className="text-center">
                    <div 
                      className="drop-shadow-lg"
                      style={{ 
                        fontFamily: `${settings.fontSettings.prayerTimes.fontFamily}, sans-serif`,
                        fontWeight: settings.fontSettings.prayerTimes.fontWeight,
                        fontSize: 'clamp(1.2rem, 3vw, 2rem)',
                        color: settings.colors.adhanTimes
                      }}
                    >
                      {formatTime(prayer.time)}
                    </div>
                  </div>
                  
                  {/* وقت الإقامة */}
                  <div className="text-center">
                    <div 
                      className="drop-shadow-lg"
                      style={{ 
                        fontFamily: `${settings.fontSettings.prayerTimes.fontFamily}, sans-serif`,
                        fontWeight: settings.fontSettings.prayerTimes.fontWeight,
                        fontSize: 'clamp(1.2rem, 3vw, 2rem)',
                        color: settings.colors.iqamahTimes
                      }}
                    >
                      {formatTime(iqamahTime)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-black/50 backdrop-blur-sm border-t border-white/30 ${
      isLargeDisplay ? 'border-2 border-white/40 rounded-2xl mx-4 md:mx-8' : ''
    }`}>
      <div className={`grid grid-cols-6 gap-2 md:gap-3 lg:gap-4 px-4 md:px-6 lg:px-8 ${
        isLargeDisplay ? 'py-8 md:py-12 lg:py-16' : 'py-3 md:py-4 lg:py-6'
      }`}>
        {prayers.map((prayer) => {
          const iqamahTime = new Date(prayer.time.getTime() + prayer.delay * 60000);
          
          return (
            <div key={prayer.name} className="text-center">
              <h3 
                className={`font-bold drop-shadow-lg ${isLargeDisplay ? 'mb-3 md:mb-4 lg:mb-6' : 'mb-1 md:mb-2 lg:mb-3'}`}
                style={{ 
                  fontFamily: `${settings.fontSettings.prayerNames.fontFamily}, serif`,
                  fontWeight: settings.fontSettings.prayerNames.fontWeight,
                  fontSize: isLargeDisplay
                    ? 'clamp(2rem, 4vw, 4rem)'
                    : 'clamp(1rem, 2vw, 2.5rem)',
                  color: settings.colors.prayerNamesBar
                }}
              >
                {prayer.name}
              </h3>
              <div className={`${isLargeDisplay ? 'space-y-2 md:space-y-3 lg:space-y-4' : 'space-y-1 md:space-y-2'}`}>
                <div 
                  className="drop-shadow-lg"
                  style={{ 
                    fontFamily: `${settings.fontSettings.prayerTimes.fontFamily}, sans-serif`,
                    fontWeight: settings.fontSettings.prayerTimes.fontWeight,
                    fontSize: isLargeDisplay
                      ? 'clamp(1.5rem, 3vw, 3rem)'
                      : 'clamp(0.8rem, 1.5vw, 1.8rem)',
                    color: settings.colors.adhanTimes
                  }}
                >
                  {formatTime(prayer.time)}
                </div>
                <div 
                  className="drop-shadow-lg"
                  style={{ 
                    fontFamily: `${settings.fontSettings.prayerTimes.fontFamily}, sans-serif`,
                    fontWeight: settings.fontSettings.prayerTimes.fontWeight,
                    fontSize: isLargeDisplay
                      ? 'clamp(1.5rem, 3vw, 3rem)'
                      : 'clamp(0.8rem, 1.5vw, 1.8rem)',
                    color: settings.colors.iqamahTimes
                  }}
                >
                  {formatTime(iqamahTime)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PrayerTimesBar;