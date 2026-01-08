'use client';

import type React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CalendarIcon, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReferenceDatePickerProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onOpenConfig: () => void;
}

export function ReferenceDatePicker({ value, onChange, onOpenConfig }: ReferenceDatePickerProps) {
    return (
        <div className="bg-card border-border/50 flex flex-col items-center justify-center gap-4 rounded-xl border p-6 shadow-sm sm:flex-row">
            <div className="flex flex-col items-center gap-3">
                <Label
                    htmlFor="reference-date"
                    className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
                    <CalendarIcon className="h-4 w-4" />
                    Fecha de referencia
                </Label>
                <div className="relative">
                    <Input
                        id="reference-date"
                        type="date"
                        value={value}
                        onChange={onChange}
                        className="bg-background/50 border-border/50 focus:border-primary/50 w-52 text-center font-medium transition-colors"
                    />
                </div>
            </div>

            <div className="bg-border/50 hidden h-12 w-px sm:block" />

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
