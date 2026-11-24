import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { connectDB } from "./config/connectDB.js";
import UserRouter from "./routes/user.routes.js";
import hotelRouter from "./routes/hotel.routes.js"; 
import roomRouter from "./routes/room.route.js";
import bookingRouter from "./routes/booking.routes.js";

dotenv.config(); 
const app = express();
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

// Middleware
app.use(express.json({ limit: "1mb" }));
app.use(cors({
    origin: (origin, callback) => {
        callback(null, !origin || allowedOrigins.includes(origin));
    },
    credentials: true,
}));
app.use(cookieParser());

// Base Endpoints
app.get("/", (req, res) => {
    res.send("UrbanStay Server is running successfully!");
});
app.get("/health", (req, res) => {
    res.status(200).json({ success: true, status: "ok" });
});

// Routes
app.use("/images",express.static("uploads"));
app.use("/api/user", UserRouter);
app.use("/api/hotel", hotelRouter); 
app.use("/api/room", roomRouter);
app.use("/api/booking", bookingRouter);

const PORT = process.env.PORT || 4000;
const startServer = async () => {
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI is required");
    }
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is required");
    }
    if (process.env.NODE_ENV === "production") {
        if (!process.env.CORS_ORIGIN) {
            throw new Error("CORS_ORIGIN is required in production");
        }
        if (process.env.JWT_SECRET.length < 32) {
            throw new Error("JWT_SECRET must be at least 32 characters in production");
        }
    }

    await connectDB();
    app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server is running on port ${PORT}`);
    });
};

startServer().catch((error) => {
    console.error("Server startup failed:", error.message);
    process.exit(1);
});