'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Plus, Trash2, PartyPopper, AlertCircle, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Holiday, EmergencyDay } from '../types';

interface SpecialDatesDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    holidays: Holiday[];
    emergencyDays: EmergencyDay[];
    onAddHoliday: (date: string, name: string) => boolean;
    onRemoveHoliday: (index: number) => void;
    onAddEmergency: (date: string, description: string) => boolean;
    onRemoveEmergency: (index: number) => void;
    calculateEmergencyDeadline: (date: Date) => Date;
}

export function SpecialDatesDialog({
    open,
    onOpenChange,
    holidays,
    emergencyDays,
    onAddHoliday,
    onRemoveHoliday,
    onAddEmergency,
    onRemoveEmergency,
    calculateEmergencyDeadline,
}: SpecialDatesDialogProps) {
    const [newHolidayDate, setNewHolidayDate] = useState('');
    const [newHolidayName, setNewHolidayName] = useState('');
    const [newEmergencyDate, setNewEmergencyDate] = useState('');
    const [newEmergencyDescription, setNewEmergencyDescription] = useState('');

    const handleAddHoliday = () => {
        if (onAddHoliday(newHolidayDate, newHolidayName)) {
            setNewHolidayDate('');
            setNewHolidayName('');
        }
    };

    const handleAddEmergency = () => {
        if (onAddEmergency(newEmergencyDate, newEmergencyDescription)) {
            setNewEmergencyDate('');
            setNewEmergencyDescription('');
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Calendar className="text-primary h-5 w-5" />
                        Fechas Especiales
                    </DialogTitle>
                    <DialogDescription>
                        Configura feriados y días de emergencia que afectan el cálculo
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="holidays" className="w-full">
                    <TabsList className="mb-4 grid w-full grid-cols-2">
                        <TabsTrigger
                            value="holidays"
                            className="gap-2 data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-700 dark:data-[state=active]:text-amber-400">
                            <PartyPopper className="h-4 w-4" />
                            Feriados
                        </TabsTrigger>
                        <TabsTrigger
                            value="emergencies"
                            className="gap-2 data-[state=active]:bg-purple-500/10 data-[state=active]:text-purple-700 dark:data-[state=active]:text-purple-400">
                            <AlertCircle className="h-4 w-4" />
                            Emergencias
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="holidays" className="mt-0 space-y-4">
                        <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
                            <Input
                                type="date"
                                value={newHolidayDate}
                                onChange={(e) => setNewHolidayDate(e.target.value)}
                                className="bg-background/50"
                            />
                            <Input
                                type="text"
                                value={newHolidayName}
                                onChange={(e) => setNewHolidayName(e.target.value)}
                                placeholder="Nombre del feriado"
                                className="bg-background/50"
                            />
                            <Button
                                onClick={handleAddHoliday}
                                size="icon"
                                className="bg-amber-500 text-white hover:bg-amber-600">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="max-h-52 space-y-2 overflow-y-auto pr-1">
                            {holidays.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <PartyPopper className="text-muted-foreground/30 mb-2 h-10 w-10" />
                                    <p className="text-muted-foreground text-sm">
                                        No hay feriados configurados
                                    </p>
                                </div>
                            ) : (
                                holidays.map((holiday, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 transition-colors hover:bg-amber-500/10">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/20">
                                                <PartyPopper className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">
                                                    {holiday.name}
                                                </p>
                                                <p className="text-muted-foreground text-xs">
                                                    {format(holiday.date, 'dd/MM/yyyy', {
                                                        locale: es,
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onRemoveHoliday(index)}
                                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="emergencies" className="mt-0 space-y-4">
                        <p className="text-muted-foreground rounded-lg border border-purple-500/20 bg-purple-500/5 p-3 text-xs">
                            💡 Las emergencias extienden el plazo de recepción en 5 días hábiles
                            posteriores
                        </p>

                        <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
                            <Input
                                type="date"
                                value={newEmergencyDate}
                                onChange={(e) => setNewEmergencyDate(e.target.value)}
                                className="bg-background/50"
                            />
                            <Input
                                type="text"
                                value={newEmergencyDescription}
                                onChange={(e) => setNewEmergencyDescription(e.target.value)}
                                placeholder="Descripción"
                                className="bg-background/50"
                            />
                            <Button
                                onClick={handleAddEmergency}
                                size="icon"
                                className="bg-purple-500 text-white hover:bg-purple-600">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="max-h-52 space-y-2 overflow-y-auto pr-1">
                            {emergencyDays.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <AlertCircle className="text-muted-foreground/30 mb-2 h-10 w-10" />
                                    <p className="text-muted-foreground text-sm">
                                        No hay emergencias configuradas
                                    </p>
                                </div>
                            ) : (
                                emergencyDays.map((emergency, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between rounded-xl border border-purple-500/20 bg-purple-500/5 p-3 transition-colors hover:bg-purple-500/10">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/20">
                                                <AlertCircle className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">
                                                    {emergency.description}
                                                </p>
                                                <p className="text-muted-foreground text-xs">
                                                    {format(emergency.date, 'dd/MM/yyyy', {
                                                        locale: es,
                                                    })}{' '}
                                                    →{' '}
                                                    <span className="font-medium text-purple-600 dark:text-purple-400">
                                                        Plazo:{' '}
                                                        {format(
                                                            calculateEmergencyDeadline(
                                                                emergency.date
                                                            ),
                                                            'dd/MM/yyyy',
                                                            { locale: es }
                                                        )}
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => onRemoveEmergency(index)}
                                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
