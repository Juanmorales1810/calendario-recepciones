import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
    try {
        const { name, email, password } = await request.json();

        // Validación básica
        if (!name || !email || !password) {
            return NextResponse.json(
                { error: 'Nombre, email y contraseña son requeridos' },
                { status: 400 }
            );
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: 'La contraseña debe tener al menos 6 caracteres' },
                { status: 400 }
            );
        }

        await dbConnect();

        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ email: email.toLowerCase() });

        if (existingUser) {
            return NextResponse.json({ error: 'El email ya está registrado' }, { status: 400 });
        }

        // Crear nuevo usuario
        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password,
        });

        return NextResponse.json(
            {
                message: 'Usuario creado exitosamente',
                user: {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error al registrar usuario:', error);

        if (error instanceof Error && error.name === 'ValidationError') {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
