'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info } from 'lucide-react';

export function CalendarLegend() {
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

    return (
        <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-3">
                <CardTitle className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
                    <Info className="h-4 w-4" />
                    Referencias
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-wrap justify-center gap-x-6 gap-y-3">
                    {legendItems.map((item) => (
                        <div key={item.label} className="flex items-center gap-2.5">
                            <div className={`h-4 w-4 rounded-md ${item.color} shadow-sm`} />
                            <span className="text-muted-foreground text-sm">{item.label}</span>
                        </div>
                    ))}
                </div>
                <div className="border-border/50 border-t pt-2">
                    <p className="text-muted-foreground text-center text-xs leading-relaxed">
                        Los fines de semana y feriados no se cuentan como días hábiles.
                        <br />
                        Las emergencias extienden el plazo 5 días hábiles adicionales.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
