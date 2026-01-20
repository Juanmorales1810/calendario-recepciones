import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IEvent extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    calendarId: mongoose.Types.ObjectId;
    title: string;
    description?: string;
    start: Date;
    end: Date;
    allDay: boolean;
    color: string;
    location?: string;
    localId?: string; // ID original del localStorage para sincronización
    createdAt: Date;
    updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'El ID de usuario es requerido'],
            index: true,
        },
        calendarId: {
            type: Schema.Types.ObjectId,
            ref: 'Calendar',
            required: [true, 'El ID de calendario es requerido'],
            index: true,
        },
        title: {
            type: String,
            required: [true, 'El título es requerido'],
            trim: true,
            maxlength: [200, 'El título no puede exceder 200 caracteres'],
        },
        description: {
            type: String,
            trim: true,
            maxlength: [2000, 'La descripción no puede exceder 2000 caracteres'],
        },
        start: {
            type: Date,
            required: [true, 'La fecha de inicio es requerida'],
        },
        end: {
            type: Date,
            required: [true, 'La fecha de fin es requerida'],
        },
        allDay: {
            type: Boolean,
            default: false,
        },
        color: {
            type: String,
            enum: ['sky', 'amber', 'violet', 'rose', 'emerald', 'orange'],
            default: 'sky',
        },
        location: {
            type: String,
            trim: true,
            maxlength: [500, 'La ubicación no puede exceder 500 caracteres'],
        },
        localId: {
            type: String,
            sparse: true, // Permite múltiples nulls
        },
    },
    {
        timestamps: true,
    }
);

// Índice compuesto para buscar eventos de un calendario en un rango de fechas
EventSchema.index({ calendarId: 1, start: 1, end: 1 });

// Índice para buscar eventos de un usuario
EventSchema.index({ userId: 1, start: 1, end: 1 });

// Índice para buscar por localId (útil para sincronización)
EventSchema.index({ userId: 1, localId: 1 });

// Prevenir OverwriteModelError en hot reload de desarrollo
const Event: Model<IEvent> = mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);

export default Event;
