import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { PrayerTimes, Settings } from '../types';
import { calculatePrayerTimes } from '../utils/prayerCalculations';
import { getSettings, getSettingsSync } from '../utils/storage';

export const usePrayerTimes = (user?: User | null, mosqueId?: string) => {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [mosqueFound, setMosqueFound] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);

  // تحديث الإعدادات عند تغيير المستخدم
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const loadSettings = async () => {
      setLoading(true);

      // إضافة مهلة زمنية للتحميل (10 ثوانٍ)
      timeoutId = setTimeout(() => {
        setLoading(false);
        setMosqueFound(false);
      }, 10000);

      try {
        const { settings: newSettings, found } = await getSettings(user, mosqueId);
        clearTimeout(timeoutId); // إلغاء المهلة الزمنية عند النجاح

        setSettings(newSettings);
        setMosqueFound(found);
      } catch (error) {
        clearTimeout(timeoutId); // إلغاء المهلة الزمنية عند حدوث خطأ
        setMosqueFound(false);
        // تحميل الإعدادات الافتراضية في حالة الخطأ
        setSettings(getSettingsSync(mosqueId));
      } finally {
        setLoading(false);
      }
    };

    loadSettings();

    // تنظيف المهلة الزمنية عند إلغاء التحميل
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [user, mosqueId]);

  // تحديث أوقات الصلاة عند تغيير الإعدادات
  useEffect(() => {
    if (settings) {
      const times = calculatePrayerTimes(settings);
      setPrayerTimes(times);
    }
    
    // تحديث أوقات الصلاة كل دقيقة
    const interval = setInterval(() => {
      if (settings) {
        const times = calculatePrayerTimes(settings);
        setPrayerTimes(times);
      }
    }, 60000);
    
    return () => clearInterval(interval);
  }, [settings]);

  const refreshSettings = async () => {
    setLoading(true);
    try {
      const { settings: newSettings, found } = await getSettings(user, mosqueId);
      setSettings(newSettings);
      setMosqueFound(found);
    } catch (error) {
      setMosqueFound(false);
      // Fallback to default settings if there's an error
      setSettings(getSettingsSync());
    } finally {
      setLoading(false);
    }
  };

  return { 
    prayerTimes, 
    settings: settings || getSettingsSync(), // Provide fallback for initial render
    mosqueFound,
    refreshSettings, 
    loading 
  };
};