'use client';

import {
    format,
    isWeekend,
    isBefore,
    isAfter,
    isSameDay,
    isSameMonth,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    getDay,
    addDays,
    startOfDay,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from '@/components/ui/card';
import { WEEKDAYS } from '../types';
import { ReferenceDatePicker } from './reference-date-picker';

interface CalendarGridProps {
    currentMonth: Date;
    onMonthChange: (date: Date) => void;
    referenceDate: Date;
    cutoffDate: Date;
    isHoliday: (date: Date) => boolean;
    isEmergencyDay: (date: Date) => boolean;
    onDateSelect: (date: Date) => void;
    onReferenceDateChange: (date: Date | undefined) => void;
    onOpenConfig: () => void;
}

export function CalendarGrid({
    currentMonth,
    onMonthChange,
    referenceDate,
    cutoffDate,
    isHoliday,
    isEmergencyDay,
    onDateSelect,
    onReferenceDateChange,
    onOpenConfig,
}: CalendarGridProps) {
    const generateCalendarDays = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(currentMonth);
        const startDate = addDays(monthStart, -getDay(monthStart));
        const endDate = addDays(monthEnd, 6 - getDay(monthEnd));
        return eachDayOfInterval({ start: startDate, end: endDate });
    };

    const getDayStyle = (date: Date) => {
        const d = startOfDay(date);
        const isCurrentMonth = isSameMonth(date, currentMonth);

        if (!isCurrentMonth) {
            return 'text-muted-foreground/30 hover:bg-transparent cursor-default';
        }

        if (isSameDay(d, referenceDate)) {
            return 'bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold hover:from-blue-600 hover:to-blue-700 shadow-md shadow-blue-500/20 ring-2 ring-blue-400/30';
        }

        if (isEmergencyDay(d)) {
            return 'bg-gradient-to-br from-purple-100 to-purple-200 text-purple-800 hover:from-purple-200 hover:to-purple-300 dark:from-purple-900/50 dark:to-purple-800/50 dark:text-purple-200';
        }

        if (isHoliday(d)) {
            return 'bg-gradient-to-br from-amber-100 to-amber-200 text-amber-800 hover:from-amber-200 hover:to-amber-300 dark:from-amber-900/50 dark:to-amber-800/50 dark:text-amber-200';
        }

        if (isWeekend(d)) {
            return 'text-muted-foreground/50 hover:bg-muted/50';
        }

        if (isAfter(d, referenceDate)) {
            return 'text-muted-foreground/60 hover:bg-muted/50';
        }

        if (!isBefore(d, cutoffDate) && !isAfter(d, referenceDate)) {
            return 'bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-800 hover:from-emerald-200 hover:to-emerald-300 dark:from-emerald-900/50 dark:to-emerald-800/50 dark:text-emerald-200';
        }

        if (isBefore(d, cutoffDate)) {
            return 'bg-gradient-to-br from-red-100 to-red-200 text-red-800 hover:from-red-200 hover:to-red-300 dark:from-red-900/50 dark:to-red-800/50 dark:text-red-200';
        }

        return 'hover:bg-muted/50';
    };

    const legendItems = [
        { color: 'bg-gradient-to-br from-blue-500 to-blue-600', label: 'Fecha de referencia' },
        {
            color: 'bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/50 dark:to-emerald-800/50',
            label: 'Sin multa',
        },
        {
            color: 'bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/50 dark:to-red-800/50',
            label: 'Con multa',
        },
        {
            color: 'bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/50 dark:to-amber-800/50',
            label: 'Feriado',
        },
        {
            color: 'bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/50 dark:to-purple-800/50',
            label: 'Emergencia',
        },
    ];

    const calendarDays = generateCalendarDays();

    return (
        <Card className="border-border/50 overflow-hidden py-0 shadow-lg">
            <CardHeader className="from-muted/30 bg-gradient-to-b to-transparent py-6 text-center">
                <CardDescription className="flex items-center justify-center gap-2">
                    <ReferenceDatePicker
                        value={referenceDate}
                        onChange={onReferenceDateChange}
                        onOpenConfig={onOpenConfig}>
                        <div className="flex items-center justify-center gap-2.5">
                            <span className="bg-primary/10 text-primary inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium">
                                Fecha de corte
                            </span>
                            <span className="text-foreground font-semibold">
                                {format(cutoffDate, 'dd/MM/yyyy', { locale: es })}
                            </span>
                        </div>
                    </ReferenceDatePicker>
                </CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-2 sm:px-6 2xl:pb-6">
                {/* Month navigation */}
                <div className="mb-2 flex items-center justify-between 2xl:mb-6">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onMonthChange(subMonths(currentMonth, 1))}
                        className="hover:bg-muted/80 h-10 w-10 transition-colors">
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <h2 className="text-xl font-bold tracking-tight capitalize">
                        {format(currentMonth, 'MMMM yyyy', { locale: es })}
                    </h2>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onMonthChange(addMonths(currentMonth, 1))}
                        className="hover:bg-muted/80 h-10 w-10 transition-colors">
                        <ChevronRight className="h-5 w-5" />
                    </Button>
                </div>

                {/* Weekday headers */}
                <div className="mb-3 grid grid-cols-7 gap-1">
                    {WEEKDAYS.map((day, index) => (
                        <div
                            key={day}
                            className={`flex h-6 items-center justify-center text-xs font-semibold tracking-wider uppercase 2xl:h-10 ${
                                index === 0 || index === 6
                                    ? 'text-muted-foreground/50'
                                    : 'text-muted-foreground'
                            }`}>
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-1.5">
                    {calendarDays.map((day, index) => {
                        const isCurrentMonth = isSameMonth(day, currentMonth);
                        return (
                            <button
                                key={index}
                                onClick={() => isCurrentMonth && onDateSelect(day)}
                                disabled={!isCurrentMonth}
                                className={`flex h-12 w-full items-center justify-center rounded-xl text-sm transition-all duration-200 ease-out sm:text-base 2xl:h-17 ${getDayStyle(day)} ${isCurrentMonth ? 'cursor-pointer active:scale-95' : ''} `}>
                                {format(day, 'd')}
                            </button>
                        );
                    })}
                </div>
            </CardContent>
            <CardFooter className="from-muted/30 bg-gradient-to-t to-transparent py-2 text-center 2xl:py-4">
                <div className="flex w-full flex-wrap justify-center gap-x-6 gap-y-3">
                    {legendItems.map((item) => (
                        <div key={item.label} className="flex items-center gap-2.5">
                            <div className={`h-4 w-4 rounded-md ${item.color} shadow-sm`} />
                            <span className="text-muted-foreground text-sm">{item.label}</span>
                        </div>
                    ))}
                </div>
            </CardFooter>
        </Card>
    );
}
