import mongoose, { Schema } from "mongoose";

const companySchema = new Schema({
    
    companyName:{
        type:String,
        required:true,
        trim:true
    },
   
    companyCode:{
        type:String,
        required:true,
    },

    workers:[
        {
            type:Schema.Types.ObjectId,
            ref:"User"
        }     
    ],

    projects:[
        {
            type:Schema.Types.ObjectId,
            ref:"Projects"
        }
    ]
},{timestamps:true});




export const Company = mongoose.model("Company",companySchema)