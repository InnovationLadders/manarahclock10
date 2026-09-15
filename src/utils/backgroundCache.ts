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

const blobUrlMap = new Map<string, string>();

const ensureBlobUrl = (key: string, blob: Blob): string => {
  const existing = blobUrlMap.get(key);
  if (existing) return existing;
  const blobUrl = URL.createObjectURL(blob);
  blobUrlMap.set(key, blobUrl);
  return blobUrl;
};

export const getCachedBackground = (url: string): string | null => {
  return blobUrlMap.get(url) ?? null;
};

// محاولة الحصول على Blob من مصادر متعددة
const fetchBlobFromSources = async (url: string): Promise<Blob | null> => {
  // 1. محاولة fetch مباشرة
  try {
    const response = await fetch(url);
    if (response.ok) {
      const blob = await response.blob();
      if (blob.size > 0) return blob;
    }
  } catch {
    // فشل fetch (CORS أو شبكة) - ننتقل للخيار التالي
  }

  // 2. محاولة caches.match (من تخزين Service Worker)
  if ('caches' in window) {
    try {
      const cachedResponse = await caches.match(url);
      if (cachedResponse) {
        const blob = await cachedResponse.blob();
        if (blob.size > 0) return blob;
      }
    } catch {
      // تجاهل الخطأ
    }
  }

  return null;
};

export const cacheBackground = async (url: string, type: 'image' | 'video'): Promise<void> => {
  // إذا كانت موجودة في الذاكرة بالفعل
  if (blobUrlMap.has(url)) return;

  const db = await getDB();
  if (!db) return;

  // التحقق من IndexedDB أولاً
  try {
    const existing = await db.get(STORE_NAME, url);
    if (existing) {
      ensureBlobUrl(url, existing.blob);
      return;
    }
  } catch {
    // تجاهل الخطأ
  }

  // محاولة جلب وتخزين الملف
  try {
    const blob = await fetchBlobFromSources(url);
    if (!blob) return;

    const record: CacheRecord = { url, blob, type, timestamp: Date.now() };
    await db.put(STORE_NAME, record);
    ensureBlobUrl(url, blob);
  } catch (error) {
    console.warn('فشل في تخزين الخلفية:', url, error);
  }
};

// تخزين الخلفية وإرجاع رابط الـ blob المحلي
export const cacheBackgroundAndGetUrl = async (url: string, type: 'image' | 'video'): Promise<string | null> => {
  // إذا كانت موجودة في الذاكرة بالفعل
  const existing = blobUrlMap.get(url);
  if (existing) return existing;

  const db = await getDB();
  if (!db) return null;

  // التحقق من IndexedDB أولاً
  try {
    const existingRecord = await db.get(STORE_NAME, url);
    if (existingRecord) {
      return ensureBlobUrl(url, existingRecord.blob);
    }
  } catch {
    // تجاهل الخطأ
  }

  // محاولة جلب وتخزين الملف
  try {
    const blob = await fetchBlobFromSources(url);
    if (!blob) return null;

    const record: CacheRecord = { url, blob, type, timestamp: Date.now() };
    await db.put(STORE_NAME, record);
    return ensureBlobUrl(url, blob);
  } catch (error) {
    console.warn('فشل في تخزين الخلفية:', url, error);
    return null;
  }
};

// محاولة الحصول على رابط محلي من أي مصدر (للاستخدام عند خطأ التحميل)
export const tryGetLocalUrl = async (url: string): Promise<string | null> => {
  // 1. من الذاكرة
  const cached = blobUrlMap.get(url);
  if (cached) return cached;

  const db = await getDB();
  if (!db) return null;

  // 2. من IndexedDB
  try {
    const record = await db.get(STORE_NAME, url);
    if (record) {
      return ensureBlobUrl(url, record.blob);
    }
  } catch {
    // تجاهل الخطأ
  }

  // 3. من Cache API (Service Worker)
  if ('caches' in window) {
    try {
      const cachedResponse = await caches.match(url);
      if (cachedResponse) {
        const blob = await cachedResponse.blob();
        if (blob.size > 0) {
          // تخزين في IndexedDB للاستخدام المستقبلي
          const db2 = await getDB();
          if (db2) {
            const record: CacheRecord = { url, blob, type: 'image', timestamp: Date.now() };
            await db2.put(STORE_NAME, record);
          }
          return ensureBlobUrl(url, blob);
        }
      }
    } catch {
      // تجاهل الخطأ
    }
  }

  return null;
};

// استخراج Blob من عنصر صورة محمل بالفعل باستخدام canvas (يتجاوز CORS تماماً)
export const cacheFromImageElement = async (img: HTMLImageElement, url: string): Promise<string | null> => {
  // إذا كانت موجودة في الذاكرة بالفعل
  const existing = blobUrlMap.get(url);
  if (existing) return existing;

  const db = await getDB();
  if (!db) return null;

  // التحقق من IndexedDB أولاً
  try {
    const existingRecord = await db.get(STORE_NAME, url);
    if (existingRecord) {
      return ensureBlobUrl(url, existingRecord.blob);
    }
  } catch {
    // تجاهل الخطأ
  }

  // استخراج البيانات من الصورة المحملة باستخدام canvas
  try {
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(img, 0, 0);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.92);
    });

    if (!blob || blob.size === 0) return null;

    const record: CacheRecord = { url, blob, type: 'image', timestamp: Date.now() };
    await db.put(STORE_NAME, record);
    return ensureBlobUrl(url, blob);
  } catch (error) {
    // canvas قد يفشل إذا كانت الصورة من مصدر مختلف بدون crossOrigin
    console.warn('فشل في استخراج الصورة عبر canvas:', url, error);
    return null;
  }
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
      if (!blobUrlMap.has(record.url)) {
        ensureBlobUrl(record.url, record.blob);
      }
    }
    return true;
  } catch (error) {
    console.warn('فشل في استعادة الخلفيات المخزنة:', error);
    return false;
  }
};
