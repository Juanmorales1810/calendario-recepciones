'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { BoltIcon, BookOpenIcon, CalendarDaysIcon, LogOutIcon, UserPenIcon } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function getInitials(name?: string | null): string {
    if (!name) return '?';
    return name
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase();
}

export default function UserMenu() {
    const { data: session, status } = useSession();

    if (status === 'loading') {
        return (
            <Button className="h-auto p-0 hover:bg-transparent" variant="ghost" disabled>
                <Avatar>
                    <AvatarFallback className="animate-pulse">...</AvatarFallback>
                </Avatar>
            </Button>
        );
    }

    if (!session?.user) {
        return (
            <Button variant="ghost" asChild>
                <Link href="/auth/signin">Iniciar Sesión</Link>
            </Button>
        );
    }

    const { name, email, image } = session.user;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button className="h-auto hover:bg-transparent" variant="ghost">
                    <Avatar>
                        {image ? <AvatarImage alt={name ?? 'Avatar'} src={image} /> : null}
                        <AvatarFallback>{getInitials(name)}</AvatarFallback>
                    </Avatar>
                    <div className="ml-2 hidden flex-col items-start md:flex">
                        <span className="text-foreground truncate text-sm font-medium">{name}</span>
                    </div>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-w-64">
                <DropdownMenuLabel className="flex min-w-0 flex-col">
                    <span className="text-foreground truncate text-sm font-medium">{name}</span>
                    <span className="text-muted-foreground truncate text-xs font-normal">
                        {email}
                    </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                        <Link href="/recepciones">
                            <BookOpenIcon aria-hidden="true" className="opacity-60" size={16} />
                            <span>Recepciones</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href="/reservas">
                            <CalendarDaysIcon aria-hidden="true" className="opacity-60" size={16} />
                            <span>Reservas</span>
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                        <Link href="/configuracion">
                            <BoltIcon aria-hidden="true" className="opacity-60" size={16} />
                            <span>Configuración</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <Link href="/configuracion#perfil">
                            <UserPenIcon aria-hidden="true" className="opacity-60" size={16} />
                            <span>Editar perfil</span>
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="text-red-600 focus:text-red-600">
                    <LogOutIcon aria-hidden="true" className="opacity-60" size={16} />
                    <span>Cerrar sesión</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
