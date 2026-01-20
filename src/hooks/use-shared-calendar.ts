'use client';

import useSWR from 'swr';
import type { CalendarEvent } from '@/components/calendar-event/types';

interface SharedCalendarInfo {
    id: string;
    calendarName: string;
    permission: 'read' | 'write';
    status: string;
    owner: {
        name: string;
        email: string;
    };
}

interface SharedCalendarData {
    share: SharedCalendarInfo;
    events: CalendarEvent[];
}

const fetcher = async (url: string): Promise<SharedCalendarData> => {
    const response = await fetch(url);
    if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al cargar el calendario');
    }
    return response.json();
};

interface UseSharedCalendarOptions {
    refreshInterval?: number; // Intervalo de refresco en milisegundos
    revalidateOnFocus?: boolean; // Revalidar cuando el usuario vuelve a la ventana
}

export function useSharedCalendar(token: string | null, options: UseSharedCalendarOptions = {}) {
    const { refreshInterval = 30000, revalidateOnFocus = true } = options;

    const { data, error, isLoading, isValidating, mutate } = useSWR<SharedCalendarData>(
        token ? `/api/shared/${token}` : null,
        fetcher,
        {
            refreshInterval, // Por defecto cada 30 segundos
            revalidateOnFocus, // Revalidar cuando el usuario vuelve a la pestaña
            revalidateOnReconnect: true, // Revalidar al reconectar internet
            dedupingInterval: 5000, // Evitar peticiones duplicadas en 5 segundos
        }
    );

    const addEvent = async (event: CalendarEvent) => {
        if (!token) return;

        // Optimistic update
        const optimisticData = data
            ? {
                  ...data,
                  events: [...data.events, { ...event, id: `temp-${Date.now()}` }],
              }
            : undefined;

        await mutate(
            async () => {
                const response = await fetch(`/api/shared/${token}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(event),
                });

                if (!response.ok) {
                    throw new Error('Error al crear evento');
                }

                const newEvent = await response.json();
                return data
                    ? {
                          ...data,
                          events: [...data.events, newEvent],
                      }
                    : undefined;
            },
            {
                optimisticData,
                rollbackOnError: true,
                revalidate: true,
            }
        );
    };

    const updateEvent = async (updatedEvent: CalendarEvent) => {
        if (!token || !data) return;

        // Optimistic update
        const optimisticData = {
            ...data,
            events: data.events.map((e) => (e.id === updatedEvent.id ? updatedEvent : e)),
        };

        await mutate(
            async () => {
                const response = await fetch(`/api/shared/${token}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ eventId: updatedEvent.id, ...updatedEvent }),
                });

                if (!response.ok) {
                    throw new Error('Error al actualizar evento');
                }

                const updated = await response.json();
                return {
                    ...data,
                    events: data.events.map((e) => (e.id === updated.id ? updated : e)),
                };
            },
            {
                optimisticData,
                rollbackOnError: true,
                revalidate: true,
            }
        );
    };

    const deleteEvent = async (eventId: string) => {
        if (!token || !data) return;

        // Optimistic update
        const optimisticData = {
            ...data,
            events: data.events.filter((e) => e.id !== eventId),
        };

        await mutate(
            async () => {
                const response = await fetch(`/api/shared/${token}?eventId=${eventId}`, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    throw new Error('Error al eliminar evento');
                }

                return {
                    ...data,
                    events: data.events.filter((e) => e.id !== eventId),
                };
            },
            {
                optimisticData,
                rollbackOnError: true,
                revalidate: true,
            }
        );
    };

    return {
        calendarInfo: data?.share ?? null,
        events: data?.events ?? [],
        isLoading,
        isValidating, // Indica si está revalidando en segundo plano
        error: error?.message ?? null,
        addEvent,
        updateEvent,
        deleteEvent,
        refresh: () => mutate(), // Función para refrescar manualmente
    };
}
