'use client';

import { useSession } from 'next-auth/react';
import {
    type CalendarEvent,
    type CalendarView,
    EventCalendar,
} from '@/components/calendar-event/event-calendar';
import { CalendarEventSkeleton } from '@/components/calendar-event/calendar-event-skeleton';
import { useReservations } from '@/hooks/use-reservations';
import { useCallback } from 'react';

interface ReservationCalendarViewProps {
    readOnly?: boolean;
    initialView?: CalendarView;
}

export default function ReservationCalendarView({
    readOnly = false,
    initialView = 'month',
}: ReservationCalendarViewProps) {
    const { status } = useSession();
    const {
        reservations,
        isLoading,
        addReservation,
        updateReservation,
        deleteReservation,
        currentUserId,
    } = useReservations({ publicMode: readOnly });

    const canEditEvent = useCallback(
        (event: CalendarEvent) => {
            if (readOnly || !currentUserId) return false;
            const reservation = reservations.find((r) => r.id === event.id);
            return reservation?.userId === currentUserId;
        },
        [readOnly, currentUserId, reservations]
    );

    const handleEventAdd = async (event: CalendarEvent) => {
        await addReservation(event);
    };

    const handleEventUpdate = async (updatedEvent: CalendarEvent) => {
        await updateReservation(updatedEvent);
    };

    const handleEventDelete = async (eventId: string) => {
        await deleteReservation(eventId);
    };

    if (isLoading || (!readOnly && status === 'loading')) {
        return <CalendarEventSkeleton />;
    }

    if (!readOnly && status !== 'authenticated') {
        return (
            <div className="rounded-md bg-amber-50 px-4 py-3 text-center text-sm text-amber-800">
                Debes iniciar sesión para reservar turnos en la sala de reuniones.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <EventCalendar
                events={reservations}
                onEventAdd={readOnly ? undefined : handleEventAdd}
                onEventDelete={readOnly ? undefined : handleEventDelete}
                onEventUpdate={readOnly ? undefined : handleEventUpdate}
                readOnly={readOnly}
                canEditEvent={canEditEvent}
                initialView={initialView}
            />
        </div>
    );
}
