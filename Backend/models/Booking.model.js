import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        hotel: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hotel",
            required: true,
            index: true,
        },
        room: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Room",
            required: true,
            index: true,
        },
        checkInDate: {
            type: Date,
            required: true,
        },
        checkOutDate: {
            type: Date,
            required: true,
        },
        adults: {
            type: Number,
            required: true,
            min: 1,
        },
        children: {
            type: Number,
            default: 0,
            min: 0,
        },
        persons: {
            type: Number,
            required: true,
            min: 1,
        },
        guestDetails: {
            name: { type: String, required: true, trim: true },
            mobile: { type: String, required: true, trim: true },
            email: { type: String, required: true, trim: true, lowercase: true },
            aadhaarLast4: { type: String, required: true, match: /^\d{4}$/ },
            travelers: [{
                name: { type: String, required: true, trim: true },
                mobile: { type: String, required: true, trim: true },
                aadhaarLast4: { type: String, required: true, match: /^\d{4}$/ },
            }],
        },
        roomsBooked: {
            type: Number,
            required: true,
            min: 1,
        },
        nightCount: {
            type: Number,
            required: true,
            min: 1,
        },
        pricePerNight: {
            type: Number,
            required: true,
            min: 0,
        },
        taxPercentage: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
        },
        taxAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        totalPrice: {
            type: Number,
            required: true,
            min: 0,
        },
        clientRequestId: {
            type: String,
            required: true,
            maxlength: 128,
        },
        status: {
            type: String,
            enum: ["confirmed", "pending", "payment_pending", "cancelled"],
            default: "pending",
        },
        paymentMethod: {
            type: String,
            enum: ["pay at hotel", "pay online"],
            default: "pay at hotel",
            required: true,
        },
        paymentHoldExpiresAt: {
            type: Date,
            default: null,
        },
        isPaid: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

bookingSchema.index(
    { user: 1, clientRequestId: 1 },
    {
        unique: true,
        partialFilterExpression: { clientRequestId: { $type: "string" } },
    }
);
bookingSchema.index({ room: 1, status: 1, checkInDate: 1, checkOutDate: 1 });
bookingSchema.index({ hotel: 1, createdAt: -1 });

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
