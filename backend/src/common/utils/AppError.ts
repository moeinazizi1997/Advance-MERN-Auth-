import { HTTPSTATUS, HttpStatusCode } from "../../config/http.config";
import { ErrorCode } from "../enums/errorCode.enums";

export class AppError extends Error{
    public statusCode : HttpStatusCode;
    public errorCode? : ErrorCode;

    constructor(message:string,statusCode:number=HTTPSTATUS.INTERNAL_SERVER_ERROR,errorCode? : ErrorCode){
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;

        Error.captureStackTrace(this,this.constructor);
    }
};