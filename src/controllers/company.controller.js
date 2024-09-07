import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Company } from "../models/company.model.js";
import { User } from "../models/user.model.js";
import jwt from 'jsonwebtoken';

const createCompany=async(req,res)=>{
    try {
        const {companyName}=req.body;
        if (companyName==="") {
            throw new ApiError(400, "All fields are required"); 
        }
       
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let companyCode = '';
            const charactersLength = characters.length;
            for (let i = 0; i < 6; i++) {
                companyCode+= characters.charAt(Math.floor(Math.random() * charactersLength));
            }
        const company = await Company.create({companyName,companyCode})
        const createdCompany = await Company.findById(company._id)
        if (!createdCompany) {
            throw new ApiError(500,"Company creation failed")
        }

        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            console.log("Token ivvu ra lucha");
           return ;
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id)

        user.company.push(company._id);
        await user.save();



        return res.status(201).json(new ApiResponse(200,createdCompany,"Company created successfully"))


    } catch (error) {
        throw new ApiError(401,error)
    }
}

const joinCompany = async (req, res) => {
  try {
    const { companyCode } = req.body;

    // Validate input
    if (!companyCode) {
      return res.status(400).json(new ApiResponse(400, null, "Company code is required"));
    }

    // Find the company by code
    const company = await Company.findOne({ companyCode });
    if (!company) {
      return res.status(404).json(new ApiResponse(404, null, "No company found for the given code"));
    }

    // Check for token
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json(new ApiResponse(401, null, "Authorization token is missing"));
    }

    // Verify the token
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (err) {
      return res.status(401).json(new ApiResponse(401, null, "Invalid or expired token"));
    }

    // Add user to the company
    if (!company.workers.includes(decodedToken._id)) {
      company.workers.push(decodedToken._id);
      await company.save();
    }

    return res.status(200).json(new ApiResponse(200, company, "Successfully joined the company"));
  } catch (error) {
    console.error(error);
    return res.status(500).json(new ApiResponse(500, null, "Internal Server Error"));
  }
};

const getAllWorkers = async (req,res)=>{
  const {companyId}=req.body;
  const company = await Company.findById(companyId).populate("workers");
  if (!company) {
    throw new ApiError(400, "Company not found");
  }

  const UserDetails = company.workers.map(worker => ({
    id: worker._id.toString(),
    name: worker.name
  }));
  
  return res.status(201).json(new ApiResponse(201,UserDetails,"results fetched"))
}

const getCompanyDetails = async(req,res)=>{
  try {
    const {companyId}=req.body;
    const company =await Company.findById(companyId).populate("projects");
    if (!company) {
      throw new ApiError(400, "Company not found");
    }
    const Details = [
      {
        companyName : company.companyName,
        companyCode : company.companyCode,
        projects    : company.projects.map(project=>({
          projectId : project._id,
          projectName:project.projectName,
          projectDescription:project.projectDescription
        }))
      }
    ]

    return res.status(201).json(new ApiResponse(201,Details,"DetailsFetched"))
  } catch (error) {
    console.log(error);
  }
}

export {joinCompany,createCompany,getAllWorkers,getCompanyDetails}