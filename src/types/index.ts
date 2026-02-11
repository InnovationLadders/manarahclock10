export interface PrayerTimes {
  fajr: Date;
  sunrise: Date;
  dhuhr: Date;
  asr: Date;
  maghrib: Date;
  isha: Date;
}

export interface BackgroundItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  name: string;
  objectFit: 'cover' | 'contain' | 'fill';
  objectPosition: 'center' | 'top' | 'bottom' | 'left' | 'right';
}

export interface LayoutSettings {
  xOffset: number;
  yOffset: number;
  scale: number;
}

export interface FontColors {
  mosqueName: string;
  mainTime: string;
  gregorianDate: string;
  hijriDate: string;
  countdownType: string;
  prayerName: string;
  countdownTimer: string;
  prayerNamesBar: string;
  adhanTimes: string;
  iqamahTimes: string;
  duasTitle: string;
  duasText: string;
  announcementsTitle: string;
  announcementsText: string;
}

export interface Settings {
  mosqueName: string;
  location: {
    latitude: number;
    longitude: number;
    city: string;
    country: string;
  };
  calculationMethod: 'UmmAlQura' | 'MuslimWorldLeague' | 'Egyptian' | 'Karachi' | 'NorthAmerica' | 'Dubai' | 'Kuwait' | 'Qatar' | 'Singapore' | 'Turkey' | 'Tehran' | 'MoonsightingCommittee';
  madhab: 'Shafi' | 'Hanafi' | 'Maliki';
  backgrounds: BackgroundItem[];
  rotateBackgrounds: boolean;
  rotationInterval: number; // بالثواني
  selectedBackgroundId: string | null;
  displayMode: 'landscape' | 'portrait';
  screenType: 'dawahScreen' | 'prayerTimes';
  fontSettings: {
    duasFontSize: number;
    duasFontFamily: string;
    autoAdjustDuasFontSize: boolean;
    announcementsFontSize: number;
    announcementsFontFamily: string;
    autoAdjustAnnouncementsFontSize: boolean;
    postPrayerDhikrFontSize: number;
    postPrayerDhikrFontFamily: string;
    autoAdjustPostPrayerDhikrFontSize: boolean;
  };
  colors: FontColors;
  layout: {
    mosqueName: LayoutSettings;
    mainTime: LayoutSettings;
    gregorianHijriDate: LayoutSettings;
    mainClock: LayoutSettings;
    countdownCircle: LayoutSettings;
    duasPanel: LayoutSettings;
    announcementsPanel: LayoutSettings;
    prayerTimesBar: LayoutSettings;
  };
  iqamahDelays: {
    fajr: number;
    sunrise: number;
    dhuhr: number;
    asr: number;
    maghrib: number;
    isha: number;
  };
  prayerTimeAdjustments: {
    fajr: number;
    dhuhr: number;
    asr: number;
    maghrib: number;
    isha: number;
  };
  duas: string[];
  announcements: string[];
  enablePrayerInProgressScreen: boolean;
  prayerDuration: {
    fajr: number;
    sunrise: number;
    dhuhr: number;
    asr: number;
    maghrib: number;
    isha: number;
  };
  enablePostPrayerDhikrScreen: boolean;
  postPrayerDhikrDuration: number;
  postPrayerDhikrText: string;
  showDuasPanel: boolean;
  showAnnouncementsPanel: boolean;
}

export interface MosqueData {
  id: string;
  mosqueName: string;
  email: string;
  madhab: string;
  imageUrl?: string;
  location: {
    latitude: number;
    longitude: number;
    city: string;
    country: string;
  };
  createdAt: Date;
  isActive: boolean;
}

export interface NextPrayer {
  name: string;
  time: Date;
  iqamahTime: Date;
  isIqamah: boolean;
}

export const SAUDI_CITIES = [
  { name: 'الرياض', latitude: 24.7136, longitude: 46.6753 },
  { name: 'جدة', latitude: 21.4858, longitude: 39.1925 },
  { name: 'مكة المكرمة', latitude: 21.3891, longitude: 39.8579 },
  { name: 'المدينة المنورة', latitude: 24.5247, longitude: 39.5692 },
  { name: 'الدمام', latitude: 26.4207, longitude: 50.0888 },
  { name: 'الطائف', latitude: 21.2703, longitude: 40.4158 },
  { name: 'تبوك', latitude: 28.3998, longitude: 36.5700 },
  { name: 'بريدة', latitude: 26.3260, longitude: 43.9750 },
  { name: 'خميس مشيط', latitude: 18.3000, longitude: 42.7300 },
  { name: 'حائل', latitude: 27.5114, longitude: 41.6900 }
];

export const COUNTRIES = [
  { key: 'SA', name: 'المملكة العربية السعودية' },
  { key: 'AE', name: 'الإمارات العربية المتحدة' },
  { key: 'KW', name: 'الكويت' },
  { key: 'QA', name: 'قطر' },
  { key: 'BH', name: 'البحرين' },
  { key: 'OM', name: 'عُمان' },
  { key: 'JO', name: 'الأردن' },
  { key: 'LB', name: 'لبنان' },
  { key: 'SY', name: 'سوريا' },
  { key: 'IQ', name: 'العراق' },
  { key: 'EG', name: 'مصر' },
  { key: 'LY', name: 'ليبيا' },
  { key: 'TN', name: 'تونس' },
  { key: 'DZ', name: 'الجزائر' },
  { key: 'MA', name: 'المغرب' },
  { key: 'SD', name: 'السودان' },
  { key: 'YE', name: 'اليمن' },
  { key: 'TR', name: 'تركيا' },
  { key: 'MY', name: 'ماليزيا' },
  { key: 'ID', name: 'إندونيسيا' },
  { key: 'PK', name: 'باكستان' },
  { key: 'BD', name: 'بنغلاديش' },
  { key: 'IN', name: 'الهند' },
  { key: 'US', name: 'الولايات المتحدة الأمريكية' },
  { key: 'CA', name: 'كندا' },
  { key: 'GB', name: 'المملكة المتحدة' },
  { key: 'FR', name: 'فرنسا' },
  { key: 'DE', name: 'ألمانيا' },
  { key: 'AU', name: 'أستراليا' },
  { key: 'OTHER', name: 'أخرى' }
];

export const CALCULATION_METHODS = [
  { key: 'UmmAlQura', name: 'أم القرى (السعودية)', region: 'السعودية' },
  { key: 'MuslimWorldLeague', name: 'رابطة العالم الإسلامي', region: 'عالمي - أوروبا وآسيا' },
  { key: 'Egyptian', name: 'الهيئة المصرية العامة للمساحة', region: 'مصر وإفريقيا' },
  { key: 'Karachi', name: 'جامعة العلوم الإسلامية، كراتشي', region: 'باكستان وبنغلاديش والهند' },
  { key: 'NorthAmerica', name: 'الجمعية الإسلامية لأمريكا الشمالية (ISNA)', region: 'أمريكا الشمالية' },
  { key: 'Dubai', name: 'الهيئة العامة للشؤون الإسلامية - دبي', region: 'الإمارات' },
  { key: 'Kuwait', name: 'وزارة الأوقاف الكويتية', region: 'الكويت' },
  { key: 'Qatar', name: 'وزارة الأوقاف القطرية', region: 'قطر' },
  { key: 'Singapore', name: 'المجلس الديني الإسلامي - سنغافورة', region: 'سنغافورة وماليزيا وإندونيسيا' },
  { key: 'Turkey', name: 'رئاسة الشؤون الدينية التركية (Diyanet)', region: 'تركيا' },
  { key: 'Tehran', name: 'معهد الجيوفيزياء - طهران', region: 'إيران' },
  { key: 'MoonsightingCommittee', name: 'لجنة رصد الهلال', region: 'أمريكا الشمالية (بديل)' }
];

export const MADHABS = [
  { key: 'Shafi', name: 'الشافعي' },
  { key: 'Hanafi', name: 'الحنفي' },
  { key: 'Maliki', name: 'المالكي' }
];

export const BACKGROUND_IMAGES = [
  {
    name: 'المصباح',
    url: 'https://images.pexels.com/photos/2233416/pexels-photo-2233416.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop'
  },
  {
    name: 'الغروب',
    url: 'https://images.pexels.com/photos/4668228/pexels-photo-4668228.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop'
  },
];

export const FONT_FAMILIES = [
  { key: 'Amiri', name: 'أميري (Amiri)' },
  { key: 'Cairo', name: 'القاهرة (Cairo)' },
  { key: 'Noto Sans Arabic', name: 'نوتو سانس عربي' },
  { key: 'Tajawal', name: 'تجوال (Tajawal)' }
];

export const COUNTRY_CALCULATION_METHOD_MAP: Record<string, string> = {
  'SA': 'UmmAlQura',
  'AE': 'Dubai',
  'KW': 'Kuwait',
  'QA': 'Qatar',
  'BH': 'Dubai',
  'OM': 'UmmAlQura',
  'JO': 'MuslimWorldLeague',
  'LB': 'MuslimWorldLeague',
  'SY': 'MuslimWorldLeague',
  'IQ': 'MuslimWorldLeague',
  'EG': 'Egyptian',
  'LY': 'Egyptian',
  'TN': 'MuslimWorldLeague',
  'DZ': 'MuslimWorldLeague',
  'MA': 'MuslimWorldLeague',
  'SD': 'Egyptian',
  'YE': 'UmmAlQura',
  'TR': 'Turkey',
  'MY': 'Singapore',
  'ID': 'Singapore',
  'PK': 'Karachi',
  'BD': 'Karachi',
  'IN': 'Karachi',
  'US': 'NorthAmerica',
  'CA': 'NorthAmerica',
  'GB': 'MuslimWorldLeague',
  'FR': 'MuslimWorldLeague',
  'DE': 'MuslimWorldLeague',
  'AU': 'MuslimWorldLeague',
  'OTHER': 'MuslimWorldLeague'
};

export const COUNTRY_MADHAB_MAP: Record<string, string> = {
  'SA': 'Hanafi',
  'AE': 'Maliki',
  'KW': 'Maliki',
  'QA': 'Hanafi',
  'BH': 'Maliki',
  'OM': 'Shafi',
  'JO': 'Hanafi',
  'LB': 'Shafi',
  'SY': 'Hanafi',
  'IQ': 'Hanafi',
  'EG': 'Hanafi',
  'LY': 'Maliki',
  'TN': 'Maliki',
  'DZ': 'Maliki',
  'MA': 'Maliki',
  'SD': 'Maliki',
  'YE': 'Shafi',
  'TR': 'Hanafi',
  'MY': 'Shafi',
  'ID': 'Shafi',
  'PK': 'Hanafi',
  'BD': 'Hanafi',
  'IN': 'Hanafi',
  'US': 'Shafi',
  'CA': 'Shafi',
  'GB': 'Hanafi',
  'FR': 'Maliki',
  'DE': 'Hanafi',
  'AU': 'Shafi',
  'OTHER': 'Shafi'
};

export function getRecommendedCalculationMethod(countryName: string): string {
  const country = COUNTRIES.find(c => c.name === countryName);
  if (country) {
    return COUNTRY_CALCULATION_METHOD_MAP[country.key] || 'MuslimWorldLeague';
  }
  return 'MuslimWorldLeague';
}

export function getRecommendedMadhab(countryName: string): string {
  const country = COUNTRIES.find(c => c.name === countryName);
  if (country) {
    return COUNTRY_MADHAB_MAP[country.key] || 'Shafi';
  }
  return 'Shafi';
}