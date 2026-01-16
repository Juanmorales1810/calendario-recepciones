'use client';

import { Skeleton } from '@/components/ui/skeleton';

export function CalendarEventSkeleton() {
    return (
        <div className="space-y-4">
            {/* Header con controles */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-9 w-9" />
                    <Skeleton className="h-9 w-9" />
                    <Skeleton className="h-9 w-24" />
                </div>
                <Skeleton className="h-8 w-40" />
                <div className="flex items-center gap-2">
                    <Skeleton className="h-9 w-24" />
                    <Skeleton className="h-9 w-9" />
                </div>
            </div>

            {/* Calendario Grid */}
            <div className="rounded-lg border">
                {/* Días de la semana header */}
                <div className="grid grid-cols-7 border-b">
                    {Array.from({ length: 7 }).map((_, i) => (
                        <div key={i} className="border-r p-2 last:border-r-0">
                            <Skeleton className="mx-auto h-4 w-8" />
                        </div>
                    ))}
                </div>

                {/* Filas del calendario */}
                {Array.from({ length: 5 }).map((_, weekIndex) => (
                    <div key={weekIndex} className="grid grid-cols-7 border-b last:border-b-0">
                        {Array.from({ length: 7 }).map((_, dayIndex) => (
                            <div key={dayIndex} className="min-h-24 border-r p-1 last:border-r-0">
                                <Skeleton className="mb-1 h-6 w-6" />
                                {/* Eventos skeleton aleatorios */}
                                {(weekIndex + dayIndex) % 3 === 0 && (
                                    <Skeleton className="mb-1 h-5 w-full rounded" />
                                )}
                                {(weekIndex + dayIndex) % 4 === 0 && (
                                    <Skeleton className="mb-1 h-5 w-3/4 rounded" />
                                )}
                                {(weekIndex + dayIndex) % 5 === 0 && (
                                    <Skeleton className="h-5 w-5/6 rounded" />
                                )}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
