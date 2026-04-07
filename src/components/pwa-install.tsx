'use client';

import { useEffect, useState } from 'react';
import { startNotificationChecker } from '@/lib/notifications';
import { RiRefreshLine } from '@remixicon/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function PWAInstall() {
    const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
    const [showUpdate, setShowUpdate] = useState(false);

    useEffect(() => {
        if (!('serviceWorker' in navigator)) return;

        navigator.serviceWorker
            .register('/sw.js', { scope: '/', updateViaCache: 'none' })
            .then((registration) => {
                // Verificar si ya hay un worker esperando
                if (registration.waiting) {
                    setWaitingWorker(registration.waiting);
                    setShowUpdate(true);
                }

                // Escuchar nuevas actualizaciones
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    if (!newWorker) return;

                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            setWaitingWorker(newWorker);
                            setShowUpdate(true);
                        }
                    });
                });
            })
            .catch((error) => {
                console.error('Service Worker registration failed:', error);
            });

        // Recargar cuando el SW controlador cambie
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (refreshing) return;
            refreshing = true;
            window.location.reload();
        });

        // Iniciar verificador de notificaciones
        const cleanup = startNotificationChecker();

        return () => {
            cleanup();
        };
    }, []);

    const handleUpdate = () => {
        waitingWorker?.postMessage({ type: 'SKIP_WAITING' });
        setShowUpdate(false);
    };

    if (!showUpdate) return null;

    return (
        <div className="fixed right-4 bottom-4 z-[9999]">
            <Card className="flex items-center gap-3 border p-4 shadow-lg">
                <RiRefreshLine className="text-primary h-5 w-5" />
                <span className="text-sm">Nueva versión disponible</span>
                <Button onClick={handleUpdate} size="sm">
                    Actualizar
                </Button>
            </Card>
        </div>
    );
}
