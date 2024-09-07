import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Company } from "../models/company.model.js";
import { Project } from "../models/project.model.js";


const createProject = async(req,res)=>{
    try {
        const {projectName,companyId}=req.body;
        if (projectName === "") {
            throw new ApiError(400, "All fields are required"); 
        }

    const project = await Project.create({projectName})
    const createdProject = await Project.findById(project._id);

    if (!createdProject) {
        throw new ApiError(500,"Project creation failed")
    }

    const company =await Company.findById(companyId);
    company.projects.push(project._id);
    await company.save();

    return res.status(201).json(new ApiResponse(200,createdProject,"Project created successfully"))


    } catch (error) {
        throw new ApiError(401,error)
    }
}

export default createProject