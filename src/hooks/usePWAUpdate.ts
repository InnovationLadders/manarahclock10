import { useEffect, useState } from 'react';

export function usePWAUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if ('registerSW' in window) {
      try {
        // @ts-ignore - registerSW is injected by vite-plugin-pwa
        window.registerSW({
          onNeedRefresh() {
            setUpdateAvailable(true);
          },
          onOfflineReady() {
            console.log('App ready to work offline');
            setOfflineReady(true);
          },
        });
      } catch (error) {
        console.log('PWA not available');
      }
    }
  }, []);

  const reloadApp = () => {
    window.location.reload();
  };
  
  const clearCache = async () => {
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        console.log('مسح التخزين المؤقت:', cacheNames);
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        
        // مسح التخزين المحلي أيضًا
        if ('localStorage' in window) {
          const keys = Object.keys(localStorage);
          keys.forEach(key => {
            if (key.startsWith('mosque_') || key.startsWith('workbox-') || key === 'mosque_display_settings' || key.includes('cache')) {
              localStorage.removeItem(key);
            }
          });
        }
        
        // مسح sessionStorage أيضًا
        if ('sessionStorage' in window) {
          sessionStorage.clear();
        }
        
        console.log('تم مسح التخزين المؤقت بنجاح');
        alert('تم مسح التخزين المؤقت والإعدادات المحلية بنجاح. سيتم إعادة تحميل الصفحة.');
      } catch (error) {
        console.error('خطأ في مسح التخزين المؤقت:', error);
        alert('حدث خطأ في مسح التخزين المؤقت');
      }
      // إعادة تحميل الصفحة بعد تأخير قصير
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  return {
    updateAvailable,
    offlineReady,
    reloadApp,
    clearCache,
  };
}