import mongoose from "mongoose";
import Booking from "../models/Booking.model.js";
import Hotel from "../models/hotel.model.js";
import Room from "../models/hotel.room.js";
import {
    withHotelBookingLock,
    withRoomBookingLock,
} from "../utils/roomBookingLock.js";

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const MAX_STAY_NIGHTS = 365;
class BookingError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

const getIndiaDate = () => {
    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(new Date());
    const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
    return `${values.year}-${values.month}-${values.day}`;
};

const parseDateOnly = (value, label) => {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        throw new BookingError(400, `${label} must use YYYY-MM-DD format`);
    }

    const date = new Date(`${value}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
        throw new BookingError(400, `${label} is not a valid calendar date`);
    }
    return date;
};

const parseStay = (checkInValue, checkOutValue) => {
    const checkInDate = parseDateOnly(checkInValue, "Check-in date");
    const checkOutDate = parseDateOnly(checkOutValue, "Check-out date");

    if (checkInValue < getIndiaDate()) {
        throw new BookingError(400, "Check-in date cannot be in the past");
    }
    if (checkOutDate <= checkInDate) {
        throw new BookingError(400, "Check-out must be after check-in");
    }

    const nightCount = (checkOutDate.getTime() - checkInDate.getTime()) / DAY_IN_MS;
    if (nightCount > MAX_STAY_NIGHTS) {
        throw new BookingError(400, `A stay cannot exceed ${MAX_STAY_NIGHTS} nights`);
    }

    return { checkInDate, checkOutDate, nightCount };
};

const parsePositiveInteger = (value, label, defaultValue, minimum = 0) => {
    const parsed = value === undefined ? defaultValue : Number(value);
    if (!Number.isSafeInteger(parsed) || parsed < minimum) {
        throw new BookingError(400, `${label} must be a whole number of at least ${minimum}`);
    }
    return parsed;
};

const parseGuestDetails = (value, persons) => {
    if (!value || typeof value !== "object") {
        throw new BookingError(400, "Lead guest details are required");
    }

    const name = String(value.name || "").trim();
    const mobile = String(value.mobile || "").replace(/\D/g, "");
    const email = String(value.email || "").trim().toLowerCase();
    const aadhaarLast4 = String(value.aadhaar || "").replace(/\D/g, "").slice(-4);

    if (name.length < 2) throw new BookingError(400, "Lead guest name is required");
    if (!/^[6-9]\d{9}$/.test(mobile)) throw new BookingError(400, "A valid 10-digit mobile number is required");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new BookingError(400, "A valid email address is required");
    if (!/^\d{12}$/.test(String(value.aadhaar || "").replace(/\D/g, ""))) {
        throw new BookingError(400, "A valid 12-digit Aadhaar number is required");
    }

    const sourceTravelers = Array.isArray(value.travelers) ? value.travelers : [];
    if (sourceTravelers.length !== persons) {
        throw new BookingError(400, "Details are required for every guest");
    }

    const travelers = sourceTravelers.map((traveler, index) => {
        const travelerName = String(traveler?.name || "").trim();
        const travelerMobile = String(traveler?.mobile || "").replace(/\D/g, "");
        const travelerAadhaar = String(traveler?.aadhaar || "").replace(/\D/g, "");
        if (travelerName.length < 2) throw new BookingError(400, `Guest ${index + 1} name is required`);
        if (!/^[6-9]\d{9}$/.test(travelerMobile)) throw new BookingError(400, `A valid mobile number is required for guest ${index + 1}`);
        if (!/^\d{12}$/.test(travelerAadhaar)) throw new BookingError(400, `A valid Aadhaar number is required for guest ${index + 1}`);
        return {
            name: travelerName,
            mobile: travelerMobile,
            aadhaarLast4: travelerAadhaar.slice(-4),
        };
    });

    return {
        name,
        mobile,
        email,
        aadhaarLast4,
        travelers,
    };
};

const parseBookingRequest = (req) => {
    const { hotelId, roomId, checkInDate, checkOutDate } = req.body || {};
    if (!hotelId || !roomId || !checkInDate || !checkOutDate) {
        throw new BookingError(400, "Hotel, room, check-in and check-out are required");
    }
    if (!mongoose.isValidObjectId(hotelId) || !mongoose.isValidObjectId(roomId)) {
        throw new BookingError(400, "Hotel or room ID is invalid");
    }

    const { checkInDate: checkIn, checkOutDate: checkOut, nightCount } =
        parseStay(checkInDate, checkOutDate);
    const roomsBooked = parsePositiveInteger(req.body.roomsBooked, "Room count", 1, 1);
    const adults = parsePositiveInteger(req.body.adults, "Adult count", 1, 1);
    const children = parsePositiveInteger(req.body.children, "Child count", 0);
    const persons = adults + children;
    if (!Number.isSafeInteger(persons)) {
        throw new BookingError(400, "Guest count is too large");
    }

    const guestDetails = parseGuestDetails(req.body.guestDetails, persons);
    const paymentMethod = String(req.body.paymentMethod || "pay at hotel").trim().toLowerCase();
    if (paymentMethod !== "pay at hotel") {
        throw new BookingError(400, "Online payment is not available yet. Choose pay at hotel.");
    }

    const clientRequestId = req.get("Idempotency-Key")?.trim();
    if (
        !clientRequestId ||
        clientRequestId.length < 8 ||
        clientRequestId.length > 128 ||
        !/^[a-zA-Z0-9._:-]+$/.test(clientRequestId)
    ) {
        throw new BookingError(400, "A valid Idempotency-Key header is required");
    }

    return {
        hotelId,
        roomId,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        nightCount,
        roomsBooked,
        adults,
        children,
        persons,
        guestDetails,
        paymentMethod,
        clientRequestId,
    };
};

const getReservedRooms = async (roomId, checkInDate, checkOutDate) => {
    const now = new Date();
    const overlappingBookings = await Booking.find({
        room: roomId,
        $or: [
            { status: { $in: ["pending", "confirmed"] } },
            {
                status: "payment_pending",
                paymentHoldExpiresAt: { $gt: now },
            },
        ],
        checkInDate: { $lt: checkOutDate },
        checkOutDate: { $gt: checkInDate },
    }).select("roomsBooked");

    return overlappingBookings.reduce(
        (total, booking) => total + (Number(booking.roomsBooked) || 1),
        0
    );
};

const withRoomLock = (roomId, operation) =>
    withRoomBookingLock(roomId, ({ room }) => operation(room));

const sameRequest = (booking, request, userId) =>
    booking.user.toString() === userId.toString() &&
    booking.hotel.toString() === request.hotelId &&
    booking.room.toString() === request.roomId &&
    booking.checkInDate.getTime() === request.checkInDate.getTime() &&
    booking.checkOutDate.getTime() === request.checkOutDate.getTime() &&
    booking.roomsBooked === request.roomsBooked &&
    booking.adults === request.adults &&
    booking.children === request.children;

const sendControllerError = (res, error, operationName) => {
    if (error instanceof BookingError || Number.isInteger(error?.status)) {
        return res.status(error.status).json({ success: false, message: error.message });
    }

    if (error?.code === 11000) {
        return res.status(409).json({
            success: false,
            message: "This booking request has already been processed.",
        });
    }

    console.error(`${operationName} Error:`, error);
    return res.status(500).json({
        success: false,
        message: "Unable to process the booking right now",
    });
};

const getPagination = (query) => {
    const page = Number(query.page || 1);
    const limit = Number(query.limit || 20);
    if (!Number.isSafeInteger(page) || page < 1 || !Number.isSafeInteger(limit) || limit < 1) {
        throw new BookingError(400, "Page and limit must be positive whole numbers");
    }
    return { page, limit: Math.min(limit, 50) };
};

export const checkRoomAvailability = async (req, res) => {
    try {
        const { roomId, checkInDate, checkOutDate } = req.query;
        if (!roomId || !mongoose.isValidObjectId(roomId)) {
            throw new BookingError(400, "A valid room ID is required");
        }

        const { checkInDate: checkIn, checkOutDate: checkOut, nightCount } =
            parseStay(checkInDate, checkOutDate);
        const roomsRequested = parsePositiveInteger(req.query.roomsBooked, "Room count", 1, 1);
        const room = await Room.findById(roomId).select("totalRooms hotel");
        if (!room) {
            throw new BookingError(404, "Room not found");
        }
        if (req.query.hotelId && !mongoose.isValidObjectId(req.query.hotelId)) {
            throw new BookingError(400, "Hotel ID is invalid");
        }
        if (req.query.hotelId && room.hotel.toString() !== req.query.hotelId) {
            throw new BookingError(400, "The selected room does not belong to this hotel");
        }
        if (!(await Hotel.exists({ _id: room.hotel }))) {
            throw new BookingError(404, "Hotel not found");
        }

        const reservedRooms = await getReservedRooms(roomId, checkIn, checkOut);
        const availableRooms = Math.max(0, Number(room.totalRooms) - reservedRooms);
        return res.status(200).json({
            success: true,
            available: availableRooms >= roomsRequested,
            availableRooms,
            roomsRequested,
            nightCount,
        });
    } catch (error) {
        return sendControllerError(res, error, "Check room availability");
    }
};

export const createBooking = async (req, res) => {
    let request;
    const userId = req.user?.id;

    try {
        if (!userId || !mongoose.isValidObjectId(userId)) {
            throw new BookingError(401, "Please log in to make a booking");
        }
        request = parseBookingRequest(req);

        const existingBooking = await Booking.findOne({
            user: userId,
            clientRequestId: request.clientRequestId,
        });
        if (existingBooking) {
            if (!sameRequest(existingBooking, request, userId)) {
                throw new BookingError(409, "This booking request key was already used for different details");
            }
            return res.status(200).json({
                success: true,
                message: "This booking request was already processed",
                booking: existingBooking,
            });
        }

        const result = await withRoomLock(request.roomId, async (room) => {
            const previousRequest = await Booking.findOne({
                user: userId,
                clientRequestId: request.clientRequestId,
            });
            if (previousRequest) {
                if (!sameRequest(previousRequest, request, userId)) {
                    throw new BookingError(409, "This booking request key was already used for different details");
                }
                return { booking: previousRequest, replayed: true };
            }

            if (room.hotel.toString() !== request.hotelId) {
                throw new BookingError(400, "The selected room does not belong to this hotel");
            }

            return withHotelBookingLock(request.hotelId, async ({ hotel }) => {
                if (Number(room.totalRooms) < request.roomsBooked) {
                    throw new BookingError(409, "The requested number of rooms is not available");
                }

                const capacity = Number(room.capacity) || 1;
                const maxAdults = Number(room.maxAdults) || capacity;
                const maxChildren = Number(room.maxChildren) || 0;
                if (
                    request.adults > maxAdults * request.roomsBooked ||
                    request.children > maxChildren * request.roomsBooked ||
                    request.persons > capacity * request.roomsBooked
                ) {
                    throw new BookingError(400, "Guest count exceeds the selected room capacity");
                }

                const reservedRooms = await getReservedRooms(
                    request.roomId,
                    request.checkInDate,
                    request.checkOutDate
                );
                const availableRooms = Number(room.totalRooms) - reservedRooms;
                if (availableRooms < request.roomsBooked) {
                    throw new BookingError(
                        409,
                        `Only ${Math.max(availableRooms, 0)} room(s) are available for the selected dates`
                    );
                }

                const listedPrice = Number(room.pricePerNight);
                const discountPrice = Number(room.discountPrice);
                const pricePerNight =
                    discountPrice > 0 && discountPrice < listedPrice ? discountPrice : listedPrice;
                if (!Number.isFinite(pricePerNight) || pricePerNight <= 0) {
                    throw new BookingError(409, "This room does not have a valid booking price");
                }

                const taxPercentage = Number(hotel.policies?.taxPercentage ?? 0);
                if (!Number.isFinite(taxPercentage) || taxPercentage < 0 || taxPercentage > 100) {
                    throw new BookingError(409, "The property's tax configuration is invalid");
                }

                const subtotal = pricePerNight * request.roomsBooked * request.nightCount;
                const taxAmount = Math.round(subtotal * taxPercentage) / 100;
                const totalPrice = Math.round((subtotal + taxAmount) * 100) / 100;
                const newBooking = await Booking.create({
                    user: userId,
                    hotel: request.hotelId,
                    room: request.roomId,
                    checkInDate: request.checkInDate,
                    checkOutDate: request.checkOutDate,
                    adults: request.adults,
                    children: request.children,
                    persons: request.persons,
                    roomsBooked: request.roomsBooked,
                    nightCount: request.nightCount,
                    pricePerNight,
                    taxPercentage,
                    taxAmount,
                    totalPrice,
                    clientRequestId: request.clientRequestId,
                    paymentMethod: request.paymentMethod,
                    guestDetails: request.guestDetails,
                    status: "pending",
                    paymentHoldExpiresAt: null,
                });
                return { booking: newBooking, replayed: false };
            });
        });

        return res.status(result.replayed ? 200 : 201).json({
            success: true,
            message: result.replayed
                ? "This booking request was already processed"
                : "Please visit the hotel to complete your booking.",
            booking: result.booking,
        });
    } catch (error) {
        if (error?.code === 11000 && request && userId) {
            try {
                const duplicate = await Booking.findOne({
                    user: userId,
                    clientRequestId: request.clientRequestId,
                });
                if (duplicate && sameRequest(duplicate, request, userId)) {
                    return res.status(200).json({
                        success: true,
                        message: "This booking request was already processed",
                        booking: duplicate,
                    });
                }
            } catch (lookupError) {
                return sendControllerError(res, lookupError, "Find duplicate booking");
            }
        }
        return sendControllerError(res, error, "Create booking");
    }
};

export const getMyBookings = async (req, res) => {
    try {
        const { page, limit } = getPagination(req.query);
        const filter = { user: req.user.id };
        const [bookings, total] = await Promise.all([
            Booking.find(filter)
                .populate("hotel", "name address images")
                .populate("room", "roomType images roomBedType")
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            Booking.countDocuments(filter),
        ]);
        return res.status(200).json({
            success: true,
            bookings,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        });
    } catch (error) {
        return sendControllerError(res, error, "Get user bookings");
    }
};

export const cancelMyBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        if (!mongoose.isValidObjectId(bookingId)) {
            throw new BookingError(400, "Booking ID is invalid");
        }

        const initialBooking = await Booking.findOne({ _id: bookingId, user: req.user.id });
        if (!initialBooking) {
            throw new BookingError(404, "Booking not found");
        }

        const cancelledBooking = await withRoomLock(initialBooking.room, async () => {
            const booking = await Booking.findOne({ _id: bookingId, user: req.user.id });
            if (!booking) {
                throw new BookingError(404, "Booking not found");
            }
            if (booking.status === "cancelled") {
                return booking;
            }
            if (!["pending", "confirmed", "payment_pending"].includes(booking.status)) {
                throw new BookingError(409, "This booking cannot be cancelled");
            }
            if (booking.checkInDate <= new Date(`${getIndiaDate()}T00:00:00.000Z`)) {
                throw new BookingError(409, "Bookings cannot be cancelled on or after check-in day");
            }
            if (booking.isPaid) {
                throw new BookingError(409, "Paid bookings require a refund review before cancellation");
            }

            booking.status = "cancelled";
            await booking.save();
            return booking;
        });

        return res.status(200).json({
            success: true,
            message: "Booking cancelled successfully",
            booking: cancelledBooking,
        });
    } catch (error) {
        return sendControllerError(res, error, "Cancel booking");
    }
};

export const getOwnerBookings = async (req, res) => {
    try {
        const { page, limit } = getPagination(req.query);
        const hotels = await Hotel.find({ owner: req.user.id }).select("_id");
        const hotelIds = hotels.map((hotel) => hotel._id);
        if (!hotelIds.length) {
            return res.status(200).json({
                success: true,
                bookings: [],
                summary: {},
                pagination: { page, limit, total: 0, pages: 0 },
            });
        }

        const filter = { hotel: { $in: hotelIds } };
        const [bookings, total, statusCounts] = await Promise.all([
            Booking.find(filter)
                .populate("hotel", "name address")
                .populate("room", "roomType totalRooms")
                .populate("user", "name email")
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            Booking.countDocuments(filter),
            Booking.aggregate([
                { $match: filter },
                { $group: { _id: "$status", count: { $sum: 1 } } },
            ]),
        ]);
        const enrichedBookings = await Promise.all(
            bookings.map(async (booking) => {
                const bookingObject = booking.toObject();
                const reservedRooms = booking.room
                    ? await getReservedRooms(
                        booking.room._id,
                        booking.checkInDate,
                        booking.checkOutDate
                    )
                    : 0;
                const totalRooms = Number(booking.room?.totalRooms) || 0;
                bookingObject.remainingRooms = Math.max(0, totalRooms - reservedRooms);
                bookingObject.reservedRooms = reservedRooms;
                bookingObject.totalRoomStock = totalRooms;
                return bookingObject;
            })
        );
        return res.status(200).json({
            success: true,
            bookings: enrichedBookings,
            summary: Object.fromEntries(
                statusCounts.map((item) => [item._id || "unknown", item.count])
            ),
            pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        });
    } catch (error) {
        return sendControllerError(res, error, "Get owner bookings");
    }
};

export const updateOwnerBookingStatus = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { status } = req.body || {};
        if (!mongoose.isValidObjectId(bookingId)) {
            throw new BookingError(400, "Booking ID is invalid");
        }
        if (!["confirmed", "cancelled"].includes(status)) {
            throw new BookingError(400, "Status must be confirmed or cancelled");
        }

        const initialBooking = await Booking.findById(bookingId).populate("hotel", "owner");
        if (!initialBooking) {
            throw new BookingError(404, "Booking not found");
        }
        if (initialBooking.hotel?.owner?.toString() !== req.user.id) {
            throw new BookingError(403, "You can only manage bookings for your own properties");
        }

        const updatedBooking = await withRoomLock(initialBooking.room, async () => {
            const booking = await Booking.findById(bookingId).populate("hotel", "owner");
            if (!booking) {
                throw new BookingError(404, "Booking not found");
            }
            if (booking.hotel?.owner?.toString() !== req.user.id) {
                throw new BookingError(403, "You can only manage bookings for your own properties");
            }
            if (booking.status === "cancelled") {
                throw new BookingError(409, "Cancelled bookings cannot be changed");
            }
            if (status === "confirmed") {
                booking.status = "confirmed";
            } else {
                if (booking.checkInDate <= new Date(`${getIndiaDate()}T00:00:00.000Z`)) {
                    throw new BookingError(409, "Bookings cannot be cancelled on or after check-in day");
                }
                if (booking.isPaid) {
                    throw new BookingError(409, "Paid bookings require a refund review before cancellation");
                }
                booking.status = "cancelled";
            }
            await booking.save();
            return booking;
        });

        return res.status(200).json({
            success: true,
            message: `Booking ${status} successfully`,
            booking: updatedBooking,
        });
    } catch (error) {
        return sendControllerError(res, error, "Update owner booking");
    }
};
