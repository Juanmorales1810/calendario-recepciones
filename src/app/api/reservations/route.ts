import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Reservation from '@/models/Reservation';

function transformReservation(reservation: InstanceType<typeof Reservation>) {
    return {
        id: reservation._id.toString(),
        title: reservation.title,
        description: reservation.description,
        start: reservation.start.toISOString(),
        end: reservation.end.toISOString(),
        allDay: reservation.allDay,
        color: reservation.color,
        location: reservation.location,
        userId: reservation.userId.toString(),
    };
}

// GET - Obtener todas las reservas (autenticado)
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        await dbConnect();

        const reservations = await Reservation.find().sort({ start: 1 }).populate('userId', 'name');

        const transformedReservations = reservations.map((r) => {
            const populatedUser = r.userId as unknown as {
                _id: { toString(): string };
                name: string;
            };
            return {
                ...transformReservation(r),
                userId: populatedUser?._id?.toString() || '',
                userName: populatedUser?.name || 'Usuario',
            };
        });

        return NextResponse.json({ reservations: transformedReservations });
    } catch (error) {
        console.error('Error al obtener reservas:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}

// POST - Crear una nueva reserva
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const body = await request.json();
        const { title, description, start, end, allDay, color, location } = body;

        if (!title || !start || !end) {
            return NextResponse.json(
                { error: 'Título, fecha de inicio y fin son requeridos' },
                { status: 400 }
            );
        }

        await dbConnect();

        const startDate = new Date(start);
        const endDate = new Date(end);

        // Verificar solapamiento con reservas existentes
        const overlapping = await Reservation.findOne({
            start: { $lt: endDate },
            end: { $gt: startDate },
        });

        if (overlapping) {
            return NextResponse.json(
                { error: 'El horario se solapa con una reserva existente' },
                { status: 409 }
            );
        }

        const reservation = await Reservation.create({
            userId: session.user.id,
            title,
            description,
            start: startDate,
            end: endDate,
            allDay: allDay || false,
            color: color || 'sky',
            location,
        });

        return NextResponse.json(
            {
                reservation: {
                    ...transformReservation(reservation),
                    userName: session.user.name || 'Usuario',
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error al crear reserva:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
