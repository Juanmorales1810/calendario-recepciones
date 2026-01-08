'use client';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon, CalendarDays, Clock, FileCheck } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { StatusInfo } from '../types';
import { StatusBadge } from './status-badge';

interface ResultDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedDate: Date | undefined;
    referenceDate: Date;
    statusInfo: StatusInfo | null;
}

export function ResultDialog({
    open,
    onOpenChange,
    selectedDate,
    referenceDate,
    statusInfo,
}: ResultDialogProps) {
    if (!selectedDate || !statusInfo) return null;

    const getStatusStyles = () => {
        switch (statusInfo.status) {
            case 'on-time':
            case 'emergency-extended':
                return {
                    border: 'border-emerald-500/30',
                    bg: 'bg-emerald-500/10',
                    text: 'text-emerald-600 dark:text-emerald-400',
                    icon: 'text-emerald-500',
                };
            case 'with-penalty':
                return {
                    border: 'border-red-500/30',
                    bg: 'bg-red-500/10',
                    text: 'text-red-600 dark:text-red-400',
                    icon: 'text-red-500',
                };
            case 'future':
                return {
                    border: 'border-blue-500/30',
                    bg: 'bg-blue-500/10',
                    text: 'text-blue-600 dark:text-blue-400',
                    icon: 'text-blue-500',
                };
        }
    };

    const styles = getStatusStyles();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileCheck className="h-5 w-5 text-primary" />
                        Verificación de Recepción
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-5">
                    {/* Document date card */}
                    <div className="flex items-center justify-between rounded-xl bg-muted/50 p-4 border border-border/50">
                        <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                Fecha del documento
                            </p>
                            <p className="text-lg font-semibold capitalize">
                                {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: es })}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {format(selectedDate, 'yyyy', { locale: es })}
                            </p>
                        </div>
                        <StatusBadge status={statusInfo.status} />
                    </div>

                    {/* Details grid */}
                    <div className="grid gap-3">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-background border border-border/50">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <CalendarIcon className="h-4 w-4" />
                                <span className="text-sm">Fecha de referencia</span>
                            </div>
                            <span className="text-sm font-semibold">
                                {format(referenceDate, 'dd/MM/yyyy', { locale: es })}
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-background border border-border/50">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <CalendarDays className="h-4 w-4" />
                                <span className="text-sm">Fecha de corte</span>
                            </div>
                            <span className="text-sm font-semibold">
                                {format(statusInfo.cutoffDate, 'dd/MM/yyyy', { locale: es })}
                            </span>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-background border border-border/50">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span className="text-sm">Días hábiles transcurridos</span>
                            </div>
                            <span className="text-sm font-semibold">
                                {statusInfo.businessDaysBack}
                            </span>
                        </div>
                    </div>

                    {/* Result message */}
                    <div className={`rounded-xl p-4 ${styles.border} ${styles.bg} border`}>
                        <p className={`text-sm font-semibold text-center ${styles.text}`}>
                            {statusInfo.message}
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
