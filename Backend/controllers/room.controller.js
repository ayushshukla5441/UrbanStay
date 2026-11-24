import mongoose from "mongoose";
import Room from "../models/hotel.room.js";
import Hotel from "../models/hotel.model.js";
import Booking from "../models/Booking.model.js";
import { withRoomBookingLock } from "../utils/roomBookingLock.js";

export const addRoomToHotel = async (req, res) => {
    try {
        const { hotelId } = req.params;
        const {
            roomType,
            roomBedType,
            pricePerNight,
            discountPrice,
            capacity,
            maxAdults,
            maxChildren,
            totalRooms,
            size,
            roomAmenities,
            description,
            images,
        } = req.body;

        if (!mongoose.isValidObjectId(hotelId)) {
            return res.status(400).json({ success: false, message: "Hotel ID is invalid" });
        }

        const hotel = await Hotel.findById(hotelId);
        if (!hotel) {
            return res.status(404).json({ success: false, message: "Hotel not found" });
        }

        const ownerId = req.user?.id || req.user;
        if (hotel.owner.toString() !== ownerId.toString()) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized: You can only add rooms to your own hotels",
            });
        }

        const parsedPrice = Number(pricePerNight);
        const parsedRooms = Number(totalRooms);
        if (
            typeof roomType !== "string" ||
            !roomType.trim() ||
            !Number.isFinite(parsedPrice) ||
            parsedPrice <= 0 ||
            !Number.isSafeInteger(parsedRooms) ||
            parsedRooms < 1
        ) {
            return res.status(400).json({
                success: false,
                message: "Room type, a positive nightly price, and a valid room count are required",
            });
        }

        const newRoom = new Room({
            hotel: hotelId,
            roomType: roomType.trim(),
            roomBedType: roomBedType || "Queen Size Bed",
            pricePerNight: parsedPrice,
            discountPrice: Number(discountPrice) || 0,
            capacity: Number(capacity) || 2,
            maxAdults: Number(maxAdults) || 2,
            maxChildren: Number(maxChildren) || 1,
            totalRooms: parsedRooms,
            availableRooms: parsedRooms,
            size: size || "",
            roomAmenities: roomAmenities || {},
            description: description || "",
            images: Array.isArray(images) ? images : [],
        });

        await newRoom.save();
        hotel.rooms.push(newRoom._id);
        await hotel.save();

        return res.status(201).json({
            success: true,
            message: "Room category added successfully",
            room: newRoom,
        });
    } catch (error) {
        console.error("Add Room Error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to add this room right now",
        });
    }
};

export const getHotelRooms = async (req, res) => {
    try {
        const { hotelId } = req.params;
        if (!mongoose.isValidObjectId(hotelId)) {
            return res.status(400).json({ success: false, message: "Hotel ID is invalid" });
        }

        const rooms = await Room.find({ hotel: hotelId });
        return res.status(200).json({ success: true, rooms });
    } catch (error) {
        console.error("Get Hotel Rooms Error:", error);
        return res.status(500).json({ success: false, message: "Unable to load rooms" });
    }
};

export const deleteRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        if (!mongoose.isValidObjectId(roomId)) {
            return res.status(400).json({ success: false, message: "Room ID is invalid" });
        }

        const ownerId = req.user?.id || req.user;
        const result = await withRoomBookingLock(
            roomId,
            async ({ room, lockToken }) => {
                const hotel = await Hotel.findById(room.hotel);
                if (!hotel) {
                    return { status: 404, message: "Associated hotel not found" };
                }
                if (hotel.owner.toString() !== ownerId.toString()) {
                    return {
                        status: 403,
                        message: "Unauthorized: You can only delete rooms from your own properties",
                    };
                }
                if (await Booking.exists({ room: roomId })) {
                    return {
                        status: 409,
                        message: "This room has booking history and cannot be deleted",
                    };
                }

                hotel.rooms = hotel.rooms.filter((id) => id.toString() !== roomId);
                await hotel.save();
                await Room.findOneAndDelete({ _id: roomId, bookingLockToken: lockToken });
                return { status: 200 };
            }
        );

        if (result.status !== 200) {
            return res.status(result.status).json({
                success: false,
                message: result.message,
            });
        }

        return res.status(200).json({
            success: true,
            message: "Room deleted successfully",
        });
    } catch (error) {
        if (Number.isInteger(error?.status)) {
            return res.status(error.status).json({ success: false, message: error.message });
        }
        console.error("Delete Room Error:", error);
        return res.status(500).json({ success: false, message: "Unable to delete this room" });
    }
};
