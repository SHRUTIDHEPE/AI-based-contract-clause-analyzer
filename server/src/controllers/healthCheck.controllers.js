import { apiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// job of asyncHandler is to wrap everything inside the promise so that errors could be handled better 

const healthCheck = asyncHandler( async (req,res)=>{    // // this async is for handling db connections directly here if there is a db call or some async request
    return res
        .status(200)
        .json(new apiResponse(200, "OK", "Health check passed"))
} )

export {healthCheck}