'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import Link from 'next/link';
import { RiUser3Line, RiLogoutBoxLine, RiRefreshLine } from '@remixicon/react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface UserMenuProps {
    onSync?: () => Promise<void>;
    hasPendingSync?: boolean;
}

export function UserMenu({ onSync, hasPendingSync }: UserMenuProps) {
    const { data: session, status } = useSession();
    const [isSyncing, setIsSyncing] = useState(false);

    const handleSync = async () => {
        if (onSync) {
            setIsSyncing(true);
            try {
                await onSync();
            } finally {
                setIsSyncing(false);
            }
        }
    };

    if (status === 'loading') {
        return (
            <Button variant="ghost" size="icon" disabled>
                <RiUser3Line className="h-5 w-5 animate-pulse" />
            </Button>
        );
    }

    if (!session?.user) {
        return (
            <div className="flex items-center gap-2">
                <Button variant="ghost" asChild>
                    <Link href="/auth/signin">Iniciar Sesión</Link>
                </Button>
                <Button asChild>
                    <Link href="/auth/register">Registrarse</Link>
                </Button>
            </div>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative">
                    <RiUser3Line className="mr-2 h-4 w-4" />
                    {session.user.name || session.user.email}
                    {hasPendingSync && (
                        <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-amber-500" />
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{session.user.name}</p>
                    <p className="text-muted-foreground text-xs">{session.user.email}</p>
                </div>
                <DropdownMenuSeparator />
                {onSync && (
                    <DropdownMenuItem onClick={handleSync} disabled={isSyncing}>
                        <RiRefreshLine
                            className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`}
                        />
                        {isSyncing ? 'Sincronizando...' : 'Sincronizar eventos'}
                        {hasPendingSync && !isSyncing && (
                            <span className="ml-auto h-2 w-2 rounded-full bg-amber-500" />
                        )}
                    </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="text-red-600 focus:text-red-600">
                    <RiLogoutBoxLine className="mr-2 h-4 w-4" />
                    Cerrar Sesión
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
