import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
    hotel: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Hotel", 
        required: true 
    },
    roomType: { type: String, required: true }, // e.g. Deluxe King, Suite
    roomBedType: { type: String, default: "Queen Size Bed" },
    pricePerNight: { type: Number, required: true },
    discountPrice: { type: Number, default: 0 },
    capacity: { type: Number, required: true, default: 2 },
    maxAdults: { type: Number, default: 2 },
    maxChildren: { type: Number, default: 1 },
    totalRooms: { type: Number, required: true, default: 1 }, // Stock count
    availableRooms: { type: Number, required: true, default: 1 }, // Real-time availability
    bookingLockToken: { type: String, select: false },
    bookingLockExpiresAt: { type: Date, select: false },
    size: { type: String }, // e.g. 350 sq.ft
    roomAmenities: { type: Object, default: {} },
    description: { type: String },
    images: [{ type: String }]
}, { timestamps: true });

export default mongoose.model("Room", roomSchema);