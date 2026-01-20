import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ICalendar extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    name: string;
    description?: string;
    color: string;
    isDefault: boolean; // Calendario principal del usuario
    createdAt: Date;
    updatedAt: Date;
}

const CalendarSchema = new Schema<ICalendar>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'El ID de usuario es requerido'],
            index: true,
        },
        name: {
            type: String,
            required: [true, 'El nombre es requerido'],
            trim: true,
            maxlength: [100, 'El nombre no puede exceder 100 caracteres'],
        },
        description: {
            type: String,
            trim: true,
            maxlength: [500, 'La descripción no puede exceder 500 caracteres'],
        },
        color: {
            type: String,
            enum: ['sky', 'amber', 'violet', 'rose', 'emerald', 'orange', 'indigo', 'pink', 'teal'],
            default: 'sky',
        },
        isDefault: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Índice único para asegurar solo un calendario default por usuario
CalendarSchema.index(
    { userId: 1, isDefault: 1 },
    {
        unique: true,
        partialFilterExpression: { isDefault: true },
    }
);

const Calendar: Model<ICalendar> =
    mongoose.models.Calendar || mongoose.model<ICalendar>('Calendar', CalendarSchema);

export default Calendar;
