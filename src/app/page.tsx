'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import CalendarEvent from '@/components/calendar-event';
import { Navbar } from '@/components/interfaces/navbar';
import { useEvents } from '@/hooks/use-events';
import { SyncBanner } from '@/components/sync-banner';
import { RiLoader4Line } from '@remixicon/react';

function PageContent() {
    const { data: session, status } = useSession();
    const { syncFromLocalStorage, syncStatus } = useEvents();
    const [showSyncBanner, setShowSyncBanner] = useState(false);

    useEffect(() => {
        if (status === 'authenticated' && session?.user?.id) {
            const storedEvents = localStorage.getItem('calendar-events');
            const syncStatusStored = localStorage.getItem('calendar-sync-status');

            if (storedEvents) {
                try {
                    const events = JSON.parse(storedEvents);
                    const syncInfo = syncStatusStored ? JSON.parse(syncStatusStored) : null;

                    if (events.length > 0 && !syncInfo?.lastSynced) {
                        setShowSyncBanner(true);
                    }
                } catch (error) {
                    console.error('Error parsing localStorage:', error);
                }
            }
        }
    }, [status, session?.user?.id]);

    const handleSync = async () => {
        await syncFromLocalStorage();
        setShowSyncBanner(false);
    };

    const dismissBanner = () => {
        setShowSyncBanner(false);
    };

    return (
        <>
            <Navbar onSync={syncFromLocalStorage} hasPendingSync={syncStatus.pendingSync} />

            {showSyncBanner && <SyncBanner onSync={handleSync} onDismiss={dismissBanner} />}

            <div className="mx-auto max-w-7xl px-4 py-8">
                <div className="mb-4 text-center">
                    <h1 className="text-4xl font-bold tracking-tight">Calendario de Eventos</h1>
                    {status === 'authenticated' && session?.user?.name && (
                        <p className="text-muted-foreground mt-2">
                            Bienvenido, {session.user.name}
                        </p>
                    )}
                </div>

                <CalendarEvent />
            </div>
        </>
    );
}

export default function Page() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen items-center justify-center">
                    <RiLoader4Line className="text-muted-foreground h-8 w-8 animate-spin" />
                </div>
            }>
            <PageContent />
        </Suspense>
    );
}
