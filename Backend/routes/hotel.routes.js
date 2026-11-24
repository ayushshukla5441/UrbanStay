import express from "express";
import { isAuthenticate } from "../middleware/isAuthenticated.js";
import { isOwner } from "../middleware/isOwner.js";
import { 
    addHotel, 
    getAllHotels, 
    getHotelById,
    getOwnerHotels, 
    deleteHotel 
} from "../controllers/hotel.controller.js";
import { upload } from "../config/multer.js";

const hotelRouter = express.Router();

// 1. Register / Add a New Hotel (Endpoint changed to /add to match frontend)
hotelRouter.post(
    "/add",
    upload.array("images", 5), 
    isAuthenticate,
    isOwner,
    addHotel
);

// 2. Get All Hotels (Public route for listing page)
hotelRouter.get("/all", getAllHotels);

// 3. Get Logged-in Owner's Hotels
hotelRouter.get("/owner-hotels", isAuthenticate, isOwner, getOwnerHotels);

// 4. Delete Hotel By ID
hotelRouter.delete("/delete/:id", isAuthenticate, isOwner, deleteHotel);

// 5. Get a single hotel with its public details
hotelRouter.get("/:id", getHotelById);

export default hotelRouter;