import { type CalendarEvent } from '@/components/calendar-event/types';

export interface NotificationPreferences {
    oneDayBefore: boolean;
    thirtyMinBefore: boolean;
}

export const getNotificationPreferences = (): NotificationPreferences => {
    if (typeof window === 'undefined') {
        return { oneDayBefore: true, thirtyMinBefore: true };
    }

    const stored = localStorage.getItem('notificationPreferences');
    if (stored) {
        return JSON.parse(stored);
    }
    return { oneDayBefore: true, thirtyMinBefore: true };
};

export const scheduleEventNotifications = async (event: CalendarEvent) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
        return;
    }

    const preferences = getNotificationPreferences();
    const eventStart = new Date(event.start);
    const now = new Date();

    // Calcular tiempos de notificación
    const oneDayBefore = new Date(eventStart.getTime() - 24 * 60 * 60 * 1000);
    const thirtyMinBefore = new Date(eventStart.getTime() - 30 * 60 * 1000);

    // Guardar notificaciones programadas en localStorage
    const scheduledNotifications = getScheduledNotifications();

    if (preferences.oneDayBefore && oneDayBefore > now) {
        const notification = {
            id: `${event.id}-1day`,
            eventId: event.id,
            title: event.title,
            time: oneDayBefore.toISOString(),
            type: '1day' as const,
            sent: false,
        };
        scheduledNotifications.push(notification);
    }

    if (preferences.thirtyMinBefore && thirtyMinBefore > now) {
        const notification = {
            id: `${event.id}-30min`,
            eventId: event.id,
            title: event.title,
            time: thirtyMinBefore.toISOString(),
            type: '30min' as const,
            sent: false,
        };
        scheduledNotifications.push(notification);
    }

    saveScheduledNotifications(scheduledNotifications);
};

export const cancelEventNotifications = (eventId: string) => {
    const notifications = getScheduledNotifications();
    const filtered = notifications.filter((n) => n.eventId !== eventId);
    saveScheduledNotifications(filtered);
};

export interface ScheduledNotification {
    id: string;
    eventId: string;
    title: string;
    time: string;
    type: '1day' | '30min';
    sent: boolean;
}

export const getScheduledNotifications = (): ScheduledNotification[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('scheduledNotifications');
    return stored ? JSON.parse(stored) : [];
};

export const saveScheduledNotifications = (notifications: ScheduledNotification[]) => {
    localStorage.setItem('scheduledNotifications', JSON.stringify(notifications));
};

export const checkAndSendNotifications = async () => {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
        return;
    }

    const notifications = getScheduledNotifications();
    const now = new Date();
    let updated = false;

    for (const notification of notifications) {
        if (!notification.sent && new Date(notification.time) <= now) {
            // Enviar notificación
            try {
                if ('serviceWorker' in navigator) {
                    const registration = await navigator.serviceWorker.ready;
                    await registration.showNotification('Recordatorio de Evento', {
                        body:
                            notification.type === '1day'
                                ? `Mañana: ${notification.title}`
                                : `En 30 minutos: ${notification.title}`,
                        icon: '/web-app-manifest-192x192.png',
                        badge: '/web-app-manifest-192x192.png',
                        tag: notification.id,
                        requireInteraction: notification.type === '30min',
                        data: {
                            eventId: notification.eventId,
                        },
                    } as any);
                }
                notification.sent = true;
                updated = true;
            } catch (error) {
                console.error('Error al enviar notificación:', error);
            }
        }
    }

    if (updated) {
        saveScheduledNotifications(notifications);
    }
};

// Iniciar verificación periódica de notificaciones
export const startNotificationChecker = () => {
    // Verificar cada minuto
    const interval = setInterval(() => {
        checkAndSendNotifications();
    }, 60 * 1000);

    // Verificar inmediatamente
    checkAndSendNotifications();

    return () => clearInterval(interval);
};
