'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useQueryState } from 'nuqs';
import CalendarEvent from '@/components/calendar-event';
import { DocumentCalendar } from '@/components/document-calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, FileText } from 'lucide-react';
import { Navbar } from '@/components/interfaces/navbar';
import { useEvents } from '@/hooks/use-events';
import { SyncBanner } from '@/components/sync-banner';
import { RiLoader4Line } from '@remixicon/react';

function PageContent() {
    const [activeTab, setActiveTab] = useQueryState('tab', { defaultValue: 'document' });
    const { data: session, status } = useSession();
    const { syncFromLocalStorage, syncStatus } = useEvents();
    const [showSyncBanner, setShowSyncBanner] = useState(false);

    // Verificar si hay eventos locales para sincronizar cuando el usuario inicia sesión
    useEffect(() => {
        if (status === 'authenticated' && session?.user?.id) {
            // Verificar si hay datos en localStorage que necesitan sincronizarse
            const storedEvents = localStorage.getItem('calendar-events');
            const syncStatusStored = localStorage.getItem('calendar-sync-status');

            if (storedEvents) {
                try {
                    const events = JSON.parse(storedEvents);
                    const syncInfo = syncStatusStored ? JSON.parse(syncStatusStored) : null;

                    // Mostrar banner si hay eventos y no se han sincronizado recientemente
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
                    <h1 className="text-4xl font-bold tracking-tight">Calendario</h1>
                    {status === 'authenticated' && session?.user?.name && (
                        <p className="text-muted-foreground mt-2">
                            Bienvenido, {session.user.name}
                        </p>
                    )}
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="mx-auto mb-4 grid w-full max-w-md grid-cols-2">
                        <TabsTrigger value="document" className="gap-2">
                            <FileText className="h-4 w-4" />
                            Calendario de Recepciones
                        </TabsTrigger>
                        <TabsTrigger value="events" className="gap-2">
                            <Calendar className="h-4 w-4" />
                            Calendario de Eventos
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="document" className="mt-0">
                        <DocumentCalendar />
                    </TabsContent>

                    <TabsContent value="events" className="mt-0">
                        <CalendarEvent />
                    </TabsContent>
                </Tabs>
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
