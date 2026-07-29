import { NextFunction, Request, Response } from "express";
import { AuthService } from "./auth.service";
import { emailSchema, loginSchema, registerSchema, resetPasswordSchema, verificationEmailSchema } from "../../common/validators/auth.validator";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { HTTPSTATUS } from "../../config/http.config";
import { getAccessTokenCookieOptions, getRefreshTokenCookieOptions, setAuthenticationCookies } from "../../common/utils/cookie";
import { UnauthorizedException } from "../../common/utils/catch-error";


export class AuthController{
    private authService : AuthService;

    constructor(authService:AuthService){
        this.authService = authService;
    }

    public register = asyncHandler(
        async(req:Request,res:Response,next:NextFunction): Promise<Response>=>{
            const result = registerSchema.safeParse(req.body);

            if (!result.success) {
                return res.status(HTTPSTATUS.BAD_REQUEST).json({
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
                return res.status(HTTPSTATUS.BAD_REQUEST).json({
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
    );

    public refreshToken = asyncHandler(
        async (req:Request,res:Response,next:NextFunction):Promise<Response>=>{

            const refreshToken = req.cookies.refreshToken as string | undefined;

            if(!refreshToken){
                throw new UnauthorizedException("User not authorized");
            }

            const {accessToken,newRefreshToken} = await this.authService.refreshToken(refreshToken);

            if(newRefreshToken){
                res.cookie("resfreshToekn",newRefreshToken,getRefreshTokenCookieOptions())
            }

            return res.status(HTTPSTATUS.OK).cookie("accessToken",accessToken,getAccessTokenCookieOptions()).json({
                message : "Refresh access token successfully",
            });
        }
    );

    public verifyEmail = asyncHandler(
        async (req:Request,res:Response,next:NextFunction):Promise<Response>=>{

            const result = verificationEmailSchema.safeParse({
                ...req.body
            });

            if (!result.success) {
                return res.status(HTTPSTATUS.BAD_REQUEST).json({
                    errors: result.error.flatten().fieldErrors
                });
            };

            const validatedBody = result.data;

            await this.authService.verifyEmail(validatedBody.code);

            return res.status(HTTPSTATUS.OK).json({
                message : "Email verified successfully"
            });
        }
    );

    public forgotPassword = asyncHandler(
        async (req:Request,res:Response,next:NextFunction):Promise<Response>=>{
            const result = emailSchema.safeParse(req.body.email);

            if (!result.success) {
                return res.status(HTTPSTATUS.BAD_REQUEST).json({
                    errors: result.error.flatten().fieldErrors
                });
            };

            await this.authService.forgotPassword(result.data);

            return res.status(HTTPSTATUS.OK).json({
                message : "Password reset email was sent"
            });
        }
    );
}