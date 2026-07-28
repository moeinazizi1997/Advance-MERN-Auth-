import { NextFunction, Request, Response } from "express";
import { AuthService } from "./auth.service";
import { registerSchema } from "../../common/validators/auth.validator";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { HTTPSTATUS } from "../../config/http.config";


export class AuthController{
    private authService : AuthService;

    constructor(authService:AuthService){
        this.authService = authService;
    }

    public register = asyncHandler(
        async(req:Request,res:Response,next:NextFunction): Promise<any>=>{
            const result = registerSchema.safeParse(req.body);

            if (!result.success) {
                return res.status(400).json({
                    errors: result.error.flatten().fieldErrors
                });
            };

            const validatedBody = result.data;
            const {user} = await this.authService.register(validatedBody);

            return res.status(HTTPSTATUS.CREATED).json({
                message : "User registered successfully",
                data : user
            });
        }
    )
}