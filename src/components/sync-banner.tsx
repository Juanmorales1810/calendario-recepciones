'use client';

import { useState } from 'react';
import { RiRefreshLine, RiCloseLine, RiCloudLine } from '@remixicon/react';
import { Button } from '@/components/ui/button';

interface SyncBannerProps {
    onSync: () => Promise<void>;
    onDismiss: () => void;
}

export function SyncBanner({ onSync, onDismiss }: SyncBannerProps) {
    const [isSyncing, setIsSyncing] = useState(false);

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            await onSync();
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-3">
            <div className="container mx-auto flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <RiCloudLine className="h-5 w-5 text-amber-600" />
                    <p className="text-sm text-amber-800">
                        Tienes eventos guardados localmente. ¿Deseas sincronizarlos con tu cuenta?
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        onClick={handleSync}
                        disabled={isSyncing}
                        size="sm"
                        className="bg-amber-600 hover:bg-amber-700">
                        {isSyncing ? (
                            <>
                                <RiRefreshLine className="mr-2 h-4 w-4 animate-spin" />
                                Sincronizando...
                            </>
                        ) : (
                            <>
                                <RiRefreshLine className="mr-2 h-4 w-4" />
                                Sincronizar
                            </>
                        )}
                    </Button>
                    <Button
                        onClick={onDismiss}
                        variant="ghost"
                        size="icon"
                        className="text-amber-600 hover:bg-amber-100 hover:text-amber-800">
                        <RiCloseLine className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
