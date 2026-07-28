import { NextFunction, Request, Response } from "express";
import { AuthService } from "./auth.service";
import { loginSchema, registerSchema } from "../../common/validators/auth.validator";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { HTTPSTATUS } from "../../config/http.config";
import { setAuthenticationCookies } from "../../common/utils/cookie";


export class AuthController{
    private authService : AuthService;

    constructor(authService:AuthService){
        this.authService = authService;
    }

    public register = asyncHandler(
        async(req:Request,res:Response,next:NextFunction): Promise<Response>=>{
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

    public login = asyncHandler(
        async(req:Request,res:Response,next:NextFunction):Promise<Response>=>{
            const userAgent = req.headers["user-agent"]
            const result = loginSchema.safeParse({
                ...req.body,
                userAgent
            });
            if (!result.success) {
                return res.status(400).json({
                    errors: result.error.flatten().fieldErrors
                });
            };

            const validatedBody = result.data;
            const {user,accessToken,refreshToken,mfaRequired} = await this.authService.login(validatedBody);

            const response = setAuthenticationCookies({res,accessToken,refreshToken});

            return response.status(HTTPSTATUS.OK).json({
                message : "User loggend-in successfully",
                data : user,
                mfaRequired
            });
        }
    )
}