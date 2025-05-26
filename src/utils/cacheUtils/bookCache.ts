import localforage from 'localforage';

const THUMBNAIL_CACHE_PREFIX = 'thumb_';
const BOOK_CACHE_PREFIX = 'book_';
const METADATA_CACHE_PREFIX = 'meta_';
const CACHE_VERSION = '1';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  version: string;
}

interface BookMetadata {
  title: string;
  fileKey: string;
  thumbUrl: string;
  uploadTime: string;
  [key: string]: any; // For other potential metadata fields
}

class BookCache {
  static async getThumbnail(fileKey: string): Promise<ArrayBuffer | null> {
    try {
      return await localforage.getItem<ArrayBuffer>(`${THUMBNAIL_CACHE_PREFIX}${fileKey}`);
    } catch (error) {
      console.error('Error getting thumbnail from cache:', error);
      return null;
    }
  }

  static async setThumbnail(fileKey: string, data: ArrayBuffer): Promise<void> {
    try {
      await localforage.setItem(`${THUMBNAIL_CACHE_PREFIX}${fileKey}`, data);
    } catch (error) {
      console.error('Error setting thumbnail in cache:', error);
    }
  }

  static async getBookMetadata(fileKey: string): Promise<BookMetadata | null> {
    try {
      const cached = await localforage.getItem<CacheItem<BookMetadata>>(`${METADATA_CACHE_PREFIX}${fileKey}`);
      if (cached && cached.version === CACHE_VERSION) {
        // Cache for 1 hour
        if (Date.now() - cached.timestamp < 3600000) {
          return cached.data;
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting metadata from cache:', error);
      return null;
    }
  }

  static async setBookMetadata(fileKey: string, data: BookMetadata): Promise<void> {
    try {
      const cacheItem: CacheItem<BookMetadata> = {
        data,
        timestamp: Date.now(),
        version: CACHE_VERSION
      };
      await localforage.setItem(`${METADATA_CACHE_PREFIX}${fileKey}`, cacheItem);
    } catch (error) {
      console.error('Error setting metadata in cache:', error);
    }
  }

  static async clearOldCache(): Promise<void> {
    try {
      const keys = await localforage.keys();
      const oneDay = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      
      for (const key of keys) {
        const item = await localforage.getItem<CacheItem<unknown>>(key);
        if (item && 'timestamp' in item && 'version' in item) {
          const cacheItem = item as CacheItem<unknown>;
          if (Date.now() - cacheItem.timestamp > oneDay) {
            await localforage.removeItem(key);
          }
        }
      }
    } catch (error) {
      console.error('Error clearing old cache:', error);
    }
  }

  static async clearCache(): Promise<void> {
    try {
      await localforage.clear();
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }
}

export default BookCache;
