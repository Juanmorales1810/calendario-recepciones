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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    RiCalendarLine,
    RiAddLine,
    RiEditLine,
    RiDeleteBinLine,
    RiLoader4Line,
    RiMoreLine,
    RiShareLine,
    RiExternalLinkLine,
} from '@remixicon/react';
import { useCalendars, type CalendarItem, type OwnCalendar } from '@/hooks/use-calendars';
import { toast } from 'sonner';
import Link from 'next/link';
import { ShareCalendarDialog } from '@/components/share-calendar-dialog';

const CALENDAR_COLORS = [
    { value: 'sky', label: 'Azul', class: 'bg-sky-500' },
    { value: 'amber', label: 'Ámbar', class: 'bg-amber-500' },
    { value: 'violet', label: 'Violeta', class: 'bg-violet-500' },
    { value: 'rose', label: 'Rosa', class: 'bg-rose-500' },
    { value: 'emerald', label: 'Verde', class: 'bg-emerald-500' },
    { value: 'orange', label: 'Naranja', class: 'bg-orange-500' },
    { value: 'indigo', label: 'Índigo', class: 'bg-indigo-500' },
    { value: 'pink', label: 'Rosado', class: 'bg-pink-500' },
    { value: 'teal', label: 'Turquesa', class: 'bg-teal-500' },
];

interface CalendarSelectorDialogProps {
    selectedCalendars: string[];
    onSelectionChange: (ids: string[]) => void;
    selectedCalendarName?: string;
    selectedCalendarColor?: string;
}

export function CalendarSelectorDialog({
    selectedCalendars,
    onSelectionChange,
    selectedCalendarName,
    selectedCalendarColor,
}: CalendarSelectorDialogProps) {
    const { ownCalendars, sharedCalendars, isLoading, createCalendar, deleteCalendar } =
        useCalendars();
    const [isOpen, setIsOpen] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newCalendarName, setNewCalendarName] = useState('');
    const [newCalendarColor, setNewCalendarColor] = useState('sky');
    const [isCreating, setIsCreating] = useState(false);

    // Estado para el dialog de compartir
    const [shareDialogOpen, setShareDialogOpen] = useState(false);
    const [calendarToShare, setCalendarToShare] = useState<{ id: string; name: string } | null>(
        null
    );
    const [sharedCalendarIds, setSharedCalendarIds] = useState<Set<string>>(new Set());

    // Obtener qué calendarios han sido compartidos
    useEffect(() => {
        if (isOpen && !isLoading) {
            fetch('/api/shared?type=owned')
                .then((res) => res.json())
                .then((data) => {
                    const sharedIds = new Set<string>(
                        data.owned
                            ?.map((s: any) => s.calendarId?.toString() || '')
                            .filter(Boolean) || []
                    );
                    setSharedCalendarIds(sharedIds);
                })
                .catch((err) => console.error('Error fetching shared status:', err));
        }
    }, [isOpen, isLoading]);

    const handleSelectCalendar = (calendarId: string) => {
        onSelectionChange([calendarId]);
        setIsOpen(false);
    };

    const handleCreateCalendar = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCalendarName.trim()) return;

        try {
            setIsCreating(true);
            const newCal = await createCalendar({
                name: newCalendarName.trim(),
                color: newCalendarColor,
            });
            toast.success('Calendario creado');
            setNewCalendarName('');
            setNewCalendarColor('sky');
            setIsCreateOpen(false);
            onSelectionChange([newCal.id]);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Error al crear calendario');
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteCalendar = async (calendar: OwnCalendar) => {
        if (calendar.isDefault) {
            toast.error('No puedes eliminar el calendario principal');
            return;
        }

        if (!confirm(`¿Eliminar "${calendar.name}"? Se eliminarán todos sus eventos.`)) {
            return;
        }

        try {
            await deleteCalendar(calendar.id);
            // Si el calendario eliminado estaba seleccionado, seleccionar el default
            if (selectedCalendars.includes(calendar.id)) {
                const defaultCal = ownCalendars.find((c) => c.isDefault);
                if (defaultCal) {
                    onSelectionChange([defaultCal.id]);
                }
            }
            toast.success('Calendario eliminado');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Error al eliminar');
        }
    };

    const handleShareCalendar = (calendar: OwnCalendar) => {
        setCalendarToShare({ id: calendar.id, name: calendar.name });
        setShareDialogOpen(true);
    };

    const handleShareDialogClose = (open: boolean) => {
        setShareDialogOpen(open);
        if (!open) {
            // Resetear el calendario al cerrar el dialog
            setTimeout(() => setCalendarToShare(null), 150);
        }
    };

    const getColorClass = (color: string) => {
        return CALENDAR_COLORS.find((c) => c.value === color)?.class || 'bg-slate-500';
    };

    return (
        <>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2">
                        <div
                            className={`h-3 w-3 rounded-full ${getColorClass(selectedCalendarColor || 'sky')}`}
                        />
                        <span className="max-sm:sr-only">
                            {selectedCalendarName || 'Calendario'}
                        </span>
                        <RiCalendarLine className="h-4 w-4 opacity-60" />
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Seleccionar Calendario</DialogTitle>
                        <DialogDescription>
                            Elige un calendario para ver y crear eventos.
                        </DialogDescription>
                    </DialogHeader>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <RiLoader4Line className="h-6 w-6 animate-spin" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Mis Calendarios */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-medium">Mis Calendarios</h4>
                                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                                <RiAddLine className="mr-1 h-4 w-4" />
                                                Nuevo
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Nuevo Calendario</DialogTitle>
                                                <DialogDescription>
                                                    Crea un nuevo calendario para organizar tus
                                                    eventos.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <form
                                                onSubmit={handleCreateCalendar}
                                                className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="name">Nombre</Label>
                                                    <Input
                                                        id="name"
                                                        value={newCalendarName}
                                                        onChange={(e) =>
                                                            setNewCalendarName(e.target.value)
                                                        }
                                                        placeholder="Mi nuevo calendario"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Color</Label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {CALENDAR_COLORS.map((color) => (
                                                            <button
                                                                key={color.value}
                                                                type="button"
                                                                onClick={() =>
                                                                    setNewCalendarColor(color.value)
                                                                }
                                                                className={`h-8 w-8 rounded-full ${color.class} ${
                                                                    newCalendarColor === color.value
                                                                        ? 'ring-2 ring-offset-2'
                                                                        : ''
                                                                }`}
                                                                title={color.label}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                                <Button
                                                    type="submit"
                                                    className="w-full"
                                                    disabled={isCreating}>
                                                    {isCreating ? (
                                                        <>
                                                            <RiLoader4Line className="mr-2 h-4 w-4 animate-spin" />
                                                            Creando...
                                                        </>
                                                    ) : (
                                                        'Crear Calendario'
                                                    )}
                                                </Button>
                                            </form>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                                <div className="space-y-1">
                                    {ownCalendars.map((calendar) => (
                                        <div
                                            key={calendar.id}
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => handleSelectCalendar(calendar.id)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault();
                                                    handleSelectCalendar(calendar.id);
                                                }
                                            }}
                                            className={`hover:bg-accent flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left transition-colors ${
                                                selectedCalendars.includes(calendar.id)
                                                    ? 'bg-accent'
                                                    : ''
                                            }`}>
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                                                        selectedCalendars.includes(calendar.id)
                                                            ? 'border-primary bg-primary'
                                                            : 'border-muted-foreground'
                                                    }`}>
                                                    {selectedCalendars.includes(calendar.id) && (
                                                        <div className="h-2 w-2 rounded-full bg-white" />
                                                    )}
                                                </div>
                                                <div
                                                    className={`h-4 w-4 rounded-full ${getColorClass(calendar.color)}`}
                                                />
                                                <span>{calendar.name}</span>
                                                {calendar.isDefault && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        Principal
                                                    </Badge>
                                                )}
                                                {sharedCalendarIds.has(calendar.id) && (
                                                    <Badge variant="outline" className="text-xs">
                                                        <RiShareLine className="mr-1 h-3 w-3" />
                                                        Compartido
                                                    </Badge>
                                                )}
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 w-7 p-0"
                                                        onClick={(e) => e.stopPropagation()}>
                                                        <RiMoreLine className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleShareCalendar(calendar);
                                                        }}>
                                                        <RiShareLine className="mr-2 h-4 w-4" />
                                                        Compartir
                                                    </DropdownMenuItem>
                                                    {!calendar.isDefault && (
                                                        <>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeleteCalendar(calendar);
                                                                }}
                                                                className="text-red-600">
                                                                <RiDeleteBinLine className="mr-2 h-4 w-4" />
                                                                Eliminar
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Calendarios compartidos */}
                            {sharedCalendars.length > 0 && (
                                <div className="space-y-2 border-t pt-4">
                                    <h4 className="text-muted-foreground flex items-center gap-1 text-sm font-medium">
                                        <RiShareLine className="h-4 w-4" />
                                        Compartidos conmigo
                                    </h4>
                                    <div className="space-y-1">
                                        {sharedCalendars.map((calendar) => (
                                            <div
                                                key={calendar.id}
                                                role="button"
                                                tabIndex={0}
                                                onClick={() =>
                                                    handleSelectCalendar(calendar.shareToken)
                                                }
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' || e.key === ' ') {
                                                        e.preventDefault();
                                                        handleSelectCalendar(calendar.shareToken);
                                                    }
                                                }}
                                                className={`hover:bg-accent flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left transition-colors ${
                                                    selectedCalendars.includes(calendar.shareToken)
                                                        ? 'bg-accent'
                                                        : ''
                                                }`}>
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                                                            selectedCalendars.includes(
                                                                calendar.shareToken
                                                            )
                                                                ? 'border-primary bg-primary'
                                                                : 'border-muted-foreground'
                                                        }`}>
                                                        {selectedCalendars.includes(
                                                            calendar.shareToken
                                                        ) && (
                                                            <div className="h-2 w-2 rounded-full bg-white" />
                                                        )}
                                                    </div>
                                                    <div className="h-4 w-4 rounded-full bg-slate-500" />
                                                    <div>
                                                        <span>{calendar.name}</span>
                                                        <p className="text-muted-foreground text-xs">
                                                            {calendar.owner.name}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge
                                                        variant={
                                                            calendar.permission === 'write'
                                                                ? 'default'
                                                                : 'secondary'
                                                        }
                                                        className="text-xs">
                                                        {calendar.permission === 'write' ? (
                                                            <RiEditLine className="mr-1 h-3 w-3" />
                                                        ) : null}
                                                        {calendar.permission === 'write'
                                                            ? 'Editar'
                                                            : 'Ver'}
                                                    </Badge>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 w-7 p-0"
                                                        onClick={(e) => e.stopPropagation()}
                                                        asChild>
                                                        <Link
                                                            href={`/shared/${calendar.shareToken}`}>
                                                            <RiExternalLinkLine className="h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Dialog de compartir calendario */}
            {calendarToShare && (
                <ShareCalendarDialog
                    open={shareDialogOpen}
                    onOpenChange={handleShareDialogClose}
                    calendarId={calendarToShare.id}
                    calendarName={calendarToShare.name}
                />
            )}
        </>
    );
}
