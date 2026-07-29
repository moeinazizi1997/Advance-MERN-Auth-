import { LoginDto, RegisterDto } from "../../common/interfaces/auth.interface";
import UserModel from "../../database/models/user.model";
import { BadRequestException, HttpException, NotFoundException, UnauthorizedException } from "../../common/utils/catch-error";
import { ErrorCode } from "../../common/enums/errorCode.enums";
import VerificationCodeModel from "../../database/models/verification.model";
import { verificationCodeEnum } from "../../common/enums/verification-code.enum";
import { anHourFromNow, calculateExpirationDate, fortyFiveMinutesFromNow, ONE_DAY_IN_MS, threeMinutesAgo } from "../../common/utils/date-time";
import SessionModel from "../../database/models/session.model";
import { RefreshTokenPayloadType, refreshTokenSignOptions, signJWTToken, verifyJWTToken } from "../../common/utils/jwt";
import { config } from "../../config/app.config";
import { sendResetLink, sendVerificationCode } from "../../common/utils/OTP";
import { HTTPSTATUS } from "../../config/http.config";

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

        await sendVerificationCode(name,email,"user-activation-mail",verificationCode.code);

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

        const accessToken = signJWTToken(
            {userId : user._id, sessionId : session._id}
        );

        const refreshToken = signJWTToken(
            {sessionId : session._id},
             refreshTokenSignOptions
        )

        return {
            user,
            accessToken,
            refreshToken,
            mfaRequired : false
        }
    }

    public async refreshToken(refreshToken : string){
        const {payload} = verifyJWTToken<RefreshTokenPayloadType>(refreshToken,{
            secret : refreshTokenSignOptions.secret
        });

        if(!payload){
            throw new UnauthorizedException("Invalid refresh token!");
        }

        const session = await SessionModel.findById(payload.sessionId);

        if(!session){
            throw new UnauthorizedException("Session does not exist");
        }

        const now = Date.now();

        if(session.expiredAt.getTime() <= now){
            throw new UnauthorizedException("Session expired!");
        }

        const sessionRequireRefresh = session.expiredAt.getTime() - now <= ONE_DAY_IN_MS;

        if(sessionRequireRefresh){
            session.expiredAt = calculateExpirationDate(config.JWT.JWT_REFRESH_TOKEN_EXPIRES_IN);
            await session.save();
        }

        const newRefreshToken = sessionRequireRefresh ? signJWTToken(
            {sessionId : session._id},
             refreshTokenSignOptions
        ) : undefined;

        const accessToken = signJWTToken(
            {userId : session.userId, sessionId : session._id}
        );

        return {
            accessToken,
            newRefreshToken
        }
    };

    public async verifyEmail(code : string){
        const validCode = await VerificationCodeModel.findOne({
            code,
            type : verificationCodeEnum.EMAIL_VERIFICATION,
            expiresAt : {$gt : new Date()}
        });

        if(!validCode){
            throw new BadRequestException("Invalid or expired verification code",ErrorCode.VERIFICATION_ERROR);
        }

        const user = await UserModel.findById(validCode.userId);

        if(!user){
            throw new BadRequestException("User not found",ErrorCode.AUTH_USER_NOT_FOUND);
        }

        user.isEmailVerified = true;
        await user.save();

        await VerificationCodeModel.deleteOne({code});

    };

    public async forgotPassword(email:string){
        const user = await UserModel.findOne({email});

        if(!user){
            throw new NotFoundException("User not found!");
        }

        const timeAgo = threeMinutesAgo();

        const maxAttemps = 2;

        const count = await VerificationCodeModel.countDocuments({
            userId : user._id,
            type : verificationCodeEnum.PASSWORD_RESET,
            createdAt : {$gt : timeAgo}
        });

        if(count >= maxAttemps){
            throw new HttpException("Too many request, try again later",HTTPSTATUS.TOO_MANY_REQUESTS,ErrorCode.AUTH_TOO_MANY_ATTEMPTS);
        }

        const expiresAt = anHourFromNow();

        const verificationCode = await VerificationCodeModel.create({
            userId : user._id,
            type : verificationCodeEnum.PASSWORD_RESET,
            expiresAt
        });

        const resetLink = `${config.APP_ORIGIN}/reset-password?code=${verificationCode.code}&exp=${expiresAt.getTime()}`;

        await sendResetLink(user.name,email,"reset-password-mail",resetLink);
    }
}