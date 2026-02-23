'use client';

import { Suspense } from 'react';
import ReservationCalendarView from '@/components/reservation-calendar-view';
import { RiLoader4Line } from '@remixicon/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ModeToggle } from '@/components/toggle-mode';

function PublicoContent() {
    return (
        <>
            <header className="bg-background border-b">
                <div className="container mx-auto h-16">
                    <div className="flex h-full items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" asChild>
                                <Link href="/reservas">
                                    <ArrowLeft className="h-5 w-5" />
                                </Link>
                            </Button>
                            <span className="text-lg font-semibold tracking-tight">
                                Sala de Reuniones - Vista pública
                            </span>
                        </div>
                        <ModeToggle />
                    </div>
                </div>
            </header>
            <div className="mx-auto max-w-7xl px-4 py-8">
                <div className="mb-4 text-center">
                    <h1 className="text-4xl font-bold tracking-tight">Reservas - Solo lectura</h1>
                    <p className="text-muted-foreground mt-1">
                        Calendario público de reservas de la sala de reuniones
                    </p>
                </div>
                <ReservationCalendarView readOnly initialView="agenda" />
            </div>
        </>
    );
}

export default function PublicoPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen items-center justify-center">
                    <RiLoader4Line className="text-muted-foreground h-8 w-8 animate-spin" />
                </div>
            }>
            <PublicoContent />
        </Suspense>
    );
}
