import {asyncHandler} from "../utils/asyncHandler.js"
import {APIerror} from "../utils/APIerror.js"

import {User} from "../models/users.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {APIresponse} from "../utils/APIresponse.js"

const generateAccessAndRefreshTokens = async(userId)=>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ValidateBeforeSave: false})

        return(accessToken , refreshToken)
        
    } catch (error) {
        throw new APIerror(500,"something went wrong")
    }
}
const registerUser = asyncHandler( async(req , res)=>{
   //get users details from front end
   //validation - not empty
   //check if user already exists: username or email
   //check for images and avatar
   //upload them to cloudinary, avatar
   //create user object = create entry in db 
   //remove password and refresh token field from response
   // check for user creation
   //return response


 

    const {fullName, email , username , password} = req.body
        console.log("email",email); 

       /* this is to check only one we can use this but...
       
       if(fullname ===""){
            throw new ApiError(400, "full name is required")
        }
        */
        if(
            [fullName,email,username,password].some((field)=>
        field?.trim()==="")
        ){
            throw new APIerror(400, "all fields are required")
        }

    const existedUser = User.findOne({
        $or:[{ email }, { username }]
    })
    if(existedUser){
        throw new APIerror(409,"user with email or username already exists")

    }
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverimage[0]?.path;

    if(!avatarLocalPath){
        throw new APIerror(400 ,  "Avatar file is required")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new APIerror(400 ,  "Avatar file is required")
    }

    const user =await User.create( {
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url ||"",
        email,
        password,
        username: username.toLowercase()
} )

const createdUser = await user.findById(user._id).select(
    "-password -refreshtoken"
)
if(!createdUser){
    throw new APIerror(500 ,  "something went wrong")
}

return res.status(201).json(
    new APIresponse(200, createdUser,"user registered successfully")
)

})

const loginUser =asyncHandler(async(req , res)=>{
        //data->body
        //check username or email
        //find the user
        //check for password
        //acces token and refresh token granted
        //send cookie

    const{email , username , password}=req.body 
    if (!username || !email) {
        throw new APIerror(400,"username or password is required")    
    }
    const user = await User.findOne({$or:[{username},{email}]})
    if(!user){
        throw new APIerror(404,"username DOES NOT EXIST")

    }
    //const isMatch = await bcrypt.compare(password , user.password)
    const isPasswordValid = await user.isPasswordcorrect(password)
    if(!isPasswordValid){
        throw new APIerror(401,"password is incorrect")
    }

    const {accessToken, refreshToken} = await 
    generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).
    select("-password -refreshtoken")
    
    const options ={
        httpOnly: true,
        secure: true 
    }
    return res
    .status(200)
    .cookie("refreshToken" , refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(
        new APIresponse(200,loggedInUser , "user logged in successfully")
    )
    
    
})

const logoutUser = asyncHandler(async(req , res)=>{
    User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
            },
            {
                new: true
            }
        
    )
    const options ={
        httpOnly: true,
        secure: true 
    }
    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options) 
    .json(new APIresponse(
        200,{},"user logged out"
    ))    

})

export {
    registerUser,
    loginUser, 
    logoutUser
}