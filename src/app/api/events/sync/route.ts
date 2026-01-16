import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Event from '@/models/Event';

interface LocalEvent {
    id: string;
    title: string;
    description?: string;
    start: string;
    end: string;
    allDay?: boolean;
    color?: string;
    location?: string;
}

// POST - Sincronizar eventos desde localStorage
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { events: localEvents }: { events: LocalEvent[] } = await request.json();

        if (!Array.isArray(localEvents)) {
            return NextResponse.json({ error: 'Se esperaba un array de eventos' }, { status: 400 });
        }

        await dbConnect();

        // Obtener todos los eventos existentes del usuario
        const existingEvents = await Event.find({ userId: session.user.id });

        // Crear un Set con los localIds existentes para búsqueda rápida
        const existingLocalIds = new Set(existingEvents.map((e) => e.localId).filter(Boolean));

        // Crear un Set con los IDs de MongoDB existentes (para detectar eventos ya sincronizados)
        const existingMongoIds = new Set(existingEvents.map((e) => e._id.toString()));

        const results = {
            created: 0,
            skipped: 0,
            errors: [] as string[],
        };

        for (const localEvent of localEvents) {
            try {
                // Saltar si el ID local ya es un ID de MongoDB existente (evento ya sincronizado)
                if (existingMongoIds.has(localEvent.id)) {
                    results.skipped++;
                    continue;
                }

                // Saltar si ya existe un evento con este localId
                if (existingLocalIds.has(localEvent.id)) {
                    results.skipped++;
                    continue;
                }

                // Crear el evento en la base de datos
                const newEvent = await Event.create({
                    userId: session.user.id,
                    title: localEvent.title || '(sin título)',
                    description: localEvent.description,
                    start: new Date(localEvent.start),
                    end: new Date(localEvent.end),
                    allDay: localEvent.allDay || false,
                    color: localEvent.color || 'sky',
                    location: localEvent.location,
                    localId: localEvent.id, // Guardar el ID local para referencia
                });

                // Agregar a los sets para evitar duplicados en la misma sincronización
                existingLocalIds.add(localEvent.id);
                existingMongoIds.add(newEvent._id.toString());

                results.created++;
            } catch (error) {
                console.error('Error al sincronizar evento:', error);
                results.errors.push(`Error con evento "${localEvent.title}": ${error}`);
            }
        }

        // Obtener todos los eventos actualizados del usuario
        const allEvents = await Event.find({ userId: session.user.id }).sort({ start: 1 });

        const transformedEvents = allEvents.map((event) => ({
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

        return NextResponse.json({
            message: `Sincronización completada: ${results.created} creados, ${results.skipped} omitidos`,
            results,
            events: transformedEvents,
        });
    } catch (error) {
        console.error('Error en sincronización:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
