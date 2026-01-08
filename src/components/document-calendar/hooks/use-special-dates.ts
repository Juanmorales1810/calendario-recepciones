'use client';

import { useState, useEffect, useCallback } from 'react';
import { isSameDay, startOfDay, parse, isValid } from 'date-fns';
import type { Holiday, EmergencyDay } from '../types';
import { STORAGE_KEYS } from '../types';

export function useSpecialDates() {
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [emergencyDays, setEmergencyDays] = useState<EmergencyDay[]>([]);

    // Load from localStorage on mount
    useEffect(() => {
        const storedHolidays = localStorage.getItem(STORAGE_KEYS.holidays);
        const storedEmergencies = localStorage.getItem(STORAGE_KEYS.emergencies);

        if (storedHolidays) {
            const parsed = JSON.parse(storedHolidays) as { date: string; name: string }[];
            setHolidays(parsed.map((h) => ({ ...h, date: new Date(h.date) })));
        }

        if (storedEmergencies) {
            const parsed = JSON.parse(storedEmergencies) as { date: string; description: string }[];
            setEmergencyDays(parsed.map((e) => ({ ...e, date: new Date(e.date) })));
        }
    }, []);

    // Persist holidays to localStorage
    useEffect(() => {
        if (holidays.length > 0) {
            localStorage.setItem(
                STORAGE_KEYS.holidays,
                JSON.stringify(holidays.map((h) => ({ date: h.date.toISOString(), name: h.name })))
            );
        } else {
            localStorage.removeItem(STORAGE_KEYS.holidays);
        }
    }, [holidays]);

    // Persist emergencies to localStorage
    useEffect(() => {
        if (emergencyDays.length > 0) {
            localStorage.setItem(
                STORAGE_KEYS.emergencies,
                JSON.stringify(
                    emergencyDays.map((e) => ({
                        date: e.date.toISOString(),
                        description: e.description,
                    }))
                )
            );
        } else {
            localStorage.removeItem(STORAGE_KEYS.emergencies);
        }
    }, [emergencyDays]);

    const isHoliday = useCallback(
        (date: Date): boolean => {
            return holidays.some((h) => isSameDay(h.date, date));
        },
        [holidays]
    );

    const isEmergencyDay = useCallback(
        (date: Date): boolean => {
            return emergencyDays.some((e) => isSameDay(e.date, date));
        },
        [emergencyDays]
    );

    const addHoliday = useCallback((dateString: string, name: string) => {
        if (!dateString || !name) return false;
        const parsedDate = parse(dateString, 'yyyy-MM-dd', new Date());
        if (!isValid(parsedDate)) return false;

        setHolidays((prev) => [...prev, { date: startOfDay(parsedDate), name }]);
        return true;
    }, []);

    const removeHoliday = useCallback((index: number) => {
        setHolidays((prev) => prev.filter((_, i) => i !== index));
    }, []);

    const addEmergency = useCallback((dateString: string, description: string) => {
        if (!dateString || !description) return false;
        const parsedDate = parse(dateString, 'yyyy-MM-dd', new Date());
        if (!isValid(parsedDate)) return false;

        setEmergencyDays((prev) => [...prev, { date: startOfDay(parsedDate), description }]);
        return true;
    }, []);

    const removeEmergency = useCallback((index: number) => {
        setEmergencyDays((prev) => prev.filter((_, i) => i !== index));
    }, []);

    return {
        holidays,
        emergencyDays,
        isHoliday,
        isEmergencyDay,
        addHoliday,
        removeHoliday,
        addEmergency,
        removeEmergency,
    };
}
