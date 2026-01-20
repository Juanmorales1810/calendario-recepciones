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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import {
    RiShareLine,
    RiDeleteBinLine,
    RiFileCopyLine,
    RiCheckLine,
    RiLoader4Line,
    RiLockLine,
    RiEditLine,
} from '@remixicon/react';
import { toast } from 'sonner';

interface SharedCalendarItem {
    _id: string;
    sharedWithEmail: string;
    permission: 'read' | 'write';
    status: string;
    calendarName: string;
    shareToken: string;
    sharedWithId?: {
        name: string;
        email: string;
    };
}

interface ShareCalendarDialogProps {
    calendarId: string;
    calendarName: string;
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export function ShareCalendarDialog({
    calendarId,
    calendarName,
    trigger,
    open: controlledOpen,
    onOpenChange,
}: ShareCalendarDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const setOpen = onOpenChange || setInternalOpen;

    const [email, setEmail] = useState('');
    const [permission, setPermission] = useState<'read' | 'write'>('read');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [sharedWith, setSharedWith] = useState<SharedCalendarItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [copiedToken, setCopiedToken] = useState<string | null>(null);

    const fetchSharedWith = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/shared?type=owned&calendarId=${calendarId}`);
            if (response.ok) {
                const data = await response.json();
                setSharedWith(data.owned || []);
            }
        } catch (error) {
            console.error('Error al obtener compartidos:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (open && calendarId) {
            fetchSharedWith();
        }
    }, [open, calendarId]);

    const handleShare = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim()) {
            toast.error('Email es requerido');
            return;
        }

        try {
            setIsSubmitting(true);
            const response = await fetch('/api/shared', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    permission,
                    calendarId,
                    calendarName,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al compartir');
            }

            toast.success(`Calendario compartido con ${email}`);
            setEmail('');
            fetchSharedWith();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Error al compartir');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (token: string) => {
        try {
            const response = await fetch(`/api/shared/${token}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Error al eliminar');
            }

            toast.success('Acceso eliminado');
            fetchSharedWith();
        } catch (error) {
            toast.error('Error al eliminar el acceso compartido');
        }
    };

    const copyShareLink = async (token: string) => {
        const link = `${window.location.origin}/shared/${token}`;
        await navigator.clipboard.writeText(link);
        setCopiedToken(token);
        toast.success('Enlace copiado al portapapeles');
        setTimeout(() => setCopiedToken(null), 2000);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Compartir "{calendarName}"</DialogTitle>
                    <DialogDescription>
                        Comparte este calendario con otros usuarios. Pueden ver o editar los eventos
                        según los permisos que otorgues.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleShare} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email del usuario</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="usuario@ejemplo.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Permisos</Label>
                        <RadioGroup
                            value={permission}
                            onValueChange={(v) => setPermission(v as 'read' | 'write')}>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="read" id="read" />
                                <Label
                                    htmlFor="read"
                                    className="flex cursor-pointer items-center gap-2 font-normal">
                                    <RiLockLine className="h-4 w-4" />
                                    Solo lectura - Puede ver los eventos
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="write" id="write" />
                                <Label
                                    htmlFor="write"
                                    className="flex cursor-pointer items-center gap-2 font-normal">
                                    <RiEditLine className="h-4 w-4" />
                                    Escritura - Puede crear, editar y eliminar eventos
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <RiLoader4Line className="mr-2 h-4 w-4 animate-spin" />
                                Compartiendo...
                            </>
                        ) : (
                            <>
                                <RiShareLine className="mr-2 h-4 w-4" />
                                Compartir
                            </>
                        )}
                    </Button>
                </form>

                {/* Lista de usuarios con acceso */}
                <div className="mt-6 border-t pt-4">
                    <h3 className="mb-3 font-medium">Usuarios con acceso</h3>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-4">
                            <RiLoader4Line className="text-muted-foreground h-6 w-6 animate-spin" />
                        </div>
                    ) : sharedWith.length === 0 ? (
                        <p className="text-muted-foreground py-4 text-center text-sm">
                            Este calendario no está compartido con nadie aún.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {sharedWith.map((share) => (
                                <div
                                    key={share._id}
                                    className="flex items-center justify-between rounded-lg border p-3">
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-medium">
                                            {share.sharedWithId?.name || share.sharedWithEmail}
                                        </p>
                                        <p className="text-muted-foreground truncate text-xs">
                                            {share.sharedWithEmail}
                                        </p>
                                        <div className="mt-1 flex items-center gap-2">
                                            <Badge
                                                variant={
                                                    share.permission === 'write'
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                                className="text-xs">
                                                {share.permission === 'write'
                                                    ? 'Escritura'
                                                    : 'Lectura'}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => copyShareLink(share.shareToken)}
                                            title="Copiar enlace">
                                            {copiedToken === share.shareToken ? (
                                                <RiCheckLine className="h-4 w-4 text-green-500" />
                                            ) : (
                                                <RiFileCopyLine className="h-4 w-4" />
                                            )}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(share.shareToken)}
                                            title="Eliminar acceso"
                                            className="text-red-500 hover:text-red-700">
                                            <RiDeleteBinLine className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
