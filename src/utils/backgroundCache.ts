import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'manarah-backgrounds';
const STORE_NAME = 'backgrounds';
const DB_VERSION = 1;

interface CacheRecord {
  url: string;
  blob: Blob;
  type: 'image' | 'video';
  timestamp: number;
}

let dbPromise: Promise<IDBPDatabase | null> | null = null;

const getDB = (): Promise<IDBPDatabase | null> => {
  if (!('indexedDB' in window)) return Promise.resolve(null);
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'url' });
        }
      },
    }).catch((err) => {
      console.warn('فشل في فتح قاعدة بيانات الخلفيات:', err);
      return null;
    });
  }
  return dbPromise;
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

const ensureBlobUrl = (key: string, blob: Blob): string => {
  const existing = blobUrlMap.get(key);
  if (existing) return existing;
  const blobUrl = URL.createObjectURL(blob);
  blobUrlMap.set(key, blobUrl);
  return blobUrl;
};

export const getCachedBackground = (url: string): string | null => {
  const key = urlToKey(url);
  return blobUrlMap.get(key) ?? null;
};

export const cacheBackground = async (url: string, type: 'image' | 'video'): Promise<void> => {
  const key = urlToKey(url);
  if (blobUrlMap.has(key)) return;

  const db = await getDB();
  if (!db) return;

  try {
    const existing = await db.get(STORE_NAME, url);
    if (existing) {
      ensureBlobUrl(key, existing.blob);
      return;
    }

    const response = await fetch(url);
    if (!response.ok) return;

    const blob = await response.blob();
    const record: CacheRecord = { url, blob, type, timestamp: Date.now() };
    await db.put(STORE_NAME, record);
    ensureBlobUrl(key, blob);
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

export const restoreBlobUrlsFromCache = async (): Promise<boolean> => {
  const db = await getDB();
  if (!db) return false;

  try {
    const all: CacheRecord[] = await db.getAll(STORE_NAME);
    for (const record of all) {
      const key = urlToKey(record.url);
      if (!blobUrlMap.has(key)) {
        ensureBlobUrl(key, record.blob);
      }
    }
    return true;
  } catch (error) {
    console.warn('فشل في استعادة الخلفيات المخزنة:', error);
    return false;
  }
};
