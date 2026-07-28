import { CookieOptions, Response } from "express";
import { config } from "../../config/app.config";
import { calculateExpirationDate } from "./date-time";

type cookiePayloadType = {
    res : Response;
    accessToken : string;
    refreshToken : string
}

const defaults : CookieOptions = {
    httpOnly : true,
    secure : config.NODE_ENV === "production" ? true : false,
    sameSite : config.NODE_ENV === "production" ? "strict" : "lax",
}

export const REFRESH_PATH = `${config.BASE_PATH}/auth/refresh`;

export const getRefreshTokenCookieOptions = ():CookieOptions=>{
    const expiresIn = config.JWT.JWT_REFRESH_TOKEN_EXPIRES_IN;

    const expires = calculateExpirationDate(expiresIn);

    return {
        ...defaults,
        expires,
        path : REFRESH_PATH
    }
};

export const getAccessTokenCookieOptions = ():CookieOptions=>{
    const expiresIn = config.JWT.JWT_ACCESS_TOKEN_EXPIRES_IN;

    const expires = calculateExpirationDate(expiresIn);

    return {
        ...defaults,
        expires,
        path : "/"
    }
};

export const setAuthenticationCookies = ({res,accessToken,refreshToken} : cookiePayloadType) : Response=>{
    res.cookie("accessToken",accessToken,getAccessTokenCookieOptions()).cookie("refreshToken",refreshToken,getRefreshTokenCookieOptions())
    return res;
};

export const clearAuthenticationCookies = (res:Response): Response=>{
    res.clearCookie("accessToken").clearCookie("refreshToken",{
        path : REFRESH_PATH
    })
    return res;
}