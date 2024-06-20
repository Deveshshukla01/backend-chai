//-----------promise method--------------//


const asyncHandler = (requestHandler)=>{
    (req , res , next) =>{
        Promise.resolve(requestHandler(req , res , next)).catch((err)=>next(err))
    }
}

export {asyncHandler}


//------------------try catch method----------------------//
// const asyncHandler = (fn)=> async (req , res , next)=>
// {
//     try {
//         await fn(req , res , next)
        
//     } catch (error) {
//         res.status(arr.code || 500)
//         res.json({success:false , error:error.message})
        
//     }
// }

