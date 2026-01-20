'use client';

import { useEffect } from 'react';
import { startNotificationChecker } from '@/lib/notifications';

export function PWAInstall() {
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker
                    .register('/sw.js')
                    .then((registration) => {
                        console.log('Service Worker registrado:', registration);
                    })
                    .catch((error) => {
                        console.log('Error al registrar Service Worker:', error);
                    });
            });
        }

        // Iniciar verificador de notificaciones
        const cleanup = startNotificationChecker();

        return () => {
            cleanup();
        };
    }, []);

    return null;
}
