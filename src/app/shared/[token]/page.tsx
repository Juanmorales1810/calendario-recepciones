'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { EventCalendar } from '@/components/calendar-event/event-calendar';
import { CalendarEventSkeleton } from '@/components/calendar-event/calendar-event-skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    RiArrowLeftLine,
    RiLockLine,
    RiEditLine,
    RiRefreshLine,
    RiFullscreenLine,
    RiFullscreenExitLine,
} from '@remixicon/react';
import Link from 'next/link';
import { useSharedCalendar } from '@/hooks/use-shared-calendar';

export default function SharedCalendarPage() {
    const params = useParams();
    const { data: session, status: sessionStatus } = useSession();
    const token = params.token as string;
    const [isFullView, setIsFullView] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const {
        calendarInfo,
        events,
        isLoading,
        isValidating,
        error,
        addEvent,
        updateEvent,
        deleteEvent,
        refresh,
    } = useSharedCalendar(token, {
        refreshInterval: 15000, // Actualizar cada 15 segundos
        revalidateOnFocus: true, // Actualizar cuando el usuario vuelve a la ventana
    });

    // Manejar el modo de pantalla completa
    useEffect(() => {
        const handleFullscreenChange = () => {
            const isInFullscreen = !!document.fullscreenElement;
            setIsFullscreen(isInFullscreen);
            setIsFullView(isInFullscreen);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    const toggleFullscreen = async () => {
        if (!document.fullscreenElement) {
            try {
                setIsFullView(true);
                await document.documentElement.requestFullscreen();
            } catch (err) {
                console.error('Error al entrar en pantalla completa:', err);
                setIsFullView(false);
            }
        } else {
            try {
                await document.exitFullscreen();
                setIsFullView(false);
            } catch (err) {
                console.error('Error al salir de pantalla completa:', err);
            }
        }
    };

    if (sessionStatus === 'loading' || isLoading) {
        return (
            <div className="container mx-auto py-8">
                <CalendarEventSkeleton />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto py-8">
                <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
                        <h2 className="text-lg font-semibold text-red-800">Error</h2>
                        <p className="mt-2 text-red-600">{error}</p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/">
                            <RiArrowLeftLine className="mr-2 h-4 w-4" />
                            Volver al inicio
                        </Link>
                    </Button>
                </div>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="container mx-auto py-8">
                <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="rounded-lg border p-6 text-center">
                        <h2 className="text-lg font-semibold">Acceso requerido</h2>
                        <p className="text-muted-foreground mt-2">
                            Necesitas iniciar sesión para ver este calendario compartido.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href="/auth/signin">Iniciar sesión</Link>
                    </Button>
                </div>
            </div>
        );
    }

    const canEdit = calendarInfo?.permission === 'write';

    return (
        <div className={isFullView ? 'flex h-screen flex-col' : 'container mx-auto py-8'}>
            {/* Header */}
            <div
                className={`flex items-center justify-between ${isFullView ? 'border-b p-2' : 'mb-6'}`}>
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/">
                            <RiArrowLeftLine className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">{calendarInfo?.calendarName}</h1>
                        <p className="text-muted-foreground text-sm">
                            Compartido por {calendarInfo?.owner.name} ({calendarInfo?.owner.email})
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleFullscreen}
                        title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}>
                        {isFullscreen ? (
                            <RiFullscreenExitLine className="h-4 w-4" />
                        ) : (
                            <RiFullscreenLine className="h-4 w-4" />
                        )}
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => refresh()}
                        disabled={isValidating}
                        title="Actualizar">
                        <RiRefreshLine
                            className={`h-4 w-4 ${isValidating ? 'animate-spin' : ''}`}
                        />
                    </Button>
                    <Badge variant={canEdit ? 'default' : 'secondary'}>
                        {canEdit ? (
                            <>
                                <RiEditLine className="mr-1 h-3 w-3" />
                                Lectura y escritura
                            </>
                        ) : (
                            <>
                                <RiLockLine className="mr-1 h-3 w-3" />
                                Solo lectura
                            </>
                        )}
                    </Badge>
                    {isValidating && !isLoading && (
                        <span className="text-muted-foreground text-xs">Actualizando...</span>
                    )}
                </div>
            </div>

            {/* Calendario */}
            <div className={isFullView ? 'flex-1' : ''}>
                <EventCalendar
                    events={events}
                    onEventAdd={canEdit ? addEvent : undefined}
                    onEventUpdate={canEdit ? updateEvent : undefined}
                    onEventDelete={canEdit ? deleteEvent : undefined}
                    className={isFullView ? 'max-h-[calc(100vh-4rem)]' : ''}
                    fullscreen={isFullView}
                />
            </div>
        </div>
    );
}
