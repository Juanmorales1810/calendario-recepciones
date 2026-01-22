'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import type { CalendarEvent } from '@/components/calendar-event/types';
import { scheduleEventNotifications, cancelEventNotifications } from '@/lib/notifications';

const STORAGE_KEY = 'calendar-events';
const SYNC_STATUS_KEY = 'calendar-sync-status';

interface SyncStatus {
    lastSynced: string | null;
    pendingSync: boolean;
}

interface UseEventsOptions {
    calendarId?: string; // Filtrar por calendario específico
}

interface UseEventsReturn {
    events: CalendarEvent[];
    isLoading: boolean;
    error: string | null;
    syncStatus: SyncStatus;
    addEvent: (event: CalendarEvent, calendarId?: string) => Promise<void>;
    updateEvent: (event: CalendarEvent) => Promise<void>;
    deleteEvent: (eventId: string) => Promise<void>;
    syncFromLocalStorage: () => Promise<void>;
    clearLocalStorage: () => void;
    refresh: () => Promise<void>;
}

// Función auxiliar para convertir fechas y preservar calendarId
function parseEvent(event: Record<string, unknown>): CalendarEvent {
    return {
        id: event.id as string,
        title: event.title as string,
        description: event.description as string | undefined,
        start: new Date(event.start as string),
        end: new Date(event.end as string),
        allDay: event.allDay as boolean | undefined,
        color: event.color as CalendarEvent['color'],
        location: event.location as string | undefined,
        calendarId: event.calendarId as string | undefined,
    };
}

// Función para guardar en localStorage
function saveToLocalStorage(events: CalendarEvent[]) {
    try {
        const eventsToStore = events.map((event) => ({
            ...event,
            start: event.start.toISOString(),
            end: event.end.toISOString(),
        }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(eventsToStore));
    } catch (error) {
        console.error('Error guardando en localStorage:', error);
    }
}

// Función para cargar desde localStorage
function loadFromLocalStorage(): CalendarEvent[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            return parsed.map(parseEvent);
        }
    } catch (error) {
        console.error('Error cargando desde localStorage:', error);
    }
    return [];
}

export function useEvents(options: UseEventsOptions = {}): UseEventsReturn {
    const { calendarId } = options;
    const { data: session, status } = useSession();
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [syncStatus, setSyncStatus] = useState<SyncStatus>({
        lastSynced: null,
        pendingSync: false,
    });

    // Función para cargar eventos
    const loadEvents = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        if (status === 'loading') {
            return;
        }

        if (status === 'authenticated' && session?.user?.id) {
            // Usuario autenticado: cargar desde API
            try {
                let url = '/api/events';

                // Detectar si el calendarId es un shareToken (64 caracteres hex)
                const isShareToken =
                    calendarId && calendarId.length === 64 && /^[a-f0-9]+$/.test(calendarId);

                if (isShareToken) {
                    // Es un calendario compartido, usar el endpoint de shared
                    url = `/api/shared/${calendarId}`;
                } else if (calendarId) {
                    // Es un calendario propio
                    url += `?calendarId=${calendarId}`;
                }

                console.log('Fetching events from:', url);

                const response = await fetch(url);
                if (response.ok) {
                    const data = await response.json();

                    // El endpoint de shared devuelve { events: [...] }, el de events también
                    const serverEvents = data.events.map(parseEvent);

                    console.log('Received events:', serverEvents.length);

                    setEvents(serverEvents);
                    // También actualizar localStorage como cache offline
                    saveToLocalStorage(serverEvents);
                } else {
                    throw new Error('Error al cargar eventos del servidor');
                }
            } catch (err) {
                console.error('Error cargando eventos:', err);
                // Fallback a localStorage si hay error de red
                const localEvents = loadFromLocalStorage();
                setEvents(localEvents);
                setError('Trabajando en modo offline');
            }
        } else {
            // Usuario no autenticado: usar solo localStorage
            const localEvents = loadFromLocalStorage();
            setEvents(localEvents);
        }

        setIsLoading(false);
    }, [session?.user?.id, status, calendarId]);

    // Cargar eventos al montar o cuando cambia la sesión o el calendario
    useEffect(() => {
        loadEvents();
    }, [loadEvents]);

    // Cargar estado de sincronización
    useEffect(() => {
        try {
            const stored = localStorage.getItem(SYNC_STATUS_KEY);
            if (stored) {
                setSyncStatus(JSON.parse(stored));
            }
        } catch (error) {
            console.error('Error cargando estado de sincronización:', error);
        }
    }, []);

    // Sincronizar eventos desde localStorage al servidor
    const syncFromLocalStorage = useCallback(async () => {
        if (!session?.user?.id) {
            setError('Debes iniciar sesión para sincronizar');
            return;
        }

        const localEvents = loadFromLocalStorage();

        if (localEvents.length === 0) {
            // Si no hay eventos locales, solo actualizar el estado de sincronización
            const newSyncStatus = {
                lastSynced: new Date().toISOString(),
                pendingSync: false,
            };
            setSyncStatus(newSyncStatus);
            localStorage.setItem(SYNC_STATUS_KEY, JSON.stringify(newSyncStatus));
            return;
        }

        try {
            setSyncStatus((prev) => ({ ...prev, pendingSync: true }));

            const response = await fetch('/api/events/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    events: localEvents.map((e) => ({
                        ...e,
                        start: e.start.toISOString(),
                        end: e.end.toISOString(),
                    })),
                }),
            });

            if (response.ok) {
                const data = await response.json();
                const serverEvents = data.events.map(parseEvent);

                // Actualizar el estado con los eventos del servidor
                setEvents(serverEvents);

                // IMPORTANTE: Guardar los eventos del servidor en localStorage
                // Esto reemplaza los eventos locales con los del servidor (que tienen IDs de MongoDB)
                saveToLocalStorage(serverEvents);

                const newSyncStatus = {
                    lastSynced: new Date().toISOString(),
                    pendingSync: false,
                };
                setSyncStatus(newSyncStatus);
                localStorage.setItem(SYNC_STATUS_KEY, JSON.stringify(newSyncStatus));

                // Limpiar el error si la sincronización fue exitosa
                setError(null);
            } else {
                throw new Error('Error al sincronizar');
            }
        } catch (err) {
            console.error('Error en sincronización:', err);
            setError('Error al sincronizar eventos');
            setSyncStatus((prev) => ({ ...prev, pendingSync: false }));
        }
    }, [session?.user?.id]);

    // Helper para detectar si es un shareToken (64 caracteres hex)
    const isShareToken = useCallback((id: string | undefined): boolean => {
        return !!id && id.length === 64 && /^[a-f0-9]+$/.test(id);
    }, []);

    // Agregar evento
    const addEvent = useCallback(
        async (event: CalendarEvent, targetCalendarId?: string) => {
            // Generar ID local si no existe
            const eventWithId = {
                ...event,
                id: event.id || crypto.randomUUID(),
            };

            // Actualizar estado local inmediatamente (optimistic update)
            setEvents((prev) => {
                const updated = [...prev, eventWithId];
                saveToLocalStorage(updated);
                return updated;
            });

            // Programar notificaciones para el evento
            scheduleEventNotifications(eventWithId);

            if (session?.user?.id) {
                try {
                    const effectiveCalendarId = targetCalendarId || calendarId;
                    const isSharedCalendar = isShareToken(effectiveCalendarId);

                    let url = '/api/events';
                    let body: Record<string, unknown> = {
                        ...eventWithId,
                        start: eventWithId.start.toISOString(),
                        end: eventWithId.end.toISOString(),
                        localId: eventWithId.id,
                        calendarId: effectiveCalendarId,
                    };

                    // Si es un calendario compartido, usar el endpoint de shared
                    if (isSharedCalendar) {
                        url = `/api/shared/${effectiveCalendarId}`;
                        // Para calendarios compartidos, no enviamos calendarId en el body
                        // ya que el token ya identifica el calendario
                        body = {
                            title: eventWithId.title,
                            description: eventWithId.description,
                            start: eventWithId.start.toISOString(),
                            end: eventWithId.end.toISOString(),
                            allDay: eventWithId.allDay,
                            color: eventWithId.color,
                            location: eventWithId.location,
                        };
                    }

                    console.log('Creating event at:', url, 'isShared:', isSharedCalendar);

                    const response = await fetch(url, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(body),
                    });

                    if (response.ok) {
                        const data = await response.json();
                        // Actualizar con el ID del servidor
                        // Para calendarios compartidos, la respuesta es directa, no tiene .event
                        const serverEvent = isSharedCalendar ? data : data.event;
                        setEvents((prev) => {
                            const updated = prev.map((e) =>
                                e.id === eventWithId.id ? parseEvent(serverEvent) : e
                            );
                            saveToLocalStorage(updated);
                            return updated;
                        });
                    } else {
                        const errorData = await response.json();
                        console.error('Error al crear evento:', errorData.error);
                    }
                } catch (err) {
                    console.error('Error guardando en servidor:', err);
                    // El evento ya está guardado localmente, marcar para sync posterior
                    setSyncStatus((prev) => ({ ...prev, pendingSync: true }));
                }
            }
        },
        [session?.user?.id, calendarId, isShareToken]
    );

    // Actualizar evento
    const updateEvent = useCallback(
        async (event: CalendarEvent) => {
            // Actualizar estado local inmediatamente
            setEvents((prev) => {
                const updated = prev.map((e) => (e.id === event.id ? event : e));
                saveToLocalStorage(updated);
                return updated;
            });

            // Actualizar notificaciones programadas
            cancelEventNotifications(event.id);
            scheduleEventNotifications(event);

            if (session?.user?.id) {
                try {
                    const isSharedCalendar = isShareToken(calendarId);

                    let url: string;
                    let body: Record<string, unknown>;

                    if (isSharedCalendar) {
                        // Para calendarios compartidos, usar el endpoint de shared con PUT
                        url = `/api/shared/${calendarId}`;
                        body = {
                            eventId: event.id,
                            title: event.title,
                            description: event.description,
                            start: event.start.toISOString(),
                            end: event.end.toISOString(),
                            allDay: event.allDay,
                            color: event.color,
                            location: event.location,
                        };
                    } else {
                        url = `/api/events/${event.id}`;
                        body = {
                            ...event,
                            start: event.start.toISOString(),
                            end: event.end.toISOString(),
                        };
                    }

                    console.log('Updating event at:', url, 'isShared:', isSharedCalendar);

                    const response = await fetch(url, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(body),
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        console.error('Error al actualizar:', errorData.error);
                        throw new Error('Error al actualizar');
                    }
                } catch (err) {
                    console.error('Error actualizando en servidor:', err);
                    setSyncStatus((prev) => ({ ...prev, pendingSync: true }));
                }
            }
        },
        [session?.user?.id, calendarId, isShareToken]
    );

    // Eliminar evento
    const deleteEvent = useCallback(
        async (eventId: string) => {
            // Eliminar del estado local inmediatamente
            setEvents((prev) => {
                const updated = prev.filter((e) => e.id !== eventId);
                saveToLocalStorage(updated);
                return updated;
            });

            // Cancelar notificaciones programadas
            cancelEventNotifications(eventId);

            if (session?.user?.id) {
                try {
                    const isSharedCalendar = isShareToken(calendarId);

                    let url: string;

                    if (isSharedCalendar) {
                        // Para calendarios compartidos, usar el endpoint de shared con eventId como query param
                        url = `/api/shared/${calendarId}?eventId=${eventId}`;
                    } else {
                        url = `/api/events/${eventId}`;
                    }

                    console.log('Deleting event at:', url, 'isShared:', isSharedCalendar);

                    const response = await fetch(url, {
                        method: 'DELETE',
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        console.error('Error al eliminar:', errorData.error);
                        throw new Error('Error al eliminar');
                    }
                } catch (err) {
                    console.error('Error eliminando en servidor:', err);
                }
            }
        },
        [session?.user?.id, calendarId, isShareToken]
    );

    // Limpiar localStorage
    const clearLocalStorage = useCallback(() => {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(SYNC_STATUS_KEY);
    }, []);

    return {
        events,
        isLoading,
        error,
        syncStatus,
        addEvent,
        updateEvent,
        deleteEvent,
        syncFromLocalStorage,
        clearLocalStorage,
        refresh: loadEvents,
    };
}
