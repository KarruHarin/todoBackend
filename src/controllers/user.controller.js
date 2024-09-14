import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, error.message);
  }
};

const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate input fields
    if ([username, email, password].some((field) => !field?.trim())) {
      throw new ApiError(400, "All fields are required");
    }

    // Check if user already exists
    const existedUser = await User.findOne({ email });
    if (existedUser) {
      throw new ApiError(400, "User already exists");
    }

    // Create new user
    const user = await User.create({ username, email, password });

    // Retrieve created user without sensitive information
    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    if (!createdUser) {
      throw new ApiError(500, "User creation failed");
    }

    return res
      .status(201)
      .json(new ApiResponse(200, createdUser, "User registered successfully"));
  } catch (error) {
    return res.status(error.statusCode || 400).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input fields
    if (!email || !password) {
      throw new ApiError(400, "Email and password are required");
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Check if password is correct
    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
      throw new ApiError(401, "Incorrect password");
    }

    // Generate access and refresh tokens
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );

    // Retrieve logged-in user without sensitive information
    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    // Cookie options
    const cookieOptions = {
      httpOnly: true,
      secure:false,
      
    };
    

    // Set access token cookie
    res.cookie("accessToken", accessToken,cookieOptions);

    // Set refresh token cookie
    res.cookie("refreshToken", refreshToken,cookieOptions);
    

    // Respond with user data and tokens
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { user: loggedInUser, accessToken, refreshToken },
          "User logged in successfully"
        )
      );
  } catch (error) {
    return res.status(error.statusCode || 400).json({ message: error.message });
  }
};

const logoutUser = async (req, res) => {
  try {
    await User.findByIdAndUpdate(
      req.user._id,
      { refreshToken: undefined },
      { new: true }
    );

 

    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponse(200, {}, "User logged out successfully"));
  } catch (error) {
    return res.status(500).json({ message: "Logout failed" });
  }
};

const refreshAccessToken = async (req, res) => {
  try {
    const incomingRefreshToken =
      req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
      throw new ApiError(401, "Unauthorized request");
    }

    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or invalid");
    }

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
    };

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken },
          "Access token refreshed successfully"
        )
      );
  } catch (error) {
    return res.status(error.statusCode || 401).json({ message: error.message });
  }
};

const checking = async (req, res) => {
  try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(400).json(new ApiResponse(400, {}, "No token provided"));
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id);
    
    if (!user) {
      return res.status(401).json(new ApiError(401, "No user found"));
    }

    return res.status(200).json(new ApiResponse(200, user, "Check completed"));
  } catch (error) {
    console.error(error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).send("Invalid token");
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).send("Token expired");
    }
    return res.status(500).send("Internal Server Error");
  }
};

const getAllCompanies = async(req,res) => {
  try {
    const {userId}=req.body;
    const user = await User.findById(userId).populate("company")
    if (!user) {
      throw new ApiError(400,"User Not Found")
    }

    const CompanyDetails = user.company.map(company=>({
      id : company._id.toString(),
      name:company.companyName
    }))

    return res.status(201).json(new ApiResponse(201,CompanyDetails,"results fetched"))
    
  } catch (error) {
    console.log(error);
  }
}

const getAllTasks = async (req,res)=>{
  try {
    const {userId}=req.body;
    const user = await User.findById(userId).populate("tasks")
    if (!user) {
      throw new ApiError(400,"User Not Found")
    }
    const TaskDetails = user.tasks.map(task=>({
      id:task._id.toString(),
      name:task.taskName,
      priority:task.priority,
      progress:task.taskProgress,
      dueDate:task.dueDate
    }))
    return res.status(201).json(new ApiResponse(201,TaskDetails,"Task fetch successfull"))
  } catch (error) {
    console.log("Error in fetching tasks of user",error);
  }
}

export {
  registerUser,
  loginUser,
  generateAccessAndRefreshToken,
  logoutUser,
  refreshAccessToken,
  checking,
  getAllCompanies,
  getAllTasks
};
