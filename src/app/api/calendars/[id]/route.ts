import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Calendar from '@/models/Calendar';
import Event from '@/models/Event';

// GET - Obtener un calendario específico
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        await dbConnect();

        const calendar = await Calendar.findOne({
            _id: id,
            userId: session.user.id,
        });

        if (!calendar) {
            return NextResponse.json({ error: 'Calendario no encontrado' }, { status: 404 });
        }

        return NextResponse.json({
            id: calendar._id.toString(),
            name: calendar.name,
            description: calendar.description,
            color: calendar.color,
            isDefault: calendar.isDefault,
        });
    } catch (error) {
        console.error('Error al obtener calendario:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}

// PUT - Actualizar un calendario
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { name, description, color } = await request.json();

        await dbConnect();

        const calendar = await Calendar.findOneAndUpdate(
            { _id: id, userId: session.user.id },
            {
                ...(name && { name: name.trim() }),
                ...(description !== undefined && { description: description?.trim() }),
                ...(color && { color }),
            },
            { new: true }
        );

        if (!calendar) {
            return NextResponse.json({ error: 'Calendario no encontrado' }, { status: 404 });
        }

        return NextResponse.json({
            id: calendar._id.toString(),
            name: calendar.name,
            description: calendar.description,
            color: calendar.color,
            isDefault: calendar.isDefault,
        });
    } catch (error) {
        console.error('Error al actualizar calendario:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}

// DELETE - Eliminar un calendario
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        await dbConnect();

        const calendar = await Calendar.findOne({
            _id: id,
            userId: session.user.id,
        });

        if (!calendar) {
            return NextResponse.json({ error: 'Calendario no encontrado' }, { status: 404 });
        }

        if (calendar.isDefault) {
            return NextResponse.json(
                { error: 'No puedes eliminar el calendario principal' },
                { status: 400 }
            );
        }

        // Eliminar todos los eventos del calendario
        await Event.deleteMany({ calendarId: id });

        // Eliminar el calendario
        await Calendar.deleteOne({ _id: id });

        return NextResponse.json({ message: 'Calendario eliminado' });
    } catch (error) {
        console.error('Error al eliminar calendario:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
