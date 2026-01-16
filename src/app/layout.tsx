import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import '@/styles/globals.css';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/components/auth';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

export const metadata: Metadata = {
    title: 'Calendario Disei Conelci',
    description:
        'Una aplicación para gestionar y visualizar el calendario de recepciones de documentos del Disei Conelci.',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es">
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <NuqsAdapter>
                    <AuthProvider>
                        {children}
                        <Toaster />
                    </AuthProvider>
                </NuqsAdapter>
            </body>
        </html>
    );
}
