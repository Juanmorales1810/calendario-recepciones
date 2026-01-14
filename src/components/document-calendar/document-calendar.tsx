'use client';

import type React from 'react';
import { useState } from 'react';
import { format, startOfDay, startOfMonth, parse, isValid } from 'date-fns';
import { useSpecialDates, useDateCalculations } from './hooks';
import {
    ReferenceDatePicker,
    CalendarGrid,
    CalendarLegend,
    ResultDialog,
    SpecialDatesDialog,
} from './components';
import type { StatusInfo } from './types';

export function DocumentCalendar() {
    const [referenceDate, setReferenceDate] = useState<Date>(startOfDay(new Date()));
    const [referenceDateInput, setReferenceDateInput] = useState<string>(
        format(new Date(), 'yyyy-MM-dd')
    );
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

    const handleReferenceDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setReferenceDateInput(value);

        const parsedDate = parse(value, 'yyyy-MM-dd', new Date());
        if (isValid(parsedDate)) {
            setReferenceDate(startOfDay(parsedDate));
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
            <ReferenceDatePicker
                value={referenceDateInput}
                onChange={handleReferenceDateChange}
                onOpenConfig={() => setConfigDialogOpen(true)}
            />

            <CalendarGrid
                currentMonth={currentMonth}
                onMonthChange={setCurrentMonth}
                referenceDate={referenceDate}
                cutoffDate={cutoffDate}
                isHoliday={isHoliday}
                isEmergencyDay={isEmergencyDay}
                onDateSelect={handleDateSelect}
            />

            <CalendarLegend />

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
