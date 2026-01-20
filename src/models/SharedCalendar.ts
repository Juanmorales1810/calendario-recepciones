import mongoose, { Document, Model, Schema } from 'mongoose';

export type SharePermission = 'read' | 'write';

export interface ISharedCalendar extends Document {
    _id: mongoose.Types.ObjectId;
    ownerId: mongoose.Types.ObjectId;
    calendarId: mongoose.Types.ObjectId; // ID del calendario específico que se comparte
    sharedWithEmail: string;
    sharedWithId?: mongoose.Types.ObjectId; // Se llena cuando el usuario acepta
    permission: SharePermission;
    shareToken: string; // Token único para el link de compartir
    status: 'pending' | 'accepted' | 'rejected';
    calendarName: string; // Nombre personalizado del calendario compartido
    createdAt: Date;
    updatedAt: Date;
}

const SharedCalendarSchema = new Schema<ISharedCalendar>(
    {
        ownerId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'El ID del propietario es requerido'],
            index: true,
        },
        calendarId: {
            type: Schema.Types.ObjectId,
            ref: 'Calendar',
            required: [true, 'El ID del calendario es requerido'],
            index: true,
        },
        sharedWithEmail: {
            type: String,
            required: [true, 'El email del usuario es requerido'],
            lowercase: true,
            trim: true,
        },
        sharedWithId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        permission: {
            type: String,
            enum: ['read', 'write'],
            default: 'read',
        },
        shareToken: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected'],
            default: 'pending',
        },
        calendarName: {
            type: String,
            required: [true, 'El nombre del calendario es requerido'],
            trim: true,
            maxlength: [100, 'El nombre no puede exceder 100 caracteres'],
        },
    },
    {
        timestamps: true,
    }
);

// Índices
SharedCalendarSchema.index({ ownerId: 1, calendarId: 1, sharedWithEmail: 1 }, { unique: true });
SharedCalendarSchema.index({ sharedWithId: 1 });

const SharedCalendar: Model<ISharedCalendar> =
    mongoose.models.SharedCalendar ||
    mongoose.model<ISharedCalendar>('SharedCalendar', SharedCalendarSchema);

export default SharedCalendar;
