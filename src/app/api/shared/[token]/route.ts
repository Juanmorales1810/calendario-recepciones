import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import SharedCalendar from '@/models/SharedCalendar';
import Event from '@/models/Event';
import User from '@/models/User';

interface PopulatedUser {
    _id: string;
    name: string;
    email: string;
}

interface PopulatedShare {
    _id: string;
    ownerId: PopulatedUser | null;
    calendarId?: string;
    sharedWithId?: PopulatedUser | null;
    sharedWithEmail: string;
    permission: 'read' | 'write';
    shareToken: string;
    status: 'pending' | 'accepted' | 'rejected';
    calendarName: string;
    save: () => Promise<void>;
}

// GET - Obtener información del calendario compartido y eventos
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params;
        const session = await auth();

        console.log('🔍 [SharedCalendar GET] Token:', token);
        console.log('🔍 [SharedCalendar GET] Session:', session?.user?.id);

        await dbConnect();

        // Buscar el share por token (sin populate primero para obtener el ownerId raw)
        const shareRaw = await SharedCalendar.findOne({ shareToken: token });

        console.log('🔍 [SharedCalendar GET] Share found:', shareRaw ? 'YES' : 'NO');
        if (shareRaw) {
            console.log('🔍 [SharedCalendar GET] OwnerId:', shareRaw.ownerId);
            console.log('🔍 [SharedCalendar GET] CalendarId:', shareRaw.calendarId);
        }

        if (!shareRaw) {
            return NextResponse.json({ error: 'Calendario no encontrado' }, { status: 404 });
        }

        // Obtener el propietario directamente
        console.log('🔍 [SharedCalendar GET] Searching for owner with ID:', shareRaw.ownerId);
        console.log('🔍 [SharedCalendar GET] ID Type:', typeof shareRaw.ownerId);

        // Intentar obtener todos los usuarios para debug
        const allUsers = await User.find({}).select('_id name email').limit(5);
        console.log(
            '🔍 [SharedCalendar GET] Sample users in DB:',
            allUsers.map((u) => ({ id: u._id.toString(), name: u.name }))
        );

        const owner = await User.findById(shareRaw.ownerId).select('name email');

        console.log('🔍 [SharedCalendar GET] Owner found:', owner ? 'YES' : 'NO');
        if (owner) {
            console.log('🔍 [SharedCalendar GET] Owner name:', owner.name);
        }

        if (!owner) {
            console.error('❌ [SharedCalendar GET] Owner not found for ownerId:', shareRaw.ownerId);
            console.error(
                '❌ [SharedCalendar GET] This user may have been deleted. Share should be cleaned up.'
            );
            return NextResponse.json(
                {
                    error: 'El propietario de este calendario ya no existe. Contacta al administrador.',
                },
                { status: 404 }
            );
        }

        // Si el usuario está autenticado, verificar permisos
        if (session?.user?.id) {
            const currentUser = await User.findById(session.user.id);

            // Verificar si es el propietario o tiene acceso
            const isOwner = shareRaw.ownerId.toString() === session.user.id;
            const isSharedWith =
                shareRaw.sharedWithId?.toString() === session.user.id ||
                shareRaw.sharedWithEmail === currentUser?.email;

            if (!isOwner && !isSharedWith) {
                return NextResponse.json(
                    { error: 'No tienes acceso a este calendario' },
                    { status: 403 }
                );
            }

            // Si es el usuario compartido y el status es pending, actualizar a accepted
            if (isSharedWith && shareRaw.status === 'pending') {
                await SharedCalendar.updateOne(
                    { shareToken: token },
                    { sharedWithId: currentUser?._id, status: 'accepted' }
                );
            }
        }

        // Obtener eventos del calendario compartido
        const events = await Event.find({
            userId: shareRaw.ownerId,
            ...(shareRaw.calendarId ? { calendarId: shareRaw.calendarId } : {}),
        }).sort({ start: 1 });

        return NextResponse.json({
            share: {
                id: shareRaw._id,
                calendarName: shareRaw.calendarName,
                permission: shareRaw.permission,
                status: shareRaw.status,
                owner: {
                    name: owner.name,
                    email: owner.email,
                },
            },
            events: events.map((event) => ({
                id: event._id.toString(),
                title: event.title,
                description: event.description,
                start: event.start.toISOString(),
                end: event.end.toISOString(),
                allDay: event.allDay,
                color: event.color,
                location: event.location,
            })),
        });
    } catch (error) {
        console.error('Error al obtener calendario compartido:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}

// PUT - Actualizar un evento en calendario compartido (si tiene permiso write)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params;
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        await dbConnect();

        const share = await SharedCalendar.findOne({ shareToken: token });

        if (!share) {
            return NextResponse.json({ error: 'Calendario no encontrado' }, { status: 404 });
        }

        // Verificar permiso de escritura
        const currentUser = await User.findById(session.user.id);
        const isSharedWith =
            share.sharedWithId?.toString() === session.user.id ||
            share.sharedWithEmail === currentUser?.email;

        if (!isSharedWith || share.permission !== 'write') {
            return NextResponse.json(
                { error: 'No tienes permiso para editar este calendario' },
                { status: 403 }
            );
        }

        const { eventId, ...eventData } = await request.json();

        if (!eventId) {
            return NextResponse.json({ error: 'ID del evento es requerido' }, { status: 400 });
        }

        // Actualizar el evento
        const event = await Event.findOneAndUpdate(
            { _id: eventId, userId: share.ownerId },
            {
                ...eventData,
                start: new Date(eventData.start),
                end: new Date(eventData.end),
            },
            { new: true }
        );

        if (!event) {
            return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 });
        }

        return NextResponse.json({
            id: event._id.toString(),
            title: event.title,
            description: event.description,
            start: event.start.toISOString(),
            end: event.end.toISOString(),
            allDay: event.allDay,
            color: event.color,
            location: event.location,
        });
    } catch (error) {
        console.error('Error al actualizar evento:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}

// POST - Crear evento en calendario compartido (si tiene permiso write)
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params;
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        await dbConnect();

        const share = await SharedCalendar.findOne({ shareToken: token });

        if (!share) {
            return NextResponse.json({ error: 'Calendario no encontrado' }, { status: 404 });
        }

        // Verificar permiso de escritura
        const currentUser = await User.findById(session.user.id);
        const isSharedWith =
            share.sharedWithId?.toString() === session.user.id ||
            share.sharedWithEmail === currentUser?.email;

        if (!isSharedWith || share.permission !== 'write') {
            return NextResponse.json(
                { error: 'No tienes permiso para crear eventos en este calendario' },
                { status: 403 }
            );
        }

        const eventData = await request.json();

        // Crear evento para el propietario del calendario
        const event = await Event.create({
            ...eventData,
            userId: share.ownerId,
            start: new Date(eventData.start),
            end: new Date(eventData.end),
        });

        return NextResponse.json(
            {
                id: event._id.toString(),
                title: event.title,
                description: event.description,
                start: event.start.toISOString(),
                end: event.end.toISOString(),
                allDay: event.allDay,
                color: event.color,
                location: event.location,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error al crear evento:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}

// DELETE - Eliminar share o evento en calendario compartido
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params;
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        await dbConnect();

        const { searchParams } = new URL(request.url);
        const eventId = searchParams.get('eventId');

        const share = await SharedCalendar.findOne({ shareToken: token });

        if (!share) {
            return NextResponse.json({ error: 'Calendario no encontrado' }, { status: 404 });
        }

        // Si es el propietario y no hay eventId, eliminar el share
        if (share.ownerId.toString() === session.user.id && !eventId) {
            await SharedCalendar.deleteOne({ _id: share._id });
            return NextResponse.json({ message: 'Calendario compartido eliminado' });
        }

        // Si hay eventId, eliminar el evento (solo con permiso write)
        if (eventId) {
            const currentUser = await User.findById(session.user.id);
            const isSharedWith =
                share.sharedWithId?.toString() === session.user.id ||
                share.sharedWithEmail === currentUser?.email;

            if (!isSharedWith || share.permission !== 'write') {
                return NextResponse.json(
                    { error: 'No tienes permiso para eliminar eventos' },
                    { status: 403 }
                );
            }

            await Event.deleteOne({ _id: eventId, userId: share.ownerId });
            return NextResponse.json({ message: 'Evento eliminado' });
        }

        return NextResponse.json({ error: 'Operación no válida' }, { status: 400 });
    } catch (error) {
        console.error('Error al eliminar:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
