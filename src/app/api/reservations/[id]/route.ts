import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Reservation from '@/models/Reservation';

// PUT - Actualizar una reserva (solo el creador)
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

        // Solo el creador puede modificar
        const reservation = await Reservation.findOne({ _id: id });

        if (!reservation) {
            return NextResponse.json({ error: 'Reserva no encontrada' }, { status: 404 });
        }

        if (reservation.userId.toString() !== session.user.id) {
            return NextResponse.json(
                { error: 'No tienes permiso para modificar esta reserva' },
                { status: 403 }
            );
        }

        const startDate = new Date(start);
        const endDate = new Date(end);

        // Verificar solapamiento con reservas existentes (excluyendo la actual)
        const overlapping = await Reservation.findOne({
            _id: { $ne: id },
            start: { $lt: endDate },
            end: { $gt: startDate },
        });

        if (overlapping) {
            return NextResponse.json(
                { error: 'El horario se solapa con una reserva existente' },
                { status: 409 }
            );
        }

        const updated = await Reservation.findByIdAndUpdate(
            id,
            {
                title,
                description,
                start: startDate,
                end: endDate,
                allDay,
                color,
                location,
            },
            { new: true, runValidators: true }
        );

        if (!updated) {
            return NextResponse.json({ error: 'Reserva no encontrada' }, { status: 404 });
        }

        return NextResponse.json({
            reservation: {
                id: updated._id.toString(),
                title: updated.title,
                description: updated.description,
                start: updated.start.toISOString(),
                end: updated.end.toISOString(),
                allDay: updated.allDay,
                color: updated.color,
                location: updated.location,
                userId: updated.userId.toString(),
            },
        });
    } catch (error) {
        console.error('Error al actualizar reserva:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}

// DELETE - Eliminar una reserva (solo el creador)
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

        const reservation = await Reservation.findOne({ _id: id });

        if (!reservation) {
            return NextResponse.json({ error: 'Reserva no encontrada' }, { status: 404 });
        }

        if (reservation.userId.toString() !== session.user.id) {
            return NextResponse.json(
                { error: 'No tienes permiso para eliminar esta reserva' },
                { status: 403 }
            );
        }

        await Reservation.findByIdAndDelete(id);

        return NextResponse.json({ message: 'Reserva eliminada exitosamente' });
    } catch (error) {
        console.error('Error al eliminar reserva:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
