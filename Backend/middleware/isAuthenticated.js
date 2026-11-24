import jwt from "jsonwebtoken";

export const isAuthenticate = (req, res, next) => {
  try {
    const { token } = req.cookies; // FIX: Destructure token from req.cookies
    if (!token) {
      return res.status(401).json({ message: "Unauthorized", success: false });
    }
    
    // FIX: Fixed comma to dot in process.env.JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Contains id and role
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized", success: false });
  }
};