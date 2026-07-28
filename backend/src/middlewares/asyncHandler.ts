import { NextFunction, Request, Response } from "express"

type AsyncControllerType = (req:Request,res:Response,next:NextFunction)=> Promise<void | Response>

export const asyncHandler = (controller:AsyncControllerType):AsyncControllerType=>{
    return async (req,res,next)=>{
        try{
            return await controller(req,res,next)
        }catch(err){
            next(err);
        }
    }
};