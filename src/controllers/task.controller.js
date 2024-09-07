import { Company } from "../models/company.model.js";
import { Project } from "../models/project.model.js";
import { Task } from "../models/task.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createTaskAndAssign = async (req, res) => {
  try {
    const { taskName, projectId, userId, taskProgress, priority, dueDate } = req.body;
    
    const project = await Project.findById(projectId);
    if (!project) {
      throw new ApiError(400, "No project found");
    }

    const companyId = project.company;
    const company = await Company.findById(companyId).populate("workers");
    if (!company) {
      throw new ApiError(400, "Company not found");
    }

    const validUserIds = company.workers.map(worker => worker._id.toString());
    if (!validUserIds.includes(userId.toString())) {
      throw new ApiError(400, "Invalid user for the company");
    }

    const task = await Task.create({
      taskName,
      userId,
      taskProgress: taskProgress || 1,
      priority: priority || 2,
      dueDate,
      assign: userId
    });

    project.todos.push(task._id); // Assuming 'todos' is the correct field
    await project.save();

    return res.status(201).json(new ApiResponse(201, task, "Task created successfully"));
  } catch (error) {
    console.log(error);
    return res.status(500).json(new ApiError(500, "Internal Server Error"));
  }
};

export  {createTaskAndAssign};