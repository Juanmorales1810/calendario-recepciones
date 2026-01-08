export type ReceptionStatus = 'on-time' | 'with-penalty' | 'future' | 'emergency-extended';

export interface StatusInfo {
    status: ReceptionStatus;
    message: string;
    businessDaysBack: number;
    cutoffDate: Date;
    emergencyExtension?: {
        emergencyDate: Date;
        extendedDeadline: Date;
    };
}

export interface Holiday {
    date: Date;
    name: string;
}

export interface EmergencyDay {
    date: Date;
    description: string;
}

export const STORAGE_KEYS = {
    holidays: 'document-calendar-holidays',
    emergencies: 'document-calendar-emergencies',
} as const;

export const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'] as const;
