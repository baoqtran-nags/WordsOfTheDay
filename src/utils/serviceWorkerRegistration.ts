// Service Worker Registration Helper

export function registerServiceWorker(): void {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      // Determine relative SW path
      const baseUrl = (import.meta as unknown as { env?: { BASE_URL?: string } }).env?.BASE_URL || './';
      const swUrl = `${baseUrl}sw.js`;
      
      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          // Success registration
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker == null) return;
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // New content available
                  console.log('New content is available for offline use.');
                } else {
                  // Content is cached for offline use
                  console.log('Content is cached for offline use.');
                }
              }
            };
          };
        })
        .catch((error) => {
          console.log('Service worker registration note:', error?.message || error);
        });
    });
  }
}
