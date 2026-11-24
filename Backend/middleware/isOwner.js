import User from "../models/user.model.js";

export const isOwner = async (req, res, next) => {
    try {
        if (!req.user?.id) {
            return res.status(401).json({ message: "Unauthorized", success: false });
        }

        const user = await User.findById(req.user.id).select("role");
        if (!user || user.role !== "owner") {
            return res.status(403).json({
                message: "Owner access required",
                success: false,
            });
        }

        req.user.role = "owner";
        next();
    } catch (error) {
        console.error("Owner authorization Error:", error);
        return res.status(401).json({ message: "Unauthorized", success: false });
    }
};