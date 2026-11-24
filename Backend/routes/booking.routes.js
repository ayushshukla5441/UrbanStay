import express from "express";
import {
    cancelMyBooking,
    checkRoomAvailability,
    createBooking,
    getMyBookings,
    getOwnerBookings,
    updateOwnerBookingStatus,
} from "../controllers/booking.controller.js";
import { isAuthenticate } from "../middleware/isAuthenticated.js";
import { isOwner } from "../middleware/isOwner.js";

const bookingRouter = express.Router();

bookingRouter.get("/availability", checkRoomAvailability);
bookingRouter.post("/create", isAuthenticate, createBooking);
bookingRouter.get("/my-bookings", isAuthenticate, getMyBookings);
bookingRouter.patch("/:bookingId/cancel", isAuthenticate, cancelMyBooking);
bookingRouter.get("/owner-bookings", isAuthenticate, isOwner, getOwnerBookings);
bookingRouter.patch(
    "/:bookingId/status",
    isAuthenticate,
    isOwner,
    updateOwnerBookingStatus
);

export default bookingRouter;
