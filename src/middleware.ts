import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Rutas públicas que no requieren autenticación
    const publicRoutes = ['/auth/signin', '/auth/register', '/auth/error'];
    const isPublicRoute = publicRoutes.includes(pathname);

    // Rutas de API de autenticación (siempre públicas)
    const isAuthApi = pathname.startsWith('/api/auth');

    // Verificar si hay una sesión (cookie de NextAuth)
    const sessionToken =
        request.cookies.get('authjs.session-token')?.value ||
        request.cookies.get('__Secure-authjs.session-token')?.value;

    const isLoggedIn = !!sessionToken;

    // Si es una ruta pública o API de auth, permitir acceso
    if (isPublicRoute || isAuthApi) {
        // Si el usuario ya está autenticado y trata de acceder a login/register, redirigir a home
        if (isLoggedIn && (pathname === '/auth/signin' || pathname === '/auth/register')) {
            return NextResponse.redirect(new URL('/', request.url));
        }
        return NextResponse.next();
    }

    // Si no está autenticado y trata de acceder a una ruta protegida
    if (!isLoggedIn) {
        const signInUrl = new URL('/auth/signin', request.url);
        signInUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(signInUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
