import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Global patch to prevent NavigatorLockAcquireTimeoutError in Supabase
if (typeof navigator !== 'undefined' && 'locks' in navigator) {
  const nav = navigator as unknown as { locks: { request: (name: string, options: unknown, callback?: unknown) => Promise<unknown> } };
  if (nav.locks && nav.locks.request) {
    const originalRequest = nav.locks.request.bind(nav.locks);

    nav.locks.request = async (name: string, options: unknown, callback?: unknown) => {
      if (name.includes('supabase') || name.includes('auth-token')) {
        // Pass a dummy lock object to the callback to satisfy Supabase's internal checks
        const dummyLock = { name, mode: 'exclusive' };
        if (typeof options === 'function') {
          return await (options as (lock: unknown) => Promise<unknown>)(dummyLock);
        }
        if (typeof callback === 'function') {
          return await (callback as (lock: unknown) => Promise<unknown>)(dummyLock);
        }
        return;
      }
      return originalRequest(name, options, callback);
    };
  }
}

bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err),
);
