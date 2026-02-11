import { Coordinates, CalculationMethod, PrayerTimes as AdhanPrayerTimes, Madhab } from 'adhan';
import { PrayerTimes, NextPrayer, Settings } from '../types';

export type AppScreenState = 'mainDisplay' | 'prayerInProgress' | 'postPrayerDhikr';

export interface ScreenStateInfo {
  state: AppScreenState;
  remainingTime?: number;
  currentPrayer?: string;
}

const getCalculationParams = (method: string) => {
  switch (method) {
    case 'UmmAlQura':
      return CalculationMethod.UmmAlQura();
    case 'MuslimWorldLeague':
      return CalculationMethod.MuslimWorldLeague();
    case 'Egyptian':
      return CalculationMethod.Egyptian();
    case 'Karachi':
      return CalculationMethod.Karachi();
    case 'NorthAmerica':
      return CalculationMethod.NorthAmerica();
    case 'Dubai':
      return CalculationMethod.Dubai();
    case 'Kuwait':
      return CalculationMethod.Kuwait();
    case 'Qatar':
      return CalculationMethod.Qatar();
    case 'Singapore':
      return CalculationMethod.Singapore();
    case 'Turkey':
      return CalculationMethod.Turkey();
    case 'Tehran':
      return CalculationMethod.Tehran();
    case 'MoonsightingCommittee':
      return CalculationMethod.MoonsightingCommittee();
    default:
      return CalculationMethod.MuslimWorldLeague();
  }
};

export const calculatePrayerTimes = (settings: Settings): PrayerTimes => {
  const coordinates = new Coordinates(settings.location.latitude, settings.location.longitude);
  const date = new Date();

  const params = getCalculationParams(settings.calculationMethod);
  params.madhab = settings.madhab === 'Hanafi' ? Madhab.Hanafi : Madhab.Shafi;

  const prayerTimes = new AdhanPrayerTimes(coordinates, date, params);

  return {
    fajr: new Date(prayerTimes.fajr.getTime() + settings.prayerTimeAdjustments.fajr * 60000),
    sunrise: prayerTimes.sunrise,
    dhuhr: new Date(prayerTimes.dhuhr.getTime() + settings.prayerTimeAdjustments.dhuhr * 60000),
    asr: new Date(prayerTimes.asr.getTime() + settings.prayerTimeAdjustments.asr * 60000),
    maghrib: new Date(prayerTimes.maghrib.getTime() + settings.prayerTimeAdjustments.maghrib * 60000),
    isha: new Date(prayerTimes.isha.getTime() + settings.prayerTimeAdjustments.isha * 60000)
  };
};

export const getNextPrayer = (prayerTimes: PrayerTimes, settings: Settings): NextPrayer | null => {
  const now = new Date();
  const prayers = [
    { name: 'الفجر', time: prayerTimes.fajr, delay: settings.iqamahDelays.fajr },
    { name: 'الشروق', time: prayerTimes.sunrise, delay: settings.iqamahDelays.sunrise },
    { name: 'الظهر', time: prayerTimes.dhuhr, delay: settings.iqamahDelays.dhuhr },
    { name: 'العصر', time: prayerTimes.asr, delay: settings.iqamahDelays.asr },
    { name: 'المغرب', time: prayerTimes.maghrib, delay: settings.iqamahDelays.maghrib },
    { name: 'العشاء', time: prayerTimes.isha, delay: settings.iqamahDelays.isha }
  ];

  for (const prayer of prayers) {
    const iqamahTime = new Date(prayer.time.getTime() + prayer.delay * 60000);

    if (prayer.time > now) {
      return {
        name: prayer.name,
        time: prayer.time,
        iqamahTime,
        isIqamah: false
      };
    }

    if (iqamahTime > now) {
      return {
        name: prayer.name,
        time: prayer.time,
        iqamahTime,
        isIqamah: true
      };
    }
  }

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowCoordinates = new Coordinates(settings.location.latitude, settings.location.longitude);

  const params = getCalculationParams(settings.calculationMethod);
  params.madhab = settings.madhab === 'Hanafi' ? Madhab.Hanafi : Madhab.Shafi;
  const tomorrowPrayerTimes = new AdhanPrayerTimes(tomorrowCoordinates, tomorrow, params);

  return {
    name: 'الفجر',
    time: tomorrowPrayerTimes.fajr,
    iqamahTime: new Date(tomorrowPrayerTimes.fajr.getTime() + settings.iqamahDelays.fajr * 60000),
    isIqamah: false
  };
};

export const formatTime = (date: Date): string => {
  const timeString = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  return timeString.replace(/\s*(AM|PM)$/g, '');
};

export const formatCountdown = (targetTime: Date): string => {
  const now = new Date();
  const diff = targetTime.getTime() - now.getTime();

  if (diff <= 0) return '00:00:00';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const getScreenState = (prayerTimes: PrayerTimes, settings: Settings): ScreenStateInfo => {
  const now = new Date();
  const prayers = [
    { name: 'fajr', arabicName: 'الفجر', time: prayerTimes.fajr, delay: settings.iqamahDelays.fajr, duration: settings.prayerDuration.fajr },
    { name: 'sunrise', arabicName: 'الشروق', time: prayerTimes.sunrise, delay: settings.iqamahDelays.sunrise, duration: settings.prayerDuration.sunrise },
    { name: 'dhuhr', arabicName: 'الظهر', time: prayerTimes.dhuhr, delay: settings.iqamahDelays.dhuhr, duration: settings.prayerDuration.dhuhr },
    { name: 'asr', arabicName: 'العصر', time: prayerTimes.asr, delay: settings.iqamahDelays.asr, duration: settings.prayerDuration.asr },
    { name: 'maghrib', arabicName: 'المغرب', time: prayerTimes.maghrib, delay: settings.iqamahDelays.maghrib, duration: settings.prayerDuration.maghrib },
    { name: 'isha', arabicName: 'العشاء', time: prayerTimes.isha, delay: settings.iqamahDelays.isha, duration: settings.prayerDuration.isha }
  ];

  for (const prayer of prayers) {
    const iqamahTime = new Date(prayer.time.getTime() + prayer.delay * 60000);
    const prayerEndTime = new Date(iqamahTime.getTime() + prayer.duration * 60000);
    const dhikrEndTime = new Date(prayerEndTime.getTime() + settings.postPrayerDhikrDuration * 60000);

    if (settings.enablePrayerInProgressScreen && now >= iqamahTime && now < prayerEndTime) {
      const remainingTime = Math.ceil((prayerEndTime.getTime() - now.getTime()) / 1000);
      return {
        state: 'prayerInProgress',
        remainingTime,
        currentPrayer: prayer.arabicName
      };
    }

    if (settings.enablePostPrayerDhikrScreen && now >= prayerEndTime && now < dhikrEndTime) {
      const remainingTime = Math.ceil((dhikrEndTime.getTime() - now.getTime()) / 1000);
      return {
        state: 'postPrayerDhikr',
        remainingTime,
        currentPrayer: prayer.arabicName
      };
    }
  }

  return {
    state: 'mainDisplay'
  };
};

export const getHijriDate = (): string => {
  const today = new Date();

  const referenceGregorian = new Date(2000, 0, 1);
  const referenceHijriYear = 1420;
  const referenceHijriMonth = 9;
  const referenceHijriDay = 24;

  const daysDiff = Math.floor((today.getTime() - referenceGregorian.getTime()) / (1000 * 60 * 60 * 24));

  let totalHijriDays = 0;

  for (let year = 1; year < referenceHijriYear; year++) {
    totalHijriDays += isHijriLeapYear(year) ? 355 : 354;
  }

  for (let month = 1; month < referenceHijriMonth; month++) {
    totalHijriDays += getHijriMonthLength(month, referenceHijriYear);
  }

  totalHijriDays += referenceHijriDay;

  totalHijriDays += daysDiff + 1;

  let hijriYear = 1;
  let remainingDays = totalHijriDays;

  while (true) {
    const daysInYear = isHijriLeapYear(hijriYear) ? 355 : 354;
    if (remainingDays <= daysInYear) break;
    remainingDays -= daysInYear;
    hijriYear++;
  }

  let hijriMonth = 1;
  while (hijriMonth <= 12) {
    const daysInMonth = getHijriMonthLength(hijriMonth, hijriYear);
    if (remainingDays <= daysInMonth) break;
    remainingDays -= daysInMonth;
    hijriMonth++;
  }

  const hijriDay = remainingDays;
  const hijriMonths = [
    'محرم', 'صفر', 'ربيع الأول', 'ربيع الآخر', 'جمادى الأولى', 'جمادى الآخرة',
    'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
  ];

  return `${hijriDay} ${hijriMonths[hijriMonth - 1]} ${hijriYear} هـ`;
};

const isHijriLeapYear = (year: number): boolean => {
  const cycle = year % 30;
  const leapYears = [2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29];
  return leapYears.includes(cycle === 0 ? 30 : cycle);
};

const getHijriMonthLength = (month: number, year: number): number => {
  if (month % 2 === 1) {
    return 30;
  } else if (month === 12 && isHijriLeapYear(year)) {
    return 30;
  } else {
    return 29;
  }
};

export const getGregorianDate = (): string => {
  const date = new Date();
  return date.toLocaleDateString('ar-SA', {
    calendar: 'gregory',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short'
  });
};
