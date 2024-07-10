import { APIerror } from "../utils/APIerror.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import  Jwt  from "jsonwebtoken";
import { User } from "../models/users.model.js";
export const verifyJWT = asyncHandler(async(req , res , next)=>{
        
        try {
            const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");
            if(!token) {
                throw new APIerror(401,"Unauthorized request")
            }
            
            
            const decodedToken = Jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
            const user = await User.findById(decodedToken?._id).select( "-password -refreshToken" )
            
            if(!user) {
                throw new APIerror(401,"INVALID ACCESS TOKEN")
            }
    
            req.user = user;
            next()
    
        } catch (error) {
            throw new APIerror(401,error?.message || " invalid access token")
            
        }


    })