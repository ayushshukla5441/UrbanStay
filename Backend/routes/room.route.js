import express from "express";
import { isAuthenticate } from "../middleware/isAuthenticated.js";
import { isOwner } from "../middleware/isOwner.js";
import { 
    addRoomToHotel, 
    getHotelRooms, 
    deleteRoom 
} from "../controllers/room.controller.js";

const roomRouter = express.Router();

// 1. Add a Room to a specific Hotel (Only Owner)
roomRouter.post("/add/:hotelId", isAuthenticate, isOwner, addRoomToHotel);

// 2. Get all rooms of a specific hotel (Public / User)
roomRouter.get("/hotel/:hotelId", getHotelRooms);

// 3. Delete a Room by Room ID (Only Hotel Owner)
roomRouter.delete("/delete/:roomId", isAuthenticate, isOwner, deleteRoom);

export default roomRouter;