self.addEventListener('push', function (event) {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: '/logo192.png', // Ensure this icon exists or use a default
            badge: '/favicon.ico',
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: '2',
                url: data.url
            },
            actions: [
                { action: 'explore', title: 'Voir', icon: '/checkmark.png' },
                { action: 'close', title: 'Fermer', icon: '/xmark.png' },
            ]
        };
        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow(event.notification.data.url || '/')
        );
    }
});
