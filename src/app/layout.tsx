import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import '@/styles/globals.css';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/components/auth';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { ThemeProvider } from '@/components/theme-provider';
import { PWAInstall } from '@/components/pwa-install';
import { InstallPrompt } from '@/components/install-prompt';

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
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: 'Calendario',
    },
};

export const viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    themeColor: '#0152cb',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="es" suppressHydrationWarning>
            <head>
                <link rel="icon" href="/favicon.svg" sizes="any" />
                <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
                <link rel="apple-touch-icon" href="/apple-touch-icon.svg" />
            </head>
            <body
                className={`${geistSans.variable} ${geistMono.variable} bg-background relative min-h-screen w-full antialiased`}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange>
                    <div
                        className="absolute inset-0 -z-10 dark:opacity-40"
                        style={{
                            backgroundImage: `
                            linear-gradient(to right, #e7e5e4 1px, transparent 1px),
                            linear-gradient(to bottom, #e7e5e4 1px, transparent 1px)
                        `,
                            backgroundSize: '20px 20px',
                            backgroundPosition: '0 0, 0 0',
                            maskImage: `
                            repeating-linear-gradient(
                                to right,
                                black 0px,
                                black 3px,
                                transparent 3px,
                                transparent 8px
                                ),
                                repeating-linear-gradient(
                                to bottom,
                                black 0px,
                                black 3px,
                                transparent 3px,
                                transparent 8px
                                ),
                                radial-gradient(ellipse 100% 80% at 50% 100%, #000 50%, transparent 90%)
                        `,
                            WebkitMaskImage: `
                            repeating-linear-gradient(
                                        to right,
                                        black 0px,
                                        black 3px,
                                        transparent 3px,
                                        transparent 8px
                                        ),
                                        repeating-linear-gradient(
                                        to bottom,
                                        black 0px,
                                        black 3px,
                                        transparent 3px,
                                        transparent 8px
                                        ),
                                        radial-gradient(ellipse 100% 80% at 50% 100%, #000 50%, transparent 90%)
                                `,
                            maskComposite: 'intersect',
                            WebkitMaskComposite: 'source-in',
                        }}
                    />
                    <NuqsAdapter>
                        <AuthProvider>
                            <PWAInstall />
                            <InstallPrompt />
                            {children}
                            <Toaster />
                        </AuthProvider>
                    </NuqsAdapter>
                </ThemeProvider>
            </body>
        </html>
    );
}
