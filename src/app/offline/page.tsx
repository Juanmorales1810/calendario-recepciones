import { RiWifiOffLine } from '@remixicon/react';

export default function OfflinePage() {
    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
            <RiWifiOffLine className="text-muted-foreground mb-4 h-16 w-16" />
            <h1 className="text-2xl font-bold">Sin conexión</h1>
            <p className="text-muted-foreground mt-2 max-w-md">
                No tienes conexión a internet. Verifica tu conexión e intenta de nuevo.
            </p>
        </div>
    );
}
