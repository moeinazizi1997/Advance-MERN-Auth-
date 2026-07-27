import { ErrorRequestHandler} from "express";
import { HTTPSTATUS } from "../config/http.config";
import { AppError } from "../common/utils/AppError";

const errorHandlerMiddleware : ErrorRequestHandler = (err,req,res,next): any=>{
    console.log(`Error occured on PATH: ${req.path} and error is:`,err);

    if(err instanceof AppError){
        return res.status(err.statusCode).json({
            message : err.message,
            errorCode : err.errorCode
        })
    }

    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
        message : "Internal server error",
        error : err
    })
};

export default errorHandlerMiddleware;