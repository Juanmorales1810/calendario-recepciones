'use client';

import useSWR from 'swr';

export interface OwnCalendar {
    id: string;
    name: string;
    description?: string;
    color: string;
    isDefault: boolean;
    type: 'own';
}

export interface SharedCalendarItem {
    id: string;
    name: string;
    color: string;
    type: 'shared';
    permission: 'read' | 'write';
    shareToken: string;
    owner: {
        name: string;
        email: string;
    };
}

export type CalendarItem = OwnCalendar | SharedCalendarItem;

interface CalendarsResponse {
    own: OwnCalendar[];
    shared: SharedCalendarItem[];
}

const fetcher = async (url: string): Promise<CalendarsResponse> => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Error al cargar calendarios');
    }
    return response.json();
};

export function useCalendars() {
    const { data, error, isLoading, mutate } = useSWR<CalendarsResponse>(
        '/api/calendars',
        fetcher,
        {
            revalidateOnFocus: true,
        }
    );

    const createCalendar = async (calendar: {
        name: string;
        description?: string;
        color?: string;
    }) => {
        const response = await fetch('/api/calendars', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(calendar),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al crear calendario');
        }

        const newCalendar = await response.json();
        await mutate();
        return newCalendar;
    };

    const updateCalendar = async (
        id: string,
        updates: { name?: string; description?: string; color?: string }
    ) => {
        const response = await fetch(`/api/calendars/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al actualizar calendario');
        }

        await mutate();
    };

    const deleteCalendar = async (id: string) => {
        const response = await fetch(`/api/calendars/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al eliminar calendario');
        }

        await mutate();
    };

    const allCalendars: CalendarItem[] = [...(data?.own || []), ...(data?.shared || [])];

    const defaultCalendar = data?.own?.find((c) => c.isDefault);

    return {
        ownCalendars: data?.own || [],
        sharedCalendars: data?.shared || [],
        allCalendars,
        defaultCalendar,
        isLoading,
        error: error?.message,
        createCalendar,
        updateCalendar,
        deleteCalendar,
        refresh: () => mutate(),
    };
}
