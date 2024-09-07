import { Router } from "express";
import {createCompany, getCompanyDetails} from "../controllers/company.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {createProject,getProjectDetails} from "../controllers/project.controller.js";
import createTaskAndAssign from "../controllers/task.controller.js";

const router = Router()
router.route("/createCompany").post(createCompany);
router.route("/createProject").post(verifyJWT,createProject);
router.route("/getCompanyDetails").post(verifyJWT,getCompanyDetails)
router.route("/createTaskAndAssign").post(createTaskAndAssign)
router.route("/company/:projectId").post(getProjectDetails)


export default router;