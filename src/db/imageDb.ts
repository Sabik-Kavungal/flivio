const DB_NAME = 'flivio_media_db';
const DB_VERSION = 1;
const STORE_NAME = 'images';

// In-memory cache of object URLs / data URLs so ResolvedImage renders synchronously on repeat views
const memoryUrlCache = new Map<string, string>();

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is unavailable in this browser'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Failed to open IndexedDB'));
  });
}

export interface StoredImageRecord {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  dataUrl: string;
  createdAt: string;
}

/**
 * Compresses large uploaded images via an offscreen canvas (max 1400px longest side, JPEG 0.85)
 * while preserving PNG transparency if small or explicitly PNG.
 */
export async function compressImageFile(file: File): Promise<{ dataUrl: string; mimeType: string; size: number }> {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
  if (!validTypes.includes(file.type)) {
    throw new Error(`Unsupported file type "${file.type}". Use JPG, PNG, WebP, or AVIF.`);
  }
  const maxBytes = 10 * 1024 * 1024; // 10MB raw limit
  if (file.size > maxBytes) {
    throw new Error(`File "${file.name}" exceeds 10MB limit.`);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = () => {
      const rawDataUrl = reader.result as string;
      const img = new Image();
      img.onerror = () => reject(new Error('Invalid image file.'));
      img.onload = () => {
        const MAX_DIM = 1400;
        let { width, height } = img;
        if (width <= MAX_DIM && height <= MAX_DIM && file.size <= 450 * 1024) {
          resolve({ dataUrl: rawDataUrl, mimeType: file.type, size: file.size });
          return;
        }
        if (width > height && width > MAX_DIM) {
          height = Math.round((height * MAX_DIM) / width);
          width = MAX_DIM;
        } else if (height > MAX_DIM) {
          width = Math.round((width * MAX_DIM) / height);
          height = MAX_DIM;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ dataUrl: rawDataUrl, mimeType: file.type, size: file.size });
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const compressed = canvas.toDataURL(outputType, 0.84);
        resolve({
          dataUrl: compressed,
          mimeType: outputType,
          size: Math.round((compressed.length * 3) / 4),
        });
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  });
}

export async function saveImageToDb(file: File): Promise<string> {
  const { dataUrl, mimeType, size } = await compressImageFile(file);
  const id = `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const record: StoredImageRecord = {
    id,
    name: file.name,
    mimeType,
    size,
    dataUrl,
    createdAt: new Date().toISOString(),
  };

  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(record);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error || new Error('Failed to save image to IndexedDB'));
  });
  db.close();

  const key = `idb://${id}`;
  memoryUrlCache.set(key, dataUrl);
  return key;
}

export async function resolveImageKey(urlOrKey: string): Promise<string> {
  if (!urlOrKey) return '';
  if (!urlOrKey.startsWith('idb://')) return urlOrKey;

  const cached = memoryUrlCache.get(urlOrKey);
  if (cached) return cached;

  const id = urlOrKey.replace('idb://', '');
  try {
    const db = await openDb();
    const record = await new Promise<StoredImageRecord | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result as StoredImageRecord | undefined);
      req.onerror = () => reject(req.error);
    });
    db.close();
    if (record?.dataUrl) {
      memoryUrlCache.set(urlOrKey, record.dataUrl);
      return record.dataUrl;
    }
  } catch {
    return '';
  }
  return '';
}

export function getCachedResolvedImage(urlOrKey: string): string | null {
  if (!urlOrKey) return null;
  if (!urlOrKey.startsWith('idb://')) return urlOrKey;
  return memoryUrlCache.get(urlOrKey) ?? null;
}

export async function deleteImageFromDb(urlOrKey: string): Promise<void> {
  if (!urlOrKey.startsWith('idb://')) return;
  const id = urlOrKey.replace('idb://', '');
  memoryUrlCache.delete(urlOrKey);
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
    db.close();
  } catch {
    // ignore deletion failure
  }
}
