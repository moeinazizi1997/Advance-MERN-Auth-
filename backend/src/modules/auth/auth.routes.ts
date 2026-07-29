import {Router} from "express";
import { authController } from "./auth.module";

const authRouter = Router();

authRouter.post("/register",authController.register);
authRouter.post("/login",authController.login);
authRouter.post("/verify/email",authController.verifyEmail);
authRouter.post("/password/forgot",authController.forgotPassword);
authRouter.post("/password/reset",authController.resetPassword);
authRouter.post("/refresh",authController.refreshToken);

export default authRouter;