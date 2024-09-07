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

const deleteTask = async(req,res)=>{

  try {
    const {taskId} = req.body;

    const deletingTask = await Task.deleteOne({taskId});
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
    const {taskId,taskName,taskDescription}=req.body;

    let task1 = await Task.findById({taskId})
    if(!task1){
      return  res.status(404).json({ message: "Task not found" });
    }
    task1.taskName = task1.taskName || taskName;
    task1.taskDescription = task1.taskDescription || taskDescription;
    const updatedTask = await task1.save();
    return res.status(201).json(new ApiResponse(200,updatedTask,"Task updated successfully"))

  } catch (error) {
    console.error("Problem in editing Task:", error);
    
  }
}

const editPriority = async(req,res)=>{

  try {
    const {taskId,priority} = req.body;

    let task1 = await Task.findById({taskId})

    if(!task1){
      return  res.status(404).json({ message: "Task not found" });
    }

    task1.priority = priority || task1.priority;

    const updatedTask = await task1.save();

    return res.status(201).json(new ApiResponse(200,updatedTask,"Task updated successfully"))


    
  } catch (error) {
    console.error("Problem in editing Task:", error);

    
  }
}

const editAsign = async (req,res)=>{

  try {
    const {taskId,memberId} = req.body;

    let task1 = await Task.findById({taskId})

    if(!task1){
      return  res.status(404).json({ message: "Task not found" });
    }

    task1.asign = memberId || task1.asign;

    const hi = await task1.save();


    return res.status(201).json(new ApiResponse(200,hi,"Task updated successfully"))


    
  } catch (error) {
    console.error("Problem in editing Task:", error);

    
  }

}


const editProgress = async(req,res)=>{
  try {
    const {taskId,progress} = req.body;

    let task1 = await Task.findById({taskId})

    if(!task1){
      return  res.status(404).json({ message: "Task not found" });
    }

    task1.taskProgress = progress || task1.taskProgress;

    const hi = await task1.save();


    return res.status(201).json(new ApiResponse(200,hi,"Task updated successfully"))

    
  } catch (error) {
    console.error("Problem in editing Task:", error);
    
  }
}


const editDate = async(req,res)=>{
  try {
    const {taskId,duedate} = req.body;

    let task1 = await Task.findById({taskId})

    if(!task1){
      return  res.status(404).json({ message: "Task not found" });
    }

    task1.dueDate = duedate || task1.dueDate;

    const hi = await task1.save();


    return res.status(201).json(new ApiResponse(200,hi,"Task updated successfully"))

    
  } catch (error) {
    console.error("Problem in editing Task:", error);
    
  }
}


export  {createTaskAndAssign,editTask,editPriority,editAsign,editProgress,editDate};