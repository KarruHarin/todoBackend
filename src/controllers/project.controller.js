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

const getProjectDetails = async(res,req)=>{

    try {
        const {projectId}=req.body;

        const project = await Project.findById(projectId).populate("todos");
        if(!project){
            throw new ApiError(400,"Project Not found")
        }
        const details = [
            {
                projectName : project.projectName,
                projectDescription:project.projectDescription,
                todos:project.todos.map((todo)=>({
                    todoId : todo.taskName,
                    taskProgress:todo.taskProgress,
                    priority:todo.priority,
                    duedate:todo.duedate,
                    asign:todo.asign
                }))
            }
        ]
        return res.status(201).json(new ApiResponse(201,details,"Project Details fetched"))

    } catch (error) {
        throw new ApiError(401,error)
        
    }



}

export  {createProject,getProjectDetails};