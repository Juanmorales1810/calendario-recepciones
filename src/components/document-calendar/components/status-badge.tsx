'use client';

import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, AlertCircle, Clock } from 'lucide-react';
import type { ReceptionStatus } from '../types';

interface StatusBadgeProps {
    status: ReceptionStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
    switch (status) {
        case 'on-time':
            return (
                <Badge className="gap-1.5 border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Sin multa
                </Badge>
            );
        case 'with-penalty':
            return (
                <Badge className="gap-1.5 border-red-500/30 bg-red-500/15 px-3 py-1 text-red-600 dark:text-red-400">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Con multa
                </Badge>
            );
        case 'emergency-extended':
            return (
                <Badge className="gap-1.5 border-purple-500/30 bg-purple-500/15 px-3 py-1 text-purple-600 dark:text-purple-400">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Emergencia
                </Badge>
            );
        case 'future':
            return (
                <Badge className="gap-1.5 border-blue-500/30 bg-blue-500/15 px-3 py-1 text-blue-600 dark:text-blue-400">
                    <Clock className="h-3.5 w-3.5" />
                    Fecha futura
                </Badge>
            );
    }
}
