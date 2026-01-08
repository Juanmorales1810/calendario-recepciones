'use client';

import { FileText } from 'lucide-react';

export function CalendarHeader() {
    return (
        <div className="from-primary/10 via-primary/5 relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-br to-transparent p-8">
            <div className="bg-grid-pattern absolute inset-0 opacity-5" />
            <div className="relative flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="bg-primary/20 absolute inset-0 animate-pulse rounded-2xl blur-xl" />
                    <div className="from-primary to-primary/80 shadow-primary/25 relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg">
                        <FileText className="text-primary-foreground h-8 w-8" />
                    </div>
                </div>
                <div className="space-y-2 text-center">
                    <h1 className="from-foreground to-foreground/70 bg-gradient-to-r bg-clip-text text-3xl font-bold tracking-tight">
                        Control de Recepción
                    </h1>
                    <p className="text-muted-foreground max-w-md">
                        Verifica si un documento va con multa según su fecha de emisión
                    </p>
                </div>
            </div>
        </div>
    );
}
