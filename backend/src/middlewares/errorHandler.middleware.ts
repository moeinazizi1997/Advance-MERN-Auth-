import { ErrorRequestHandler} from "express";
import { HTTPSTATUS } from "../config/http.config";
import { AppError } from "../common/utils/AppError";
import { ZodError } from "zod";

const errorHandlerMiddleware : ErrorRequestHandler = (err,req,res,next): any=>{
    console.log(`Error occured on PATH: ${req.path} and error is:`,err.message);

    if(err instanceof AppError){
        return res.status(err.statusCode).json({
            message : err.message,
            errorCode : err.errorCode
        })
    };

    if (err instanceof ZodError) {
        return res.status(HTTPSTATUS.BAD_REQUEST).json({
        message: "Validation failed",
        errors: err.flatten().fieldErrors,
        });
    }

    return res.status(HTTPSTATUS.INTERNAL_SERVER_ERROR).json({
        message : "Internal server error",
        error : err
    })
};

export default errorHandlerMiddleware;