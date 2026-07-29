import nodemailer from "nodemailer";
import { config } from "../../config/app.config";
import ejs from "ejs";
import path from "path";


const transporter = nodemailer.createTransport({
    host : config.EMAIL.SMTP_HOST,
    port : parseInt(config.EMAIL.SMTP_PORT),
    service : config.EMAIL.SMTP_SERVICE,
    auth : {
        user : config.EMAIL.AUTH.SMTP_AUTH_USER,
        pass : config.EMAIL.AUTH.SMTP_AUTH_PASSWORD
    }
});

const renderEmailTemplte = async(templateName:string,data:Record<string,any>):Promise<string>=>{
    const templatePath = path.join(
        process.cwd(),
        "src",
        "mailers",
        "templates",
        `${templateName}.ejs`
    );

    return ejs.renderFile(templatePath,data);
}

// Send an email using nodemailer
export const sendMail = async(to:string,subject:string,templateName:string,data:Record<string,any>)=>{
    try{
        const html = await renderEmailTemplte(templateName,data);
        await transporter.sendMail({
            from : `${config.EMAIL.AUTH.SMTP_AUTH_USER}`,
            to,
            subject,
            html
        });
        return true;
    }catch(err){
        throw new Error(`Error on sending email from ${config.EMAIL.AUTH.SMTP_AUTH_USER} to ${to} with subject of ${subject} and error is ${err}`);
    }
}