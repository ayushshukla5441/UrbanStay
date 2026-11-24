import mongoose from "mongoose";
import Hotel from "../models/hotel.model.js";
import Booking from "../models/Booking.model.js";
import { withHotelBookingLock } from "../utils/roomBookingLock.js";

// 1. Register / Add a New Hotel (With Rooms support)
export const addHotel = async (req, res) => {
    try {
        const {
            name,
            propertyType,
            starRating,
            chainName,
            pricePerNight,
            ownerName,
            contactPhone,
            alternatePhone,
            email,
            address,
            amenities,
            rooms, 
            images,
            description,
            policies,
        } = req.body;

    // Basic validation check
    if (!name || !pricePerNight || !ownerName || !contactPhone || !address) {
        return res.status(400).json({
            success: false,
            message: "Please fill in all required fields",
        });
    }

    // Auth middleware (isAuthenticate) se req.user ke through owner id mil jayegi
    const ownerId = req.user?.id || req.user;

    const newHotel = new Hotel({
        name,
        propertyType,
        starRating,
        chainName,
        pricePerNight,
        ownerName,
        contactPhone,
        alternatePhone,
        email,
        owner: ownerId,
        address,
        amenities: amenities || {},
        rooms: rooms || [], // <--- Save rooms list
        images: images || [],
        description: description || "",
        policies: policies || {},
    });

    await newHotel.save();

    return res.status(201).json({
        success: true,
        message: "Hotel and rooms registered successfully!",
        hotel: newHotel,
    });
  } catch (error) {
    console.error("Register Hotel Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

// 2. Get All Hotels (For user or public listing page)
export const getAllHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find({}).sort({ createdAt: -1 });
    const counts = await Booking.aggregate([
      { $match: { status: { $in: ["pending", "confirmed"] } } },
      { $group: { _id: "$hotel", bookingCount: { $sum: 1 } } },
    ]);
    const countMap = new Map(counts.map((item) => [item._id.toString(), item.bookingCount]));
    const hotelsWithPopularity = hotels.map((hotel) => ({
      ...hotel.toObject(),
      bookingCount: countMap.get(hotel._id.toString()) || 0,
    }));
    return res.status(200).json({
      success: true,
      hotels: hotelsWithPopularity,
    });
  } catch (error) {
    console.error("Get Hotels Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: "Hotel not found",
      });
    }

    return res.status(200).json({
      success: true,
      hotel,
    });
  } catch (error) {
    console.error("Get Hotel Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// 3. Get Hotels Listed by Specific Logged-in Owner
export const getOwnerHotels = async (req, res) => {
  try {
    const ownerId = req.user?.id || req.user;
    const hotels = await Hotel.find({ owner: ownerId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      hotels,
    });
  } catch (error) {
    console.error("Get Owner Hotels Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// 4. Delete Hotel Function (Optimized & Secure)
export const deleteHotel = async (req, res) => {
  try {
    const { id } = req.params; // Hotel ID from route parameters (e.g., /api/hotel/delete/:id)
    const ownerId = req.user?.id || req.user; // Logged-in owner ID
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Hotel ID is invalid" });
    }

    const result = await withHotelBookingLock(id, async ({ hotel, lockToken }) => {
      if (hotel.owner.toString() !== ownerId.toString()) {
        return {
          status: 403,
          message: "Unauthorized: You can only delete your own hotels",
        };
      }
      if (await Booking.exists({ hotel: id })) {
        return {
          status: 409,
          message: "This property has booking history and cannot be deleted",
        };
      }
      await Hotel.findOneAndDelete({ _id: id, bookingLockToken: lockToken });
      return { status: 200 };
    });

    if (result.status !== 200) {
      return res.status(result.status).json({
        success: false,
        message: result.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Hotel deleted successfully!",
    });
  } catch (error) {
    if (Number.isInteger(error?.status)) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    console.error("Delete Hotel Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};