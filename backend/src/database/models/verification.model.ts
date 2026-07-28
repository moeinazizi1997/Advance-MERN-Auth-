import mongoose, { Document, model } from "mongoose";
import { verificationCodeEnum } from "../../common/enums/verification-code.enum";
import { Schema } from "mongoose";
import { generateUniqueCode } from "../../common/utils/uuid";

export interface VerficationCodeDocument extends Document{
    userId : mongoose.Types.ObjectId;
    code : string;
    type : verificationCodeEnum;
    createdAt : Date;
    expiresAt : Date;
}

const verificationCodeSchema = new Schema<VerficationCodeDocument>({
    userId : {
        type : Schema.Types.ObjectId,
        ref : "User",
        index : true,
        required : true
    },
    code : {
        type : String,
        unique : true,
        required : true,
        default : generateUniqueCode
    },
    type : {
        type : String,
        required : true
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
});

const VerificationCodeModel = model<VerficationCodeDocument>("VerificationCode",verificationCodeSchema,"verification_codes");

export default VerificationCodeModel;