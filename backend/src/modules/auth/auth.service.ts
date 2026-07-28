import { LoginDto, RegisterDto } from "../../common/interfaces/auth.interface";
import UserModel from "../../database/models/user.model";
import { BadRequestException } from "../../common/utils/catch-error";
import { ErrorCode } from "../../common/enums/errorCode.enums";
import VerificationCodeModel from "../../database/models/verification.model";
import { verificationCodeEnum } from "../../common/enums/verification-code.enum";
import { fortyFiveMinutesFromNow } from "../../common/utils/date-time";
import SessionModel from "../../database/models/session.model";
import jwt from "jsonwebtoken";
import { config } from "../../config/app.config";

export class AuthService {
    public async register (registerData : RegisterDto){
        const {name, email, password} = registerData;
        
        const existingUser = await UserModel.exists({email});

        if(existingUser){
            throw new BadRequestException("User already exists",ErrorCode.AUTH_EMAIL_ALREADY_EXISTS);
        }

        const newUser = await UserModel.create({
            name,email,password
        });

        const userId = newUser._id;

        const verificationCode = await VerificationCodeModel.create({
            userId,
            type : verificationCodeEnum.EMAIL_VERIFICATION,
            expiresAt : fortyFiveMinutesFromNow()
        });

        // Sending verification email link

        return {
            user : newUser,
        }
    }

    public async login(loginData : LoginDto){
        const {email,password,userAgent} = loginData;

        const user = await UserModel.findOne({
            email
        });

        if(!user){
            throw new BadRequestException("Invalid email or password provided",ErrorCode.AUTH_USER_NOT_FOUND)
        }

        const isPasswordValid = await user.comparePassword(password);

        if(!isPasswordValid){
            throw new BadRequestException("Invalid email or password provided",ErrorCode.AUTH_USER_NOT_FOUND)
        }

        // Check if the user enabled 2fa

        const session = await SessionModel.create({
            userId : user._id.toString(),
            userAgent
        });

        const accessToken = jwt.sign(
            {userId : user._id.toString(), sessionId : session._id.toString()},
            config.JWT.JWT_ACCESS_TOKEN_SECRET,
            {
                audience : ["user"],
                expiresIn : config.JWT.JWT_ACCESS_TOKEN_EXPIRES_IN as jwt.SignOptions["expiresIn"]
            }
        );

        const refreshToken = jwt.sign(
            {sessionId : session._id.toString()},
            config.JWT.JWT_REFRESH_TOKEN_SECRET,
            {
                audience : ["user"],
                expiresIn : config.JWT.JWT_REFRESH_TOKEN_EXPIRES_IN as jwt.SignOptions["expiresIn"]
            }
        );

        return {
            user,
            accessToken,
            refreshToken,
            mfaRequired : false
        }
    }
}