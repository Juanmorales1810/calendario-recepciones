'use client';

import { useState, useEffect, useMemo } from 'react';
import { type CalendarEvent, EventCalendar } from '@/components/calendar-event/event-calendar';
import { CalendarEventSkeleton } from '@/components/calendar-event/calendar-event-skeleton';
import { CalendarSelectorDialog } from '@/components/calendar-selector';
import { useEvents } from '@/hooks/use-events';
import { useCalendars } from '@/hooks/use-calendars';

export default function CalendarEventView() {
    const {
        defaultCalendar,
        ownCalendars,
        sharedCalendars,
        isLoading: calendarsLoading,
    } = useCalendars();
    const [selectedCalendarId, setSelectedCalendarId] = useState<string | null>(null);

    // Inicializar con el calendario por defecto
    useEffect(() => {
        if (defaultCalendar && !selectedCalendarId) {
            setSelectedCalendarId(defaultCalendar.id);
        }
    }, [defaultCalendar, selectedCalendarId]);

    // Obtener el calendario seleccionado actualmente
    const selectedCalendar = useMemo(() => {
        // Primero buscar en calendarios propios
        const ownCal = ownCalendars.find((c) => c.id === selectedCalendarId);
        if (ownCal) return ownCal;

        // Si no está, buscar en calendarios compartidos usando el shareToken
        const sharedCal = sharedCalendars.find((c) => c.shareToken === selectedCalendarId);
        if (sharedCal) {
            // Retornar en formato compatible con el selector
            return {
                id: sharedCal.shareToken,
                name: sharedCal.name,
                color: 'slate', // Los calendarios compartidos usan color slate
                isDefault: false,
            };
        }

        return undefined;
    }, [selectedCalendarId, ownCalendars, sharedCalendars]);

    // Usar el calendarId directamente para filtrar en el servidor
    const { events, isLoading, error, addEvent, updateEvent, deleteEvent } = useEvents({
        calendarId: selectedCalendarId || undefined,
    });

    const handleCalendarChange = (ids: string[]) => {
        // Solo tomamos el primer ID ya que es selección única
        setSelectedCalendarId(ids[0] || null);
    };

    const handleEventAdd = async (event: CalendarEvent) => {
        await addEvent(event, selectedCalendarId || defaultCalendar?.id);
    };

    const handleEventUpdate = async (updatedEvent: CalendarEvent) => {
        await updateEvent(updatedEvent);
    };

    const handleEventDelete = async (eventId: string) => {
        await deleteEvent(eventId);
    };

    if (calendarsLoading || !selectedCalendarId) {
        return <CalendarEventSkeleton />;
    }

    return (
        <div className="space-y-4">
            {error && (
                <div className="rounded-md bg-amber-50 px-4 py-2 text-sm text-amber-800">
                    {error}
                </div>
            )}
            <EventCalendar
                events={events}
                onEventAdd={handleEventAdd}
                onEventDelete={handleEventDelete}
                onEventUpdate={handleEventUpdate}
                calendarSelector={
                    <CalendarSelectorDialog
                        selectedCalendars={selectedCalendarId ? [selectedCalendarId] : []}
                        onSelectionChange={handleCalendarChange}
                        selectedCalendarName={selectedCalendar?.name}
                        selectedCalendarColor={selectedCalendar?.color}
                    />
                }
            />
        </div>
    );
}
