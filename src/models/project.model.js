import { Schema} from "mongoose";
import mongoose from "mongoose";

const projectSchema = new Schema({
   
    projectName:{
        type:String,
        required:true,
        trim:true
    },
    company:{
          type:Schema.Types.ObjectId,
          ref:"Company"
    },
    projectDescription:{
        type:String,
        default:"No Description provided"
    },
    todos:[
        {
            type:Schema.Types.ObjectId,
            ref:"Tasks"
        }
    ]

},{
    timestamps:true
})

export const Project = new mongoose.model("Project",projectSchema)