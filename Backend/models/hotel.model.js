import mongoose from "mongoose";

const hotelSchema = new mongoose.Schema({
    name: { type: String, required: true },
    propertyType: { type: String, default: "Hotel" },
    starRating: { type: Number, default: 3 },
    chainName: { type: String },
    pricePerNight: { type: Number, required: true }, // Starting / Base Price
    ownerName: { type: String, required: true },
    contactPhone: { type: String, required: true },
    alternatePhone: { type: String },
    email: { type: String, required: true },
    website: { type: String },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    address: {
        street: { type: String, required: true },
        landmark: { type: String },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true },
        country: { type: String, default: "India" },
        coordinates: {
            lat: { type: Number },
            lng: { type: Number }
        }
    },
    amenities: { type: Object, default: {} },
    rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: "Room" }], // <--- Room References
    images: [{ type: String }],
    bookingLockToken: { type: String, select: false },
    bookingLockExpiresAt: { type: Date, select: false },
    description: { type: String, required: true },
    policies: {
        houseRules: { type: String },
        cancellationPolicy: { type: String },
        taxPercentage: { type: Number, default: 12 }
    }
}, { timestamps: true });

export default mongoose.model("Hotel", hotelSchema);