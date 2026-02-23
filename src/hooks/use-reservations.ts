'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import type { CalendarEvent } from '@/components/calendar-event/types';
import { toast } from 'sonner';

interface ReservationEvent extends CalendarEvent {
    userId?: string;
    userName?: string;
}

interface UseReservationsOptions {
    publicMode?: boolean;
}

interface UseReservationsReturn {
    reservations: ReservationEvent[];
    isLoading: boolean;
    addReservation: (event: CalendarEvent) => Promise<void>;
    updateReservation: (event: CalendarEvent) => Promise<void>;
    deleteReservation: (eventId: string) => Promise<void>;
    refresh: () => Promise<void>;
    currentUserId: string | undefined;
}

function parseReservation(r: Record<string, unknown>): ReservationEvent {
    return {
        id: r.id as string,
        title: r.title as string,
        description: r.description as string | undefined,
        start: new Date(r.start as string),
        end: new Date(r.end as string),
        allDay: r.allDay as boolean | undefined,
        color: r.color as CalendarEvent['color'],
        location: r.location as string | undefined,
        userId: r.userId as string | undefined,
        userName: r.userName as string | undefined,
    };
}

export function useReservations(options: UseReservationsOptions = {}): UseReservationsReturn {
    const { publicMode = false } = options;
    const { data: session, status } = useSession();
    const [reservations, setReservations] = useState<ReservationEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadReservations = useCallback(async () => {
        setIsLoading(true);
        if (status === 'loading') return;

        try {
            const url = publicMode ? '/api/reservations/public' : '/api/reservations';
            const response = await fetch(url);

            if (response.ok) {
                const data = await response.json();
                setReservations(data.reservations.map(parseReservation));
            } else if (response.status === 401 && !publicMode) {
                toast.error('Debes iniciar sesión para ver las reservas');
            } else {
                throw new Error('Error al cargar reservas');
            }
        } catch (err) {
            console.error('Error cargando reservas:', err);
            toast.error('Error al cargar las reservas');
        }

        setIsLoading(false);
    }, [status, publicMode]);

    useEffect(() => {
        loadReservations();
    }, [loadReservations]);

    const addReservation = useCallback(
        async (event: CalendarEvent) => {
            if (!session?.user?.id) {
                toast.error('Debes iniciar sesión para crear una reserva');
                return;
            }

            try {
                const response = await fetch('/api/reservations', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: event.title,
                        description: event.description,
                        start: event.start.toISOString(),
                        end: event.end.toISOString(),
                        allDay: event.allDay,
                        color: event.color,
                        location: event.location,
                    }),
                });

                if (response.ok) {
                    const data = await response.json();
                    const newReservation = parseReservation(data.reservation);
                    setReservations((prev) =>
                        [...prev, newReservation].sort(
                            (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
                        )
                    );
                } else {
                    const data = await response.json();
                    throw new Error(data.error || 'Error al crear reserva');
                }
            } catch (err) {
                console.error('Error creando reserva:', err);
                toast.error(err instanceof Error ? err.message : 'Error al crear la reserva');
                throw err;
            }
        },
        [session?.user?.id]
    );

    const updateReservation = useCallback(
        async (event: CalendarEvent) => {
            if (!session?.user?.id) {
                toast.error('Debes iniciar sesión');
                return;
            }

            try {
                const response = await fetch(`/api/reservations/${event.id}`, {
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: event.title,
                        description: event.description,
                        start: event.start.toISOString(),
                        end: event.end.toISOString(),
                        allDay: event.allDay,
                        color: event.color,
                        location: event.location,
                    }),
                });

                if (response.ok) {
                    const data = await response.json();
                    const updated = parseReservation(data.reservation);
                    setReservations((prev) =>
                        prev
                            .map((r) =>
                                r.id === updated.id ? { ...updated, userName: r.userName } : r
                            )
                            .sort(
                                (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
                            )
                    );
                } else {
                    const data = await response.json();
                    throw new Error(data.error || 'Error al actualizar reserva');
                }
            } catch (err) {
                console.error('Error actualizando reserva:', err);
                toast.error(err instanceof Error ? err.message : 'Error al actualizar la reserva');
                throw err;
            }
        },
        [session?.user?.id]
    );

    const deleteReservation = useCallback(
        async (eventId: string) => {
            if (!session?.user?.id) {
                toast.error('Debes iniciar sesión');
                return;
            }

            try {
                const response = await fetch(`/api/reservations/${eventId}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    setReservations((prev) => prev.filter((r) => r.id !== eventId));
                } else {
                    const data = await response.json();
                    throw new Error(data.error || 'Error al eliminar reserva');
                }
            } catch (err) {
                console.error('Error eliminando reserva:', err);
                toast.error(err instanceof Error ? err.message : 'Error al eliminar la reserva');
            }
        },
        [session?.user?.id]
    );

    return {
        reservations,
        isLoading,
        addReservation,
        updateReservation,
        deleteReservation,
        refresh: loadReservations,
        currentUserId: session?.user?.id,
    };
}
