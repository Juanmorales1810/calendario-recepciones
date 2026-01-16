'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import type { CalendarEvent } from '@/components/calendar-event/types';

const STORAGE_KEY = 'calendar-events';
const SYNC_STATUS_KEY = 'calendar-sync-status';

interface SyncStatus {
    lastSynced: string | null;
    pendingSync: boolean;
}

interface UseEventsReturn {
    events: CalendarEvent[];
    isLoading: boolean;
    error: string | null;
    syncStatus: SyncStatus;
    addEvent: (event: CalendarEvent) => Promise<void>;
    updateEvent: (event: CalendarEvent) => Promise<void>;
    deleteEvent: (eventId: string) => Promise<void>;
    syncFromLocalStorage: () => Promise<void>;
    clearLocalStorage: () => void;
}

// Función auxiliar para convertir fechas
function parseEvent(event: any): CalendarEvent {
    return {
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
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

export function useEvents(): UseEventsReturn {
    const { data: session, status } = useSession();
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [syncStatus, setSyncStatus] = useState<SyncStatus>({
        lastSynced: null,
        pendingSync: false,
    });

    // Cargar eventos al montar o cuando cambia la sesión
    useEffect(() => {
        async function loadEvents() {
            setIsLoading(true);
            setError(null);

            if (status === 'loading') {
                return;
            }

            if (status === 'authenticated' && session?.user?.id) {
                // Usuario autenticado: cargar desde API
                try {
                    const response = await fetch('/api/events');
                    if (response.ok) {
                        const data = await response.json();
                        const serverEvents = data.events.map(parseEvent);
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
        }

        loadEvents();
    }, [session?.user?.id, status]);

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

    // Agregar evento
    const addEvent = useCallback(
        async (event: CalendarEvent) => {
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

            if (session?.user?.id) {
                try {
                    const response = await fetch('/api/events', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            ...eventWithId,
                            start: eventWithId.start.toISOString(),
                            end: eventWithId.end.toISOString(),
                            localId: eventWithId.id,
                        }),
                    });

                    if (response.ok) {
                        const data = await response.json();
                        // Actualizar con el ID del servidor
                        setEvents((prev) => {
                            const updated = prev.map((e) =>
                                e.id === eventWithId.id ? parseEvent(data.event) : e
                            );
                            saveToLocalStorage(updated);
                            return updated;
                        });
                    }
                } catch (err) {
                    console.error('Error guardando en servidor:', err);
                    // El evento ya está guardado localmente, marcar para sync posterior
                    setSyncStatus((prev) => ({ ...prev, pendingSync: true }));
                }
            }
        },
        [session?.user?.id]
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

            if (session?.user?.id) {
                try {
                    const response = await fetch(`/api/events/${event.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            ...event,
                            start: event.start.toISOString(),
                            end: event.end.toISOString(),
                        }),
                    });

                    if (!response.ok) {
                        throw new Error('Error al actualizar');
                    }
                } catch (err) {
                    console.error('Error actualizando en servidor:', err);
                    setSyncStatus((prev) => ({ ...prev, pendingSync: true }));
                }
            }
        },
        [session?.user?.id]
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

            if (session?.user?.id) {
                try {
                    const response = await fetch(`/api/events/${eventId}`, {
                        method: 'DELETE',
                    });

                    if (!response.ok) {
                        throw new Error('Error al eliminar');
                    }
                } catch (err) {
                    console.error('Error eliminando en servidor:', err);
                }
            }
        },
        [session?.user?.id]
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
    };
}
