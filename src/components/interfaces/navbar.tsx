'use client';

import { Calendar } from 'lucide-react';
import Link from 'next/link';
import { UserMenu } from '@/components/auth';
import { ModeToggle } from '../toggle-mode';

interface NavbarProps {
    onSync?: () => Promise<void>;
    hasPendingSync?: boolean;
}

const Navbar = ({ onSync, hasPendingSync }: NavbarProps) => {
    return (
        <header className="bg-background border-b">
            <div className="container mx-auto h-16">
                <div className="flex h-full items-center justify-between">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-lg font-semibold tracking-tight">
                        <Calendar className="h-6 w-6" />
                        <span>Calendario Disei</span>
                    </Link>
                    <div className="flex items-center justify-center gap-2">
                        <ModeToggle />
                        <UserMenu onSync={onSync} hasPendingSync={hasPendingSync} />
                    </div>
                </div>
            </div>
        </header>
    );
};

export { Navbar };
