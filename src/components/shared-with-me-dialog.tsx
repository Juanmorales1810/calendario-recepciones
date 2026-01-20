'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    RiCalendarLine,
    RiLoader4Line,
    RiLockLine,
    RiEditLine,
    RiExternalLinkLine,
} from '@remixicon/react';
import Link from 'next/link';

interface SharedWithMeItem {
    _id: string;
    shareToken: string;
    permission: 'read' | 'write';
    status: string;
    calendarName: string;
    ownerId: {
        name: string;
        email: string;
    } | null;
}

interface SharedWithMeDialogProps {
    trigger?: React.ReactNode;
}

export function SharedWithMeDialog({ trigger }: SharedWithMeDialogProps) {
    const [open, setOpen] = useState(false);
    const [sharedCalendars, setSharedCalendars] = useState<SharedWithMeItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchSharedCalendars = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/shared?type=shared');
            if (response.ok) {
                const data = await response.json();
                setSharedCalendars(data.sharedWithMe || []);
            }
        } catch (error) {
            console.error('Error al obtener calendarios compartidos:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            fetchSharedCalendars();
        }
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm">
                        <RiCalendarLine className="mr-2 h-4 w-4" />
                        Calendarios compartidos
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Calendarios compartidos conmigo</DialogTitle>
                    <DialogDescription>
                        Accede a los calendarios que otros usuarios han compartido contigo.
                    </DialogDescription>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <RiLoader4Line className="text-muted-foreground h-8 w-8 animate-spin" />
                    </div>
                ) : sharedCalendars.length === 0 ? (
                    <div className="py-8 text-center">
                        <RiCalendarLine className="text-muted-foreground mx-auto h-12 w-12" />
                        <p className="text-muted-foreground mt-4">
                            Nadie ha compartido un calendario contigo aún.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {sharedCalendars.map((calendar) => (
                            <div
                                key={calendar._id}
                                className="flex items-center justify-between rounded-lg border p-4">
                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-medium">{calendar.calendarName}</p>
                                    <p className="text-muted-foreground mt-1 text-sm">
                                        {calendar.ownerId?.name || 'Usuario'} (
                                        {calendar.ownerId?.email || 'Sin email'})
                                    </p>
                                    <div className="mt-2 flex items-center gap-2">
                                        <Badge
                                            variant={
                                                calendar.permission === 'write'
                                                    ? 'default'
                                                    : 'secondary'
                                            }>
                                            {calendar.permission === 'write' ? (
                                                <>
                                                    <RiEditLine className="mr-1 h-3 w-3" />
                                                    Escritura
                                                </>
                                            ) : (
                                                <>
                                                    <RiLockLine className="mr-1 h-3 w-3" />
                                                    Lectura
                                                </>
                                            )}
                                        </Badge>
                                        {calendar.status === 'pending' && (
                                            <Badge variant="outline">Nuevo</Badge>
                                        )}
                                    </div>
                                </div>
                                <Button asChild size="sm" onClick={() => setOpen(false)}>
                                    <Link href={`/shared/${calendar.shareToken}`}>
                                        <RiExternalLinkLine className="mr-2 h-4 w-4" />
                                        Abrir
                                    </Link>
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
