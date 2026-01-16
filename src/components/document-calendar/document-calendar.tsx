'use client';

import { useState } from 'react';
import { startOfDay, startOfMonth } from 'date-fns';
import { useSpecialDates, useDateCalculations } from './hooks';
import { CalendarGrid, ResultDialog, SpecialDatesDialog } from './components';
import type { StatusInfo } from './types';

export function DocumentCalendar() {
    const [referenceDate, setReferenceDate] = useState<Date>(startOfDay(new Date()));
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [statusInfo, setStatusInfo] = useState<StatusInfo | null>(null);
    const [currentMonth, setCurrentMonth] = useState<Date>(startOfMonth(new Date()));
    const [configDialogOpen, setConfigDialogOpen] = useState(false);

    const {
        holidays,
        emergencyDays,
        isHoliday,
        isEmergencyDay,
        addHoliday,
        removeHoliday,
        addEmergency,
        removeEmergency,
    } = useSpecialDates();

    const { calculateEmergencyDeadline, calculateCutoffDate, getReceptionStatus } =
        useDateCalculations({ isHoliday, emergencyDays });

    const cutoffDate = calculateCutoffDate(referenceDate);

    const handleReferenceDateChange = (date: Date | undefined) => {
        if (date) {
            setReferenceDate(startOfDay(date));
        }
    };

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
        const status = getReceptionStatus(date, referenceDate, cutoffDate);
        setStatusInfo(status);
        setDialogOpen(true);
    };

    return (
        <div className="mx-auto w-full space-y-6">
            <CalendarGrid
                currentMonth={currentMonth}
                onMonthChange={setCurrentMonth}
                referenceDate={referenceDate}
                cutoffDate={cutoffDate}
                isHoliday={isHoliday}
                isEmergencyDay={isEmergencyDay}
                onDateSelect={handleDateSelect}
                onReferenceDateChange={handleReferenceDateChange}
                onOpenConfig={() => setConfigDialogOpen(true)}
            />

            <ResultDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                selectedDate={selectedDate}
                referenceDate={referenceDate}
                statusInfo={statusInfo}
            />

            <SpecialDatesDialog
                open={configDialogOpen}
                onOpenChange={setConfigDialogOpen}
                holidays={holidays}
                emergencyDays={emergencyDays}
                onAddHoliday={addHoliday}
                onRemoveHoliday={removeHoliday}
                onAddEmergency={addEmergency}
                onRemoveEmergency={removeEmergency}
                calculateEmergencyDeadline={calculateEmergencyDeadline}
            />
        </div>
    );
}
