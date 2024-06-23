
import { Router } from "express";
const router = Router();
import * as subCategoryController from './subCategory.controller.js'
import expressAsyncHandler from "express-async-handler";
import { multerMiddleHost } from "../../middlewares/multer.js";
import { endPointsRoles } from "../Category/category.endpoints.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { allowedExtensions } from "../../utils/allowed-extensions.js";


router.post('/addSubCategory/:categoryId',
    auth(endPointsRoles.ADD_CATEGORY),
    multerMiddleHost({
        extensions: allowedExtensions.image
    }).single('image'),
    expressAsyncHandler(subCategoryController.addSubCategory))


    router.put('/updateSubCategory/:subCategoryId',
    auth(endPointsRoles.ADD_CATEGORY),
    multerMiddleHost({
        extensions: allowedExtensions.image
    }).single('image'),
    expressAsyncHandler(subCategoryController.updateSubCategory))



    router.delete('/deleteSubCategory/:subCategoryId',
    auth(endPointsRoles.ADD_CATEGORY),
    expressAsyncHandler(subCategoryController.deleteSubCategory))

    router.get('/getSubCategoryWithBrands', 
    expressAsyncHandler(subCategoryController.getAllsubCategoryWithbrandth))

    

    

export default router;