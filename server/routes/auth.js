import { Router } from "express";
import { signup, login, oauthLogin, logout, getMe } from "../controllers/authController.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/oauth", oauthLogin);
router.post("/logout", logout);
router.get("/me", getMe);

export default router;
