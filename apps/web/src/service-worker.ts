import { precacheAndRoute } from 'workbox-precaching';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const self: any;

// Precache resources
precacheAndRoute(self.__WB_MANIFEST || []);

const CONFIG_CACHE_NAME = 'ddt-config';
const CONFIG_URL = 'https://ddt-config.local/api-base-url';

async function saveApiBaseUrl(url: string): Promise<void> {
  try {
    const cache = await caches.open(CONFIG_CACHE_NAME);
    await cache.put(CONFIG_URL, new Response(url));
  } catch (err) {
    console.error('Error saving API base URL to cache:', err);
  }
}

async function getApiBaseUrl(): Promise<string | null> {
  try {
    const cache = await caches.open(CONFIG_CACHE_NAME);
    const response = await cache.match(CONFIG_URL);
    if (response) {
      return await response.text();
    }
  } catch (err) {
    console.error('Error getting API base URL from cache:', err);
  }
  return null;
}

async function resolveUrl(relativeOrAbsolute: string): Promise<string> {
  if (/^https?:\/\//.test(relativeOrAbsolute)) {
    return relativeOrAbsolute;
  }
  const apiBase = await getApiBaseUrl();
  if (!apiBase) {
    throw new Error('API Base URL is not configured in service worker');
  }
  const relative = relativeOrAbsolute.startsWith('/') ? relativeOrAbsolute : '/' + relativeOrAbsolute;
  return apiBase + relative;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
self.addEventListener('message', (event: any) => {
  if (event.data && event.data.type === 'CONFIGURE_API_BASE_URL') {
    const apiBaseUrl = event.data.apiBaseUrl;
    if (typeof apiBaseUrl === 'string' && /^(https?:\/\/)/.test(apiBaseUrl)) {
      event.waitUntil(saveApiBaseUrl(apiBaseUrl));
    }
  }
});

self.addEventListener('install', () => {
  self.skipWaiting();
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
self.addEventListener('activate', (event: any) => {
  event.waitUntil(self.clients.claim());
});

// Listen for push events from backend Web Push notifications
// eslint-disable-next-line @typescript-eslint/no-explicit-any
self.addEventListener('push', (event: any) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.title || 'Task Reminder';
    const options = {
      body: data.body || '',
      icon: '/pwa-192x192.png',
      badge: '/favicon.ico',
      tag: data.tag,
      renotify: true,
      data: data.data,
      actions: [
        { action: 'complete', title: 'Complete' },
        { action: 'snooze', title: 'Snooze (15m)' },
        { action: 'dismiss', title: 'Dismiss' },
      ],
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (err) {
    console.error('Error handling push event:', err);
  }
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleActionClick(action: string, data: any): Promise<void> {
  try {
    if (action === 'complete') {
      const completeAction = data.actions.complete;
      if (completeAction) {
        const url = await resolveUrl(completeAction.url);
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            taskId: data.taskId,
            actionToken: completeAction.token,
          }),
        });
        if (!res.ok) console.error('Failed to complete task via notification action');
      }
    } else if (action === 'snooze') {
      const snoozeAction = data.actions.snooze;
      if (snoozeAction) {
        const url = await resolveUrl(snoozeAction.url);
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reminderId: data.reminderId,
            minutes: 15,
            actionToken: snoozeAction.token,
          }),
        });
        if (!res.ok) console.error('Failed to snooze reminder via notification action');
      }
    } else if (action === 'dismiss') {
      const dismissAction = data.actions.dismiss;
      if (dismissAction) {
        const url = await resolveUrl(dismissAction.url);
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${dismissAction.token}`,
          },
          body: JSON.stringify({}),
        });
        if (!res.ok) console.error('Failed to dismiss notification action');
      }
    }
  } catch (err) {
    console.error(`Error processing action ${action}:`, err);
  }
}

// Listen for notification action clicks
// eslint-disable-next-line @typescript-eslint/no-explicit-any
self.addEventListener('notificationclick', (event: any) => {
  const notification = event.notification;
  notification.close();

  const action = event.action;
  const data = notification.data;

  if (!data || !data.actions) {
    event.waitUntil(openClientWindow());
    return;
  }

  if (action === 'complete' || action === 'snooze' || action === 'dismiss') {
    event.waitUntil(handleActionClick(action, data));
  } else {
    // Main card tap
    event.waitUntil(openClientWindow());
  }
});

async function openClientWindow() {
  const clientList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  for (const client of clientList) {
    if (client.url === '/' && 'focus' in client) {
      return client.focus();
    }
  }
  if (self.clients.openWindow) {
    return self.clients.openWindow('/');
  }
}
