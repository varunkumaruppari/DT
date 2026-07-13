import { precacheAndRoute } from 'workbox-precaching';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const self: any;

// Precache resources
precacheAndRoute(self.__WB_MANIFEST || []);

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

  if (action === 'complete') {
    const completeAction = data.actions.complete;
    if (completeAction) {
      event.waitUntil(
        fetch(completeAction.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            taskId: data.taskId,
            actionToken: completeAction.token,
          }),
        })
          .then((res) => {
            if (!res.ok) console.error('Failed to complete task via notification action');
          })
          .catch((err) => console.error('Error completing task via notification action:', err))
      );
    }
  } else if (action === 'snooze') {
    const snoozeAction = data.actions.snooze;
    if (snoozeAction) {
      event.waitUntil(
        fetch(snoozeAction.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reminderId: data.reminderId,
            minutes: 15,
            actionToken: snoozeAction.token,
          }),
        })
          .then((res) => {
            if (!res.ok) console.error('Failed to snooze reminder via notification action');
          })
          .catch((err) => console.error('Error snoozing reminder via notification action:', err))
      );
    }
  } else if (action === 'dismiss') {
    const dismissAction = data.actions.dismiss;
    if (dismissAction) {
      event.waitUntil(
        fetch(dismissAction.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${dismissAction.token}`,
          },
          body: JSON.stringify({}),
        })
          .then((res) => {
            if (!res.ok) console.error('Failed to dismiss notification action');
          })
          .catch((err) => console.error('Error dismissing notification action:', err))
      );
    }
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
