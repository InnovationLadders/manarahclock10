const BG_CACHE_NAME = 'backgrounds-cache-v1';
const BG_CACHE_INDEX_KEY = 'bg_cache_index';

interface CacheEntry {
  url: string;
  blobUrl: string;
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
    const serializable: Record<string, { url: string; timestamp: number; type: 'image' | 'video' }> = {};
    for (const [key, entry] of Object.entries(index)) {
      serializable[key] = { url: entry.url, timestamp: entry.timestamp, type: entry.type };
    }
    localStorage.setItem(BG_CACHE_INDEX_KEY, JSON.stringify(serializable));
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

const blobUrlMap = new Map<string, string>();

export const getCachedBackground = (url: string): string | null => {
  const key = urlToKey(url);
  if (blobUrlMap.has(key)) {
    return blobUrlMap.get(key)!;
  }
  const index = readIndex();
  const entry = index[key];
  if (entry && entry.url === url && entry.blobUrl) {
    if (blobUrlMap.has(key)) {
      return blobUrlMap.get(key)!;
    }
    return entry.blobUrl;
  }
  return null;
};

export const cacheBackground = async (url: string, type: 'image' | 'video'): Promise<void> => {
  const existing = getCachedBackground(url);
  if (existing) return;

  try {
    if (!('caches' in window)) return;

    const cache = await caches.open(BG_CACHE_NAME);
    const cachedResponse = await cache.match(url);

    if (cachedResponse) {
      const blob = await cachedResponse.blob();
      const blobUrl = URL.createObjectURL(blob);
      const key = urlToKey(url);
      blobUrlMap.set(key, blobUrl);

      const index = readIndex();
      index[key] = { url, blobUrl, timestamp: Date.now(), type };
      writeIndex(index);
      return;
    }

    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) return;

    await cache.put(url, response.clone());

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const key = urlToKey(url);
    blobUrlMap.set(key, blobUrl);

    const index = readIndex();
    index[key] = { url, blobUrl, timestamp: Date.now(), type };
    writeIndex(index);
  } catch (error) {
    console.warn('فشل في تخزين الخلفية:', url, error);
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
    await cacheBackground(bg.url, bg.type);
  }
};

export const restoreBlobUrlsFromCache = async (): Promise<void> => {
  try {
    if (!('caches' in window)) return;
    const cache = await caches.open(BG_CACHE_NAME);
    const requests = await cache.keys();
    const index = readIndex();

    for (const request of requests) {
      const url = request.url;
      const key = urlToKey(url);
      if (blobUrlMap.has(key)) continue;

      const response = await cache.match(request);
      if (!response) continue;

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      blobUrlMap.set(key, blobUrl);

      const existing = index[key];
      index[key] = {
        url,
        blobUrl,
        timestamp: existing?.timestamp || Date.now(),
        type: existing?.type || 'image',
      };
    }
    writeIndex(index);
  } catch (error) {
    console.warn('فشل في استعادة الخلفيات المخزنة:', error);
  }
};
