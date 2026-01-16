'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { RiErrorWarningLine, RiLoader4Line } from '@remixicon/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const errorMessages: Record<string, string> = {
    Configuration: 'Hay un problema con la configuración del servidor.',
    AccessDenied: 'Acceso denegado. No tienes permiso para acceder.',
    Verification: 'El enlace de verificación ha expirado o ya fue usado.',
    Default: 'Ocurrió un error durante la autenticación.',
    CredentialsSignin: 'Email o contraseña incorrectos.',
};

function ErrorContent() {
    const searchParams = useSearchParams();
    const error = searchParams.get('error');

    const errorMessage = error
        ? errorMessages[error] || errorMessages.Default
        : errorMessages.Default;

    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1 text-center">
                    <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                        <RiErrorWarningLine className="h-6 w-6 text-red-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Error de Autenticación</CardTitle>
                    <CardDescription>{errorMessage}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <Button asChild className="w-full">
                        <Link href="/auth/signin">Intentar de nuevo</Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                        <Link href="/">Volver al inicio</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

export default function AuthErrorPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
                    <RiLoader4Line className="h-8 w-8 animate-spin" />
                </div>
            }>
            <ErrorContent />
        </Suspense>
    );
}
