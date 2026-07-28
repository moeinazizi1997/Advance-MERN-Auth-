import jwt, { SignOptions, VerifyOptions } from "jsonwebtoken";
import { SessionDocument } from "../../database/models/session.model";
import { UserDocument } from "../../database/models/user.model"
import { config } from "../../config/app.config";


export type AccessTokenPayloadType = {
    userId : UserDocument["_id"];
    sessionId : SessionDocument["_id"]
};

export type RefreshTokenPayloadType = {
    sessionId : SessionDocument["_id"]
};

type SignOptsAndSecret = SignOptions & {
    secret : string
};

export const accessTokenSignOptions : SignOptsAndSecret = {
    expiresIn : config.JWT.JWT_ACCESS_TOKEN_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    secret : config.JWT.JWT_ACCESS_TOKEN_SECRET
};

export const refreshTokenSignOptions : SignOptsAndSecret = {
    expiresIn : config.JWT.JWT_REFRESH_TOKEN_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    secret : config.JWT.JWT_REFRESH_TOKEN_SECRET
};


const signDefaults: SignOptions = {
    audience: ["user"],
};

const verifyDefaults: VerifyOptions = {
    audience: ["user"],
};

export const signJWTToken = (payload : AccessTokenPayloadType | RefreshTokenPayloadType,options? : SignOptsAndSecret)=>{
    const {secret,...opts} = options || accessTokenSignOptions;
    return jwt.sign(payload,secret,{
        ...signDefaults,
        ...opts
    })
};

export const verifyJWTToken = <TPayload extends object = AccessTokenPayloadType>(
    token: string,
    options: VerifyOptions & { secret: string }
) => {
    try {
        const { secret, ...opts } = options;

        const payload = jwt.verify(token, secret, {
            ...verifyDefaults,
            ...opts,
        }) as TPayload;

        return { payload };
    } catch (err: any) {
        return { error: err.message };
    }
};