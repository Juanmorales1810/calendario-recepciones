import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Event from '@/models/Event';
import Calendar from '@/models/Calendar';

// GET - Obtener todos los eventos del usuario (opcionalmente filtrado por calendario)
export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        await dbConnect();

        const { searchParams } = new URL(request.url);
        const calendarId = searchParams.get('calendarId');

        // Construir query
        const query: Record<string, unknown> = { userId: session.user.id };
        if (calendarId) {
            query.calendarId = calendarId;
        }

        const events = await Event.find(query).sort({ start: 1 });

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
            calendarId: event.calendarId?.toString(),
        }));

        return NextResponse.json({ events: transformedEvents });
    } catch (error) {
        console.error('Error al obtener eventos:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}

// Función helper para obtener o crear calendario por defecto
async function getDefaultCalendar(userId: string) {
    let calendar = await Calendar.findOne({ userId, isDefault: true });
    if (!calendar) {
        calendar = await Calendar.create({
            userId,
            name: 'Mi Calendario',
            color: 'sky',
            isDefault: true,
        });
    }
    return calendar;
}

// POST - Crear un nuevo evento
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const body = await request.json();
        const { title, description, start, end, allDay, color, location, localId, calendarId } =
            body;

        if (!title || !start || !end) {
            return NextResponse.json(
                { error: 'Título, fecha de inicio y fin son requeridos' },
                { status: 400 }
            );
        }

        await dbConnect();

        // Si no se especifica calendario, usar el default
        let targetCalendarId = calendarId;
        if (!targetCalendarId) {
            const defaultCalendar = await getDefaultCalendar(session.user.id);
            targetCalendarId = defaultCalendar._id;
        } else {
            // Verificar que el calendario pertenece al usuario
            const calendar = await Calendar.findOne({ _id: calendarId, userId: session.user.id });
            if (!calendar) {
                return NextResponse.json({ error: 'Calendario no encontrado' }, { status: 404 });
            }
        }

        const event = await Event.create({
            userId: session.user.id,
            calendarId: targetCalendarId,
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
                    calendarId: event.calendarId?.toString(),
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error al crear evento:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
