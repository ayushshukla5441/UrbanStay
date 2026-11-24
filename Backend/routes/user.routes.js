import express from "express";

import {
  signup,
  login,
  logout,
  isAuth,
} from "../controllers/user.controller.js";

import { isAuthenticate } from "../middleware/isAuthenticated.js";

const UserRouter = express.Router();

UserRouter.post("/signup", signup);
UserRouter.post("/login", login);
UserRouter.get("/is-auth", isAuthenticate, isAuth);
UserRouter.get("/logout", isAuthenticate, logout);

export default UserRouter;

