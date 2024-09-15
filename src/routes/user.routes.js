import { Router } from "express";
import { checking, getAllCompanies, getAllJoinedCompanies, getAllTasks, loginUser,logoutUser,refreshAccessToken,registerUser } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()
router.route("/check").post(checking)
router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.route("/logout").post(verifyJWT,logoutUser)
router.route("/refresh").post(refreshAccessToken)
router.route("/getAllCompanies").post(verifyJWT,getAllCompanies)
router.route("/getAllJoinedCompanies").post(verifyJWT,getAllJoinedCompanies)
router.route("/getAllTasks").post(verifyJWT,getAllTasks)

export default router;