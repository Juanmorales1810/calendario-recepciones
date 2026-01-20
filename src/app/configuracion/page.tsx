'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
    RiBellLine,
    RiNotificationLine,
    RiCheckLine,
    RiCloseLine,
    RiTimeLine,
} from '@remixicon/react';
import { toast } from 'sonner';

export default function ConfiguracionPage() {
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [notificationPermission, setNotificationPermission] =
        useState<NotificationPermission>('default');
    const [swRegistered, setSwRegistered] = useState(false);
    const [oneDayBeforeEnabled, setOneDayBeforeEnabled] = useState(true);
    const [thirtyMinBeforeEnabled, setThirtyMinBeforeEnabled] = useState(true);

    useEffect(() => {
        // Verificar estado del service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistration().then((registration) => {
                setSwRegistered(!!registration);
            });
        }

        // Verificar permisos de notificaciones
        if ('Notification' in window) {
            setNotificationPermission(Notification.permission);
            setNotificationsEnabled(Notification.permission === 'granted');
        }

        // Cargar preferencias guardadas
        const preferences = localStorage.getItem('notificationPreferences');
        if (preferences) {
            const parsed = JSON.parse(preferences);
            setOneDayBeforeEnabled(parsed.oneDayBefore ?? true);
            setThirtyMinBeforeEnabled(parsed.thirtyMinBefore ?? true);
        }
    }, []);

    const requestNotificationPermission = async () => {
        if (!('Notification' in window)) {
            toast.error('Tu navegador no soporta notificaciones');
            return;
        }

        try {
            const permission = await Notification.requestPermission();
            setNotificationPermission(permission);

            if (permission === 'granted') {
                setNotificationsEnabled(true);
                toast.success('Notificaciones activadas');

                // Enviar notificación de prueba
                if ('serviceWorker' in navigator) {
                    const registration = await navigator.serviceWorker.ready;
                    registration.showNotification('Calendario Disei Conelci', {
                        body: 'Las notificaciones están activas. Recibirás recordatorios de tus eventos.',
                        icon: '/icon-192.png',
                        badge: '/icon-192.png',
                        tag: 'test-notification',
                    });
                }
            } else {
                toast.error('Permisos de notificación denegados');
            }
        } catch (error) {
            console.error('Error al solicitar permisos:', error);
            toast.error('Error al solicitar permisos');
        }
    };

    const disableNotifications = () => {
        setNotificationsEnabled(false);
        toast.info('Notificaciones desactivadas. Puedes reactivarlas en cualquier momento.');
    };

    const savePreferences = () => {
        const preferences = {
            oneDayBefore: oneDayBeforeEnabled,
            thirtyMinBefore: thirtyMinBeforeEnabled,
        };
        localStorage.setItem('notificationPreferences', JSON.stringify(preferences));
        toast.success('Preferencias guardadas');
    };

    const sendTestNotification = async () => {
        if (notificationPermission !== 'granted') {
            toast.error('Debes activar las notificaciones primero');
            return;
        }

        try {
            if ('serviceWorker' in navigator) {
                const registration = await navigator.serviceWorker.ready;
                await registration.showNotification('Recordatorio de Evento', {
                    body: 'Esta es una notificación de prueba para tu evento de mañana',
                    icon: '/icon-192.png',
                    badge: '/icon-192.png',
                    tag: 'test-event',
                    requireInteraction: false,
                });
                toast.success('Notificación de prueba enviada');
            }
        } catch (error) {
            console.error('Error al enviar notificación:', error);
            toast.error('Error al enviar notificación');
        }
    };

    return (
        <div className="container mx-auto max-w-4xl px-4 py-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Configuración de Notificaciones</h1>
                <p className="text-muted-foreground mt-2">
                    Configura cómo y cuándo quieres recibir recordatorios de tus eventos
                </p>
            </div>

            <div className="space-y-4">
                {/* Estado del Service Worker */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <RiNotificationLine className="h-5 w-5" />
                            Estado del Sistema
                        </CardTitle>
                        <CardDescription>
                            Verificación del sistema de notificaciones
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Service Worker</span>
                            <Badge variant={swRegistered ? 'default' : 'secondary'}>
                                {swRegistered ? (
                                    <>
                                        <RiCheckLine className="mr-1 h-3 w-3" />
                                        Activo
                                    </>
                                ) : (
                                    <>
                                        <RiCloseLine className="mr-1 h-3 w-3" />
                                        Inactivo
                                    </>
                                )}
                            </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Permisos de Notificación</span>
                            <Badge
                                variant={
                                    notificationPermission === 'granted'
                                        ? 'default'
                                        : notificationPermission === 'denied'
                                          ? 'destructive'
                                          : 'secondary'
                                }>
                                {notificationPermission === 'granted' && (
                                    <RiCheckLine className="mr-1 h-3 w-3" />
                                )}
                                {notificationPermission === 'granted'
                                    ? 'Concedido'
                                    : notificationPermission === 'denied'
                                      ? 'Denegado'
                                      : 'No solicitado'}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Activar/Desactivar Notificaciones */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <RiBellLine className="h-5 w-5" />
                            Activar Notificaciones
                        </CardTitle>
                        <CardDescription>
                            Recibe recordatorios de tus eventos programados
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {notificationPermission === 'default' && (
                            <Button onClick={requestNotificationPermission} className="w-full">
                                <RiBellLine className="mr-2 h-4 w-4" />
                                Activar Notificaciones
                            </Button>
                        )}

                        {notificationPermission === 'granted' && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="notifications-toggle">
                                        Notificaciones activas
                                    </Label>
                                    <Switch
                                        id="notifications-toggle"
                                        checked={notificationsEnabled}
                                        onCheckedChange={(checked) => {
                                            if (checked) {
                                                requestNotificationPermission();
                                            } else {
                                                disableNotifications();
                                            }
                                        }}
                                    />
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={sendTestNotification}
                                    className="w-full">
                                    Enviar Notificación de Prueba
                                </Button>
                            </div>
                        )}

                        {notificationPermission === 'denied' && (
                            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
                                <p className="font-medium">Permisos denegados</p>
                                <p className="mt-1">
                                    Has bloqueado las notificaciones. Para activarlas, debes cambiar
                                    la configuración de tu navegador manualmente.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Configuración de Recordatorios */}
                {notificationsEnabled && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <RiTimeLine className="h-5 w-5" />
                                Recordatorios
                            </CardTitle>
                            <CardDescription>
                                Elige cuándo recibir notificaciones antes de tus eventos
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label htmlFor="one-day-before">1 día antes</Label>
                                    <p className="text-muted-foreground text-sm">
                                        Recibe un recordatorio 24 horas antes del evento
                                    </p>
                                </div>
                                <Switch
                                    id="one-day-before"
                                    checked={oneDayBeforeEnabled}
                                    onCheckedChange={setOneDayBeforeEnabled}
                                />
                            </div>

                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label htmlFor="thirty-min-before">30 minutos antes</Label>
                                    <p className="text-muted-foreground text-sm">
                                        Recibe un recordatorio media hora antes del evento
                                    </p>
                                </div>
                                <Switch
                                    id="thirty-min-before"
                                    checked={thirtyMinBeforeEnabled}
                                    onCheckedChange={setThirtyMinBeforeEnabled}
                                />
                            </div>

                            <Button onClick={savePreferences} className="w-full">
                                Guardar Preferencias
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
