const BG_CACHE_PREFIX = 'bg_cache_';
const BG_CACHE_INDEX_KEY = 'bg_cache_index';

interface CacheEntry {
  url: string;
  dataUrl: string;
  timestamp: number;
  type: 'image' | 'video';
}

const readIndex = (): Record<string, CacheEntry> => {
  try {
    const raw = localStorage.getItem(BG_CACHE_INDEX_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const writeIndex = (index: Record<string, CacheEntry>): void => {
  try {
    localStorage.setItem(BG_CACHE_INDEX_KEY, JSON.stringify(index));
  } catch (error) {
    console.warn('خطأ في حفظ فهرس الخلفيات:', error);
  }
};

const urlToKey = (url: string): string => {
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
};

export const getCachedBackground = (url: string): string | null => {
  const key = urlToKey(url);
  const index = readIndex();
  const entry = index[key];
  if (entry && entry.url === url) {
    return entry.dataUrl;
  }
  return null;
};

export const cacheBackground = async (url: string, type: 'image' | 'video'): Promise<void> => {
  const existing = getCachedBackground(url);
  if (existing) return;

  try {
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) return;
    const blob = await response.blob();

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert blob to data URL'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    const key = urlToKey(url);
    const index = readIndex();
    index[key] = { url, dataUrl, timestamp: Date.now(), type };

    try {
      localStorage.setItem(`${BG_CACHE_PREFIX}${key}`, dataUrl);
    } catch {
      // تخزين ضخم - نحاول فقط في الفهرس
    }
    writeIndex(index);
  } catch (error) {
    console.warn('فشل في تخزين الخلفية محلياً:', url, error);
  }
};

export const getBackgroundToDisplay = (url: string, isOnline: boolean): { src: string; isCached: boolean } => {
  const cached = getCachedBackground(url);
  if (cached) {
    return { src: cached, isCached: true };
  }
  if (!isOnline) {
    return { src: '', isCached: false };
  }
  return { src: url, isCached: false };
};

export const cacheBackgroundsFromSettings = async (backgrounds: { url: string; type: 'image' | 'video' }[]): Promise<void> => {
  for (const bg of backgrounds) {
    if (bg.type === 'image') {
      await cacheBackground(bg.url, bg.type);
    }
  }
};
