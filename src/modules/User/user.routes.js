
import { Router } from "express";
import * as userController from './user.controller.js';
import { auth } from "../../middlewares/auth.middleware.js";
import { endPointsRoles } from "./user.endpoints.js";
import expressAsyncHandler from "express-async-handler";
const userRouter = Router();



userRouter.put('/update-profile', auth(endPointsRoles.NORMALUSER), expressAsyncHandler(userController.updateProfile))
userRouter.delete('/delete-profile', auth(endPointsRoles.NORMALUSER), expressAsyncHandler(userController.deleteProfile))

userRouter.get('/get-profile/:userid', auth(endPointsRoles.NORMALUSER), expressAsyncHandler(userController.getUserProfile))



export default userRouter;