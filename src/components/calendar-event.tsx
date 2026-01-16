'use client';

import { type CalendarEvent, EventCalendar } from '@/components/calendar-event/event-calendar';
import { CalendarEventSkeleton } from '@/components/calendar-event/calendar-event-skeleton';
import { useEvents } from '@/hooks/use-events';

export default function CalendarEvent() {
    const { events, isLoading, error, addEvent, updateEvent, deleteEvent } = useEvents();

    const handleEventAdd = async (event: CalendarEvent) => {
        await addEvent(event);
    };

    const handleEventUpdate = async (updatedEvent: CalendarEvent) => {
        await updateEvent(updatedEvent);
    };

    const handleEventDelete = async (eventId: string) => {
        await deleteEvent(eventId);
    };

    if (isLoading) {
        return <CalendarEventSkeleton />;
    }

    return (
        <>
            {error && (
                <div className="mb-4 rounded-md bg-amber-50 px-4 py-2 text-sm text-amber-800">
                    {error}
                </div>
            )}
            <EventCalendar
                events={events}
                onEventAdd={handleEventAdd}
                onEventDelete={handleEventDelete}
                onEventUpdate={handleEventUpdate}
            />
        </>
    );
}
