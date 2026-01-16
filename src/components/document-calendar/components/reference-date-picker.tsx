'use client';

import { Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';

interface ReferenceDatePickerProps {
    value: Date | undefined;
    onChange: (date: Date | undefined) => void;
    onOpenConfig: () => void;
    children?: React.ReactNode;
}

export function ReferenceDatePicker({
    value,
    onChange,
    onOpenConfig,
    children,
}: ReferenceDatePickerProps) {
    return (
        <div className="flex w-full flex-col items-center justify-between gap-4 rounded-xl sm:flex-row">
            <div className="flex flex-col items-center gap-3">
                <DatePicker
                    value={value}
                    onChange={onChange}
                    placeholder="Selecciona fecha de referencia"
                    className="bg-background/50 border-border/50 focus:border-primary/50 w-52 text-center font-medium transition-colors"
                />
            </div>

            {children}

            <Button
                variant="outline"
                onClick={onOpenConfig}
                className="bg-background/50 hover:bg-accent/50 border-border/50 gap-2 transition-all hover:scale-[1.02]">
                <Settings2 className="h-4 w-4" />
                <span>Fechas Especiales</span>
            </Button>
        </div>
    );
}
