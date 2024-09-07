import { Router } from "express";
import { checking, getAllCompanies, loginUser,logoutUser,refreshAccessToken,registerUser } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router()
router.route("/check").post(checking)
router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.route("/logout").post(verifyJWT,logoutUser)
router.route("/refresh").post(refreshAccessToken)
router.route("/getAllCompanies").post(verifyJWT,getAllCompanies)

export default router;