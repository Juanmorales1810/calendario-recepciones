'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Navbar } from '@/components/interfaces/navbar';
import { RiLoader4Line } from '@remixicon/react';

const DocumentCalendar = dynamic(
    () => import('@/components/document-calendar').then((m) => m.DocumentCalendar),
    {
        loading: () => (
            <div className="flex items-center justify-center py-20">
                <RiLoader4Line className="text-muted-foreground h-8 w-8 animate-spin" />
            </div>
        ),
    }
);

function RecepcionesContent() {
    return (
        <>
            <Navbar />

            <div className="mx-auto max-w-7xl px-4 py-8">
                <div className="mb-4 text-center">
                    <h1 className="text-4xl font-bold tracking-tight">Calendario de Recepciones</h1>
                </div>

                <DocumentCalendar />
            </div>
        </>
    );
}

export default function RecepcionesPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen items-center justify-center">
                    <RiLoader4Line className="text-muted-foreground h-8 w-8 animate-spin" />
                </div>
            }>
            <RecepcionesContent />
        </Suspense>
    );
}
