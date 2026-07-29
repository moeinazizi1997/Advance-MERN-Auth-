import { sendMail } from "./send-email";

export const sendVerificationCode = async (name:string,email:string,template:string,verificationCode:string)=>{
    await sendMail(email,"Verify Your Email",template,{name,verificationCode});
}