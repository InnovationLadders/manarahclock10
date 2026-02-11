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
      console.log('🔄 [usePrayerTimes] تحميل الإعدادات - User:', user?.uid, 'MosqueId:', mosqueId);
      console.log('🔄 [usePrayerTimes] نوع mosqueId:', typeof mosqueId, 'القيمة:', JSON.stringify(mosqueId));
      setLoading(true);

      // إضافة مهلة زمنية للتحميل (10 ثوانٍ)
      timeoutId = setTimeout(() => {
        console.warn('⏱️ [usePrayerTimes] انتهت مهلة تحميل الإعدادات');
        setLoading(false);
        setMosqueFound(false);
      }, 10000);

      try {
        const { settings: newSettings, found } = await getSettings(user, mosqueId);
        clearTimeout(timeoutId); // إلغاء المهلة الزمنية عند النجاح

        console.log('📋 [usePrayerTimes] الإعدادات المحملة:', {
          mosqueName: newSettings.mosqueName,
          found: found,
          mosqueId: mosqueId,
          settingsSource: found ? 'من قاعدة البيانات' : 'الإعدادات الافتراضية'
        });
        setSettings(newSettings);
        setMosqueFound(found);
      } catch (error) {
        clearTimeout(timeoutId); // إلغاء المهلة الزمنية عند حدوث خطأ
        console.error('❌ [usePrayerTimes] خطأ في تحميل الإعدادات:', error);
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
      console.error('خطأ في تحديث الإعدادات:', error);
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