import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    password: string;
    image?: string;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: [true, 'El nombre es requerido'],
            trim: true,
            maxlength: [100, 'El nombre no puede exceder 100 caracteres'],
        },
        email: {
            type: String,
            required: [true, 'El email es requerido'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Por favor ingresa un email válido'],
        },
        password: {
            type: String,
            required: [true, 'La contraseña es requerida'],
            minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
            select: false, // No incluir password en queries por defecto
        },
        image: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Hash password antes de guardar
UserSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Método para comparar passwords
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

// Prevenir OverwriteModelError en hot reload de desarrollo
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
