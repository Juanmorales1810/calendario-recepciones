import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Calendar, { ICalendar } from '@/models/Calendar';
import SharedCalendar from '@/models/SharedCalendar';

interface PopulatedOwner {
    _id: string;
    name: string;
    email: string;
}

// GET - Obtener calendarios del usuario (propios y compartidos)
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        await dbConnect();

        // Obtener calendarios propios
        const ownCalendars: ICalendar[] = await Calendar.find({ userId: session.user.id }).sort({
            isDefault: -1,
            createdAt: 1,
        });

        // Si no tiene calendarios, crear uno por defecto
        if (ownCalendars.length === 0) {
            const defaultCalendar = await Calendar.create({
                userId: session.user.id,
                name: 'Mi Calendario',
                color: 'sky',
                isDefault: true,
            });
            ownCalendars.push(defaultCalendar);
        }

        // Obtener calendarios compartidos conmigo (donde NO soy el dueño)
        const sharedWithMe = await SharedCalendar.find({
            sharedWithId: session.user.id,
            status: 'accepted',
            ownerId: { $ne: session.user.id }, // Excluir calendarios donde soy el dueño
        })
            .populate('ownerId', 'name email')
            .lean();

        return NextResponse.json({
            own: ownCalendars.map((cal) => ({
                id: cal._id.toString(),
                name: cal.name,
                description: cal.description,
                color: cal.color,
                isDefault: cal.isDefault,
                type: 'own' as const,
            })),
            shared: sharedWithMe
                .filter((share) => share.ownerId) // Filtrar shares sin owner
                .map((share) => {
                    const owner = share.ownerId as unknown as PopulatedOwner;
                    return {
                        id: share._id.toString(),
                        name: share.calendarName,
                        color: 'slate',
                        type: 'shared' as const,
                        permission: share.permission,
                        shareToken: share.shareToken,
                        owner: {
                            name: owner.name,
                            email: owner.email,
                        },
                    };
                }),
        });
    } catch (error) {
        console.error('Error al obtener calendarios:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}

// POST - Crear un nuevo calendario
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { name, description, color } = await request.json();

        if (!name?.trim()) {
            return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 });
        }

        await dbConnect();

        const calendar = await Calendar.create({
            userId: session.user.id,
            name: name.trim(),
            description: description?.trim(),
            color: color || 'sky',
            isDefault: false,
        });

        return NextResponse.json(
            {
                id: calendar._id.toString(),
                name: calendar.name,
                description: calendar.description,
                color: calendar.color,
                isDefault: calendar.isDefault,
                type: 'own',
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error al crear calendario:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
