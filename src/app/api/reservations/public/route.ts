import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Reservation from '@/models/Reservation';

// GET - Obtener todas las reservas (público, solo lectura)
export async function GET() {
    try {
        await dbConnect();

        const reservations = await Reservation.find().sort({ start: 1 }).populate('userId', 'name');

        const transformedReservations = reservations.map((r) => {
            const populatedUser = r.userId as unknown as {
                _id: { toString(): string };
                name: string;
            };
            return {
                id: r._id.toString(),
                title: r.title,
                description: r.description,
                start: r.start.toISOString(),
                end: r.end.toISOString(),
                allDay: r.allDay,
                color: r.color,
                location: r.location,
                userName: populatedUser?.name || 'Usuario',
            };
        });

        return NextResponse.json({ reservations: transformedReservations });
    } catch (error) {
        console.error('Error al obtener reservas públicas:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
