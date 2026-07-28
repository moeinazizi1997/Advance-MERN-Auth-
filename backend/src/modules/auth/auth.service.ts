import { RegisterDto } from "../../common/interfaces/auth.interface";
import UserModel from "../../database/models/user.model";
import { BadRequestException } from "../../common/utils/catch-error";
import { ErrorCode } from "../../common/enums/errorCode.enums";
import VerificationCodeModel from "../../database/models/verification.model";
import { verificationCodeEnum } from "../../common/enums/verification-code.enum";
import { fortyFiveMinutesFromNow } from "../../common/utils/date-time";

export class AuthService {
    public async register (registerData : RegisterDto){
        const {name, email, password, userAgent} = registerData;
        
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
}