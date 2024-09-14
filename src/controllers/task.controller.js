import { response } from "express";
import { Company } from "../models/company.model.js";
import { Project } from "../models/project.model.js";
import { Task } from "../models/task.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";


const createTaskAndAssign = async (req, res) => {
  try {
    const { taskName, projectId, userId, taskProgress, priority, dueDate,companyId } = req.body;
    
    const project = await Project.findById(projectId);
    if (!project) {
      throw new ApiError(400, "No project found");
    }

    // const companyId = project.company;
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
      asign: userId
    });

    const assignedUser = await User.findById(userId);
    assignedUser.tasks.push(task._id);

    await assignedUser.save();

    project.todos.push(task._id); // Assuming 'todos' is the correct field
    await project.save();

    return res.status(201).json(new ApiResponse(201, task, "Task created successfully"));
  } catch (error) {
    console.log(error);
    return res.status(500).json(new ApiError(500, "Internal Server Error"));
  }
};

const deleteTask = async(req,res)=>{

  try {
    const {taskId} = req.body;

    const deletingTask = await Task.deleteOne({_id : taskId});
    if(deletingTask.deletedCount==0){
      return res.status(404).json({ message: "Task not found" });
    }
    return res.status(201).json(new ApiResponse(200,{},"Task deleted successfully"))
  } catch (error) {
    console.log("Problem in deleting project :" ,error);
  }


}
const editTask = async(req,res)=>{
  try {
    const {taskId,taskName,priority,asign,progress,dueDate}=req.body;
    console.log(req.body);
    let task1 = await Task.findById(taskId)
    console.log(task1);
    
    if(!task1){
      return  res.status(404).json({ message: "Task not found" });
    }
    task1.taskName = taskName|| task1.taskName;
    task1.priority = priority || task1.priority;
    task1.asign = asign || task1.asign;
    task1.taskProgress = progress|| task1.taskProgress;
    task1.dueDate = dueDate || task1.dueDate;


    const updatedTask = await task1.save();
    return res.status(201).json(new ApiResponse(200,updatedTask,"Task updated successfully"))

  } catch (error) {
    console.error("Problem in editing Task:", error);
    
  }
}




export  {createTaskAndAssign,editTask,deleteTask};