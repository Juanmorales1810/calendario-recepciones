'use client';

import { useEffect } from 'react';
import { startNotificationChecker } from '@/lib/notifications';

export function PWAInstall() {
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker
                .register('/sw.js', { scope: '/' })
                .then((registration) => {
                    console.log('✅ Service Worker registrado:', registration);

                    // Forzar actualización si hay una nueva versión
                    registration.update();
                })
                .catch((error) => {
                    console.error('❌ Error al registrar Service Worker:', error);
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
