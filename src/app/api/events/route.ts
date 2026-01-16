import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Event from '@/models/Event';

// GET - Obtener todos los eventos del usuario
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        await dbConnect();

        const events = await Event.find({ userId: session.user.id }).sort({ start: 1 });

        // Transformar eventos para el frontend
        const transformedEvents = events.map((event) => ({
            id: event._id.toString(),
            title: event.title,
            description: event.description,
            start: event.start.toISOString(),
            end: event.end.toISOString(),
            allDay: event.allDay,
            color: event.color,
            location: event.location,
            localId: event.localId,
        }));

        return NextResponse.json({ events: transformedEvents });
    } catch (error) {
        console.error('Error al obtener eventos:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}

// POST - Crear un nuevo evento
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const body = await request.json();
        const { title, description, start, end, allDay, color, location, localId } = body;

        if (!title || !start || !end) {
            return NextResponse.json(
                { error: 'Título, fecha de inicio y fin son requeridos' },
                { status: 400 }
            );
        }

        await dbConnect();

        const event = await Event.create({
            userId: session.user.id,
            title,
            description,
            start: new Date(start),
            end: new Date(end),
            allDay: allDay || false,
            color: color || 'sky',
            location,
            localId,
        });

        return NextResponse.json(
            {
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
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error al crear evento:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
