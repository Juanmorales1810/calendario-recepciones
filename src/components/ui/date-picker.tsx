'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface DatePickerProps {
    value?: Date;
    onChange?: (date: Date | undefined) => void;
    placeholder?: string;
    className?: string;
}

export function DatePicker({
    value,
    onChange,
    placeholder = 'Selecciona una fecha',
    className,
}: DatePickerProps) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    data-empty={!value}
                    className={cn(
                        'data-[empty=true]:text-muted-foreground w-[280px] justify-start text-left font-normal',
                        className
                    )}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {value ? format(value, 'PPP', { locale: es }) : <span>{placeholder}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={value} onSelect={onChange} locale={es} />
            </PopoverContent>
        </Popover>
    );
}

export function DatePickerDemo() {
    const [date, setDate] = React.useState<Date>();

    return <DatePicker value={date} onChange={setDate} />;
}
