import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Event from '@/models/Event';

// GET - Obtener un evento específico
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { id } = await params;

        await dbConnect();

        const event = await Event.findOne({
            _id: id,
            userId: session.user.id,
        });

        if (!event) {
            return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 });
        }

        return NextResponse.json({
            event: {
                id: event._id.toString(),
                title: event.title,
                description: event.description,
                start: event.start.toISOString(),
                end: event.end.toISOString(),
                allDay: event.allDay,
                color: event.color,
                location: event.location,
                localId: event.localId,
            },
        });
    } catch (error) {
        console.error('Error al obtener evento:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}

// PUT - Actualizar un evento
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { title, description, start, end, allDay, color, location } = body;

        await dbConnect();

        const event = await Event.findOneAndUpdate(
            { _id: id, userId: session.user.id },
            {
                title,
                description,
                start: new Date(start),
                end: new Date(end),
                allDay,
                color,
                location,
            },
            { new: true, runValidators: true }
        );

        if (!event) {
            return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 });
        }

        return NextResponse.json({
            event: {
                id: event._id.toString(),
                title: event.title,
                description: event.description,
                start: event.start.toISOString(),
                end: event.end.toISOString(),
                allDay: event.allDay,
                color: event.color,
                location: event.location,
                localId: event.localId,
            },
        });
    } catch (error) {
        console.error('Error al actualizar evento:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}

// DELETE - Eliminar un evento
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { id } = await params;

        await dbConnect();

        const event = await Event.findOneAndDelete({
            _id: id,
            userId: session.user.id,
        });

        if (!event) {
            return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Evento eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar evento:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
