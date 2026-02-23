'use client';

import { Suspense } from 'react';
import { Navbar } from '@/components/interfaces/navbar';
import ReservationCalendarView from '@/components/reservation-calendar-view';
import { RiLoader4Line } from '@remixicon/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';

function ReservasContent() {
    return (
        <>
            <Navbar />
            <div className="mx-auto max-w-7xl px-4 py-8">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight">Sala de Reuniones</h1>
                        <p className="text-muted-foreground mt-1">
                            Reservá un turno para la sala de reuniones
                        </p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/reservas/publico">
                            <Eye className="mr-2 h-4 w-4" />
                            Ver calendario público
                        </Link>
                    </Button>
                </div>
                <ReservationCalendarView />
            </div>
        </>
    );
}

export default function ReservasPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen items-center justify-center">
                    <RiLoader4Line className="text-muted-foreground h-8 w-8 animate-spin" />
                </div>
            }>
            <ReservasContent />
        </Suspense>
    );
}
