'use client';

import { addDays, setHours, setMinutes, subDays } from 'date-fns';
import { useState, useEffect } from 'react';

import { type CalendarEvent, EventCalendar } from '@/components/calendar-event/event-calendar';

const STORAGE_KEY = 'calendar-events';

// Sample events data with hardcoded times

export default function CalendarEvent() {
    const [events, setEvents] = useState<CalendarEvent[]>([]);

    // Load events from localStorage on mount
    useEffect(() => {
        const storedEvents = localStorage.getItem(STORAGE_KEY);
        if (storedEvents) {
            try {
                const parsed = JSON.parse(storedEvents);
                // Convert date strings back to Date objects
                const eventsWithDates = parsed.map((event: any) => ({
                    ...event,
                    start: new Date(event.start),
                    end: new Date(event.end),
                }));
                setEvents(eventsWithDates);
            } catch (error) {
                console.error('Error loading events from localStorage:', error);
            }
        } else {
            setEvents([]);
        }
    }, []);

    // Save events to localStorage whenever they change
    useEffect(() => {
        if (events.length > 0) {
            try {
                // Convert Date objects to ISO strings for storage
                const eventsToStore = events.map((event) => ({
                    ...event,
                    start: event.start.toISOString(),
                    end: event.end.toISOString(),
                }));
                localStorage.setItem(STORAGE_KEY, JSON.stringify(eventsToStore));
            } catch (error) {
                console.error('Error saving events to localStorage:', error);
            }
        }
    }, [events]);

    const handleEventAdd = (event: CalendarEvent) => {
        setEvents([...events, event]);
    };

    const handleEventUpdate = (updatedEvent: CalendarEvent) => {
        setEvents(events.map((event) => (event.id === updatedEvent.id ? updatedEvent : event)));
    };

    const handleEventDelete = (eventId: string) => {
        setEvents(events.filter((event) => event.id !== eventId));
    };

    return (
        <EventCalendar
            events={events}
            onEventAdd={handleEventAdd}
            onEventDelete={handleEventDelete}
            onEventUpdate={handleEventUpdate}
        />
    );
}
