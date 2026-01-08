'use client';

import { useCallback } from 'react';
import { isWeekend, addDays, isBefore, startOfDay, isAfter, isSameDay } from 'date-fns';
import type { StatusInfo, EmergencyDay } from '../types';

interface UseDateCalculationsProps {
    isHoliday: (date: Date) => boolean;
    emergencyDays: EmergencyDay[];
}

export function useDateCalculations({ isHoliday, emergencyDays }: UseDateCalculationsProps) {
    const isNonBusinessDay = useCallback(
        (date: Date): boolean => {
            return isWeekend(date) || isHoliday(date);
        },
        [isHoliday]
    );

    const calculateEmergencyDeadline = useCallback(
        (emergencyDate: Date): Date => {
            let count = 0;
            let currentDate = startOfDay(emergencyDate);

            while (count < 5) {
                currentDate = addDays(currentDate, 1);
                if (!isNonBusinessDay(currentDate)) {
                    count++;
                }
            }

            return currentDate;
        },
        [isNonBusinessDay]
    );

    const findApplicableEmergency = useCallback(
        (docDate: Date, referenceDate: Date): EmergencyDay | null => {
            for (const emergency of emergencyDays) {
                const emergencyStart = startOfDay(emergency.date);
                if (isSameDay(docDate, emergencyStart)) {
                    const extendedDeadline = calculateEmergencyDeadline(emergencyStart);
                    if (!isAfter(referenceDate, extendedDeadline)) {
                        return emergency;
                    }
                }
            }
            return null;
        },
        [emergencyDays, calculateEmergencyDeadline]
    );

    const calculateCutoffDate = useCallback(
        (fromDate: Date): Date => {
            let count = 0;
            let currentDate = startOfDay(fromDate);

            while (count < 2) {
                currentDate = addDays(currentDate, -1);
                if (!isNonBusinessDay(currentDate)) {
                    count++;
                }
            }

            return currentDate;
        },
        [isNonBusinessDay]
    );

    const calculateBusinessDaysBack = useCallback(
        (docDate: Date, fromDate: Date): number => {
            let count = 0;
            let currentDate = startOfDay(docDate);
            const end = startOfDay(fromDate);

            while (isBefore(currentDate, end)) {
                currentDate = addDays(currentDate, 1);
                if (!isNonBusinessDay(currentDate)) {
                    count++;
                }
            }

            return count;
        },
        [isNonBusinessDay]
    );

    const getReceptionStatus = useCallback(
        (docDate: Date, referenceDate: Date, cutoffDate: Date): StatusInfo => {
            const businessDaysBack = calculateBusinessDaysBack(docDate, referenceDate);

            if (isAfter(docDate, referenceDate)) {
                return {
                    status: 'future',
                    message: 'Documento con fecha futura',
                    businessDaysBack: 0,
                    cutoffDate,
                };
            }

            const applicableEmergency = findApplicableEmergency(docDate, referenceDate);
            if (applicableEmergency) {
                const extendedDeadline = calculateEmergencyDeadline(applicableEmergency.date);
                const formattedDate = new Intl.DateTimeFormat('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                }).format(extendedDeadline);

                return {
                    status: 'emergency-extended',
                    message: `Documento del día de emergencia - Plazo extendido hasta ${formattedDate} - Sin multa`,
                    businessDaysBack,
                    cutoffDate,
                    emergencyExtension: {
                        emergencyDate: applicableEmergency.date,
                        extendedDeadline,
                    },
                };
            }

            if (!isBefore(docDate, cutoffDate)) {
                return {
                    status: 'on-time',
                    message: 'Recepción a tiempo - Sin multa',
                    businessDaysBack,
                    cutoffDate,
                };
            } else {
                return {
                    status: 'with-penalty',
                    message: 'Recepción fuera de plazo - CON MULTA',
                    businessDaysBack,
                    cutoffDate,
                };
            }
        },
        [calculateBusinessDaysBack, findApplicableEmergency, calculateEmergencyDeadline]
    );

    return {
        isNonBusinessDay,
        calculateEmergencyDeadline,
        calculateCutoffDate,
        calculateBusinessDaysBack,
        getReceptionStatus,
    };
}
