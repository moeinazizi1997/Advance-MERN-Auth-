import "dotenv/config";
import cors from "cors"
import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import { config } from "./config/app.config";
import connectDatabase from "./database/models/database";

const BASE_PATH = config.BASE_PATH;

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use(cors({
    credentials : true,
    origin : config.APP_ORIGIN
}));
app.use(cookieParser());

app.get("/health",(req:Request,res:Response)=>{
    return res.status(200).json({
        success : true,
        message : "healthy"
    })
});

app.listen(config.PORT,async ()=>{
    console.log(`Server is listening on port ${config.PORT} in ${config.NODE_ENV}`);
    await connectDatabase();
})