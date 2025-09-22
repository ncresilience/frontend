// Performance monitoring and optimization utilities
// Tracks Core Web Vitals and provides caching mechanisms

import { analytics } from './analytics';

export interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
}

export interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum number of cached items
  strategy: 'lru' | 'fifo' | 'ttl';
}

class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {};
  private observers: Map<string, PerformanceObserver> = new Map();

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeObservers();
      this.trackNavigationTiming();
    }
  }

  private initializeObservers(): void {
    // Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          this.metrics.lcp = lastEntry.startTime;
          this.reportMetric('lcp', lastEntry.startTime);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.set('lcp', lcpObserver);
      } catch (e) {
        console.warn('LCP observer not supported');
      }

      // First Input Delay
      try {
        const fidObserver = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            this.metrics.fid = (entry as any).processingStart - entry.startTime;
            this.reportMetric('fid', this.metrics.fid);
          }
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.set('fid', fidObserver);
      } catch (e) {
        console.warn('FID observer not supported');
      }

      // Cumulative Layout Shift
      try {
        const clsObserver = new PerformanceObserver((entryList) => {
          let clsValue = 0;
          for (const entry of entryList.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          this.metrics.cls = clsValue;
          this.reportMetric('cls', clsValue);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.set('cls', clsObserver);
      } catch (e) {
        console.warn('CLS observer not supported');
      }
    }
  }

  private trackNavigationTiming(): void {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        if (navigation) {
          // First Contentful Paint
          const paintEntries = performance.getEntriesByType('paint');
          const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
          if (fcpEntry) {
            this.metrics.fcp = fcpEntry.startTime;
            this.reportMetric('fcp', fcpEntry.startTime);
          }

          // Time to First Byte
          this.metrics.ttfb = navigation.responseStart - navigation.requestStart;
          this.reportMetric('ttfb', this.metrics.ttfb);
        }
      }, 0);
    });
  }

  private reportMetric(name: string, value: number): void {
    analytics.trackPerformance(name, value);
    
    // Log performance issues
    if (this.isPerformanceIssue(name, value)) {
      console.warn(`Performance issue detected: ${name} = ${value}ms`);
      analytics.trackError(`performance_issue_${name}`, { value, threshold: this.getThreshold(name) });
    }
  }

  private isPerformanceIssue(metric: string, value: number): boolean {
    const thresholds = {
      fcp: 2500, // 2.5s
      lcp: 4000, // 4s
      fid: 300,  // 300ms
      cls: 0.25, // 0.25
      ttfb: 1800 // 1.8s
    };
    return value > (thresholds[metric as keyof typeof thresholds] || Infinity);
  }

  private getThreshold(metric: string): number {
    const thresholds = {
      fcp: 2500,
      lcp: 4000,
      fid: 300,
      cls: 0.25,
      ttfb: 1800
    };
    return thresholds[metric as keyof typeof thresholds] || 0;
  }

  public getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics };
  }

  public disconnect(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}

// Advanced caching system
class InMemoryCache<T> {
  private cache: Map<string, { data: T; timestamp: number; ttl: number }> = new Map();
  private config: CacheConfig;
  private accessOrder: string[] = []; // For LRU

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      ttl: 5 * 60 * 1000, // 5 minutes default
      maxSize: 100,
      strategy: 'lru',
      ...config
    };
  }

  set(key: string, data: T, customTtl?: number): void {
    const ttl = customTtl || this.config.ttl;
    const timestamp = Date.now();

    // Remove expired entries
    this.cleanup();

    // Handle cache size limit
    if (this.cache.size >= this.config.maxSize) {
      this.evict();
    }

    this.cache.set(key, { data, timestamp, ttl });
    
    // Update access order for LRU
    if (this.config.strategy === 'lru') {
      this.updateAccessOrder(key);
    }
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.removeFromAccessOrder(key);
      return null;
    }

    // Update access order for LRU
    if (this.config.strategy === 'lru') {
      this.updateAccessOrder(key);
    }

    return entry.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): boolean {
    this.removeFromAccessOrder(key);
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        this.removeFromAccessOrder(key);
      }
    }
  }

  private evict(): void {
    if (this.cache.size === 0) return;

    let keyToEvict: string;

    switch (this.config.strategy) {
      case 'lru':
        keyToEvict = this.accessOrder[0] || this.cache.keys().next().value as string;
        break;
      case 'fifo':
        keyToEvict = this.cache.keys().next().value as string;
        break;
      case 'ttl':
        // Evict the entry that expires soonest
        let oldestEntry = { key: '', timestamp: Date.now() };
        for (const [key, entry] of this.cache.entries()) {
          if (entry.timestamp < oldestEntry.timestamp) {
            oldestEntry = { key, timestamp: entry.timestamp };
          }
        }
        keyToEvict = oldestEntry.key;
        break;
      default:
        keyToEvict = this.cache.keys().next().value as string;
    }

    this.cache.delete(keyToEvict);
    this.removeFromAccessOrder(keyToEvict);
  }

  private updateAccessOrder(key: string): void {
    this.removeFromAccessOrder(key);
    this.accessOrder.push(key);
  }

  private removeFromAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
  }

  getStats(): { size: number; hitRate: number; memoryUsage: number } {
    return {
      size: this.cache.size,
      hitRate: 0, // Would need to track hits/misses
      memoryUsage: JSON.stringify([...this.cache.entries()]).length
    };
  }
}

// Optimized data fetching with caching
class OptimizedAPIClient {
  private cache = new InMemoryCache<any>({
    ttl: 2 * 60 * 1000, // 2 minutes for API responses
    maxSize: 50,
    strategy: 'lru'
  });

  private pendingRequests = new Map<string, Promise<any>>();

  async get(url: string, options: RequestInit = {}, cacheKey?: string): Promise<any> {
    const key = cacheKey || this.generateCacheKey(url, options);

    // Check cache first
    const cached = this.cache.get(key);
    if (cached) {
      analytics.trackPerformance('cache_hit', Date.now());
      return cached;
    }

    // Check for pending request to avoid duplicate calls
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key);
    }

    // Make the request
    const requestPromise = this.makeRequest(url, options);
    this.pendingRequests.set(key, requestPromise);

    try {
      const result = await requestPromise;
      this.cache.set(key, result);
      analytics.trackPerformance('cache_miss', Date.now());
      return result;
    } finally {
      this.pendingRequests.delete(key);
    }
  }

  private async makeRequest(url: string, options: RequestInit): Promise<any> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(url, options);
      const duration = Date.now() - startTime;
      
      analytics.trackPerformance('api_request_duration', duration, { url });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      const duration = Date.now() - startTime;
      analytics.trackError('api_request_failed', { url, duration, error: (error as Error).message });
      throw error;
    }
  }

  private generateCacheKey(url: string, options: RequestInit): string {
    return `${url}_${JSON.stringify(options)}`;
  }

  invalidateCache(pattern?: string): void {
    if (pattern) {
      // Invalidate specific pattern (would need implementation)
      console.log(`Invalidating cache for pattern: ${pattern}`);
    } else {
      this.cache.clear();
    }
  }

  getCacheStats() {
    return this.cache.getStats();
  }
}

// Resource loading optimization
export function preloadResource(href: string, as: string = 'fetch', crossorigin?: string): void {
  if (typeof document === 'undefined') return;

  // Check if already preloaded
  const existing = document.querySelector(`link[href="${href}"]`);
  if (existing) return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  if (crossorigin) link.crossOrigin = crossorigin;

  document.head.appendChild(link);
}

// Image lazy loading with Intersection Observer
export class LazyImageLoader {
  private observer: IntersectionObserver | null = null;
  private images: Set<HTMLImageElement> = new Set();

  constructor() {
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              this.loadImage(entry.target as HTMLImageElement);
            }
          });
        },
        {
          rootMargin: '50px 0px', // Start loading 50px before the image enters viewport
          threshold: 0.01
        }
      );
    }
  }

  observe(img: HTMLImageElement): void {
    if (this.observer) {
      this.images.add(img);
      this.observer.observe(img);
    } else {
      // Fallback for browsers without IntersectionObserver
      this.loadImage(img);
    }
  }

  private loadImage(img: HTMLImageElement): void {
    if (img.dataset.src) {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    }
    
    if (img.dataset.srcset) {
      img.srcset = img.dataset.srcset;
      img.removeAttribute('data-srcset');
    }

    if (this.observer) {
      this.observer.unobserve(img);
    }
    this.images.delete(img);

    analytics.trackPerformance('image_loaded', Date.now());
  }

  disconnect(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.images.clear();
    }
  }
}

// Bundle size optimization utilities
export function loadComponentDynamically<T = any>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
) {
  const startTime = Date.now();
  
  return importFn().then((module) => {
    const loadTime = Date.now() - startTime;
    analytics.trackPerformance('dynamic_import', loadTime);
    return module;
  }).catch((error) => {
    analytics.trackError('dynamic_import_failed', { error: error.message });
    throw error;
  });
}

// Export singleton instances
export const performanceMonitor = new PerformanceMonitor();
export const optimizedAPI = new OptimizedAPIClient();
export const lazyImageLoader = new LazyImageLoader();

// Cleanup function for when component unmounts
export function cleanupPerformanceMonitoring(): void {
  performanceMonitor.disconnect();
  lazyImageLoader.disconnect();
}