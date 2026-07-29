import { getEnv } from "../common/utils/get-env";

const appConfig = ()=>({
    NODE_ENV : getEnv("NODE_ENV","development"),
    APP_ORIGIN : getEnv("APP_ORIGIN","http://localhost:3000"),
    PORT : getEnv("PORT","5000"),
    BASE_PATH : getEnv("BASE_PATH","/api/v1"),
    JWT : {
        JWT_ACCESS_TOKEN_SECRET: getEnv("JWT_ACCESS_TOKEN_SECRET"),
        JWT_ACCESS_TOKEN_EXPIRES_IN : getEnv("JWT_ACCESS_TOKEN_EXPIRES_IN",'15m'),
        JWT_REFRESH_TOKEN_SECRET : getEnv("JWT_REFRESH_TOKEN_SECRET"),
        JWT_REFRESH_TOKEN_EXPIRES_IN : getEnv("JWT_REFRESH_TOKEN_EXPIRES_IN","7d")
    },
    MONGO_URI : getEnv("MONGO_URI"),
    EMAIL : {
        SMTP_HOST : getEnv("SMTP_HOST"),
        SMTP_PORT : getEnv("SMTP_PORT"),
        SMTP_SERVICE : getEnv("SMTP_SERVICE"),
        AUTH : {
            SMTP_AUTH_USER : getEnv("SMTP_AUTH_USER"),
            SMTP_AUTH_PASSWORD : getEnv("SMTP_AUTH_PASSWORD")
        }
    }
});

export const config = appConfig();