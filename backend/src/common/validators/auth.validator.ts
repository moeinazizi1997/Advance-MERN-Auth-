import {z} from "zod";

const emailSchema = z.string().trim().min(1, "Email is required").max(255).email("Invalid email address");

const passwordSchema = z.string().trim().min(6).max(255);

export const registerSchema = z.object({
    name : z.string().trim().min(1).max(255),
    email : emailSchema,
    password: passwordSchema,
    confirmPassword : passwordSchema
}).refine((val)=>val.password === val.confirmPassword,{
    message : "Password does not match",
    path : ["confirmPassword"]
});

export const loginSchema = z.object({
    email : emailSchema,
    password : passwordSchema,
    userAgent : z.string().optional()
});

export const verificationCodeSchema = z.string().trim().min(1).max(25);

export const verificationEmailSchema = z.object({
    code : verificationCodeSchema
});

export const resetPasswordSchema = z.object({
    password : passwordSchema,
    verificationCode : verificationCodeSchema
});