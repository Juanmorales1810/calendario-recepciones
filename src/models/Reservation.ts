import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IReservation extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    title: string;
    description?: string;
    start: Date;
    end: Date;
    allDay: boolean;
    color: string;
    location?: string;
    createdAt: Date;
    updatedAt: Date;
}

const ReservationSchema = new Schema<IReservation>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'El ID de usuario es requerido'],
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
    },
    {
        timestamps: true,
    }
);

ReservationSchema.index({ start: 1, end: 1 });
ReservationSchema.index({ userId: 1, start: 1, end: 1 });

const Reservation: Model<IReservation> =
    mongoose.models.Reservation || mongoose.model<IReservation>('Reservation', ReservationSchema);

export default Reservation;
