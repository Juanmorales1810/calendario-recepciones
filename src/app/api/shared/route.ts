import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import SharedCalendar, { ISharedCalendar } from '@/models/SharedCalendar';
import User from '@/models/User';
import crypto from 'crypto';

// GET - Obtener calendarios compartidos (por mí y conmigo)
export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        await dbConnect();

        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type') || 'all'; // 'owned', 'shared', 'all'
        const calendarId = searchParams.get('calendarId'); // Filtrar por calendario específico

        let ownedShares: ISharedCalendar[] = [];
        let sharedWithMe: ISharedCalendar[] = [];

        if (type === 'owned' || type === 'all') {
            // Calendarios que yo he compartido
            const query: Record<string, unknown> = { ownerId: session.user.id };
            if (calendarId) {
                query.calendarId = calendarId;
            }
            ownedShares = await SharedCalendar.find(query)
                .populate('sharedWithId', 'name email')
                .sort({ createdAt: -1 });
        }

        if (type === 'shared' || type === 'all') {
            // Calendarios compartidos conmigo (por email o por ID)
            const user = await User.findById(session.user.id);
            if (user) {
                const rawShares = await SharedCalendar.find({
                    $or: [
                        { sharedWithId: session.user.id },
                        { sharedWithEmail: user.email, status: 'pending' },
                    ],
                }).sort({ createdAt: -1 });

                // Poblar manualmente y filtrar los que no tienen owner
                for (const share of rawShares) {
                    const owner = await User.findById(share.ownerId).select('name email');
                    if (owner) {
                        // Solo agregar shares donde el owner existe
                        sharedWithMe.push({
                            ...share.toObject(),
                            ownerId: {
                                _id: owner._id,
                                name: owner.name,
                                email: owner.email,
                            },
                        } as any);
                    } else {
                        console.warn(
                            `⚠️ Share ${share._id} tiene un ownerId inválido: ${share.ownerId}`
                        );
                    }
                }
            }
        }

        return NextResponse.json({
            owned: ownedShares,
            sharedWithMe: sharedWithMe,
        });
    } catch (error) {
        console.error('Error al obtener calendarios compartidos:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}

// POST - Compartir calendario con un usuario
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { email, permission, calendarName, calendarId } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email es requerido' }, { status: 400 });
        }

        if (!calendarId) {
            return NextResponse.json({ error: 'ID del calendario es requerido' }, { status: 400 });
        }

        await dbConnect();

        // Limpiar índice viejo si existe (solo la primera vez)
        try {
            const collection = SharedCalendar.collection;
            const indexes = await collection.indexes();
            const oldIndexExists = indexes.some(
                (idx) => idx.name === 'ownerId_1_sharedWithEmail_1'
            );
            if (oldIndexExists) {
                console.log('🗑️ Eliminando índice viejo ownerId_1_sharedWithEmail_1');
                await collection.dropIndex('ownerId_1_sharedWithEmail_1');
                console.log('✅ Índice viejo eliminado correctamente');
            }
        } catch (err) {
            console.log('ℹ️ No se pudo eliminar el índice viejo (puede no existir):', err);
        }

        // Verificar que no sea el mismo usuario
        const currentUser = await User.findById(session.user.id);
        if (currentUser?.email.toLowerCase() === email.toLowerCase()) {
            return NextResponse.json(
                { error: 'No puedes compartir el calendario contigo mismo' },
                { status: 400 }
            );
        }

        // Verificar si ya existe un share con este email para este calendario
        const existingShare = await SharedCalendar.findOne({
            ownerId: session.user.id,
            calendarId: calendarId,
            sharedWithEmail: email.toLowerCase(),
        });

        if (existingShare) {
            return NextResponse.json(
                { error: 'Ya has compartido este calendario con este usuario' },
                { status: 400 }
            );
        }

        // Buscar si el usuario ya existe en el sistema
        const targetUser = await User.findOne({ email: email.toLowerCase() });

        // Generar token único
        const shareToken = crypto.randomBytes(32).toString('hex');

        // Crear el share
        const sharedCalendar = await SharedCalendar.create({
            ownerId: session.user.id,
            calendarId: calendarId,
            sharedWithEmail: email.toLowerCase(),
            sharedWithId: targetUser?._id ?? undefined,
            permission: permission || 'read',
            shareToken,
            status: 'pending',
            calendarName: calendarName || 'Calendario compartido',
        });

        return NextResponse.json(
            {
                message: 'Calendario compartido exitosamente',
                share: sharedCalendar,
                shareLink: `/shared/${shareToken}`,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error al compartir calendario:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
