import { sendMail } from "./send-email";

export const sendVerificationCode = async (name:string,email:string,template:string,verificationCode:string)=>{
    await sendMail(email,"Verify Your Email",template,{name,verificationCode});
}

export const sendResetLink = async (name:string,email:string,template:string,resetLink:string)=>{
    await sendMail(email,"Reset Your Password",template,{name,resetLink});
}