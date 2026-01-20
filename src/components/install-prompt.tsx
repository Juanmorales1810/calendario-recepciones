'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RiDownloadLine, RiCloseLine } from '@remixicon/react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setShowPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setDeferredPrompt(null);
            setShowPrompt(false);
        }
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        // Guardar en localStorage que el usuario descartó el prompt
        localStorage.setItem('pwa-install-dismissed', 'true');
    };

    // No mostrar si ya fue descartado
    useEffect(() => {
        const dismissed = localStorage.getItem('pwa-install-dismissed');
        if (dismissed === 'true') {
            setShowPrompt(false);
        }
    }, []);

    if (!showPrompt || !deferredPrompt) return null;

    return (
        <div className="fixed right-4 bottom-4 z-50 max-w-sm">
            <Card className="border-primary bg-card p-4 shadow-lg">
                <div className="flex items-start gap-3">
                    <RiDownloadLine className="text-primary h-6 w-6 flex-shrink-0" />
                    <div className="flex-1">
                        <h3 className="font-semibold">Instalar Aplicación</h3>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Agrega Calendario Disei a tu pantalla de inicio para acceso rápido
                        </p>
                        <div className="mt-3 flex gap-2">
                            <Button onClick={handleInstall} size="sm">
                                Instalar
                            </Button>
                            <Button onClick={handleDismiss} variant="ghost" size="sm">
                                <RiCloseLine className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
