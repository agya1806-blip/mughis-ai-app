// Service Worker Disabled - Fix Hydration Error
console.log("🔧 Service Worker disabled for debugging");
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());
