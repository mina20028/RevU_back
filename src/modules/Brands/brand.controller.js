import slugify from 'slugify'

import Brand from '../../../DB/Models/brand.model.js'
import subCategory from '../../../DB/Models/sub-category.model.js'
import cloudinaryConnection from '../../utils/cloudinary.js'
import generateUniqueString from '../../utils/generate-Unique-String.js'


//======================= add brand =======================//
export const addBrand = async (req, res, next) => {
    // 1- desturcture the required data from teh request object
    const { name } = req.body
    const { categoryId, subCategoryId } = req.query
    const { _id } = req.authUser
    // category check , subcategory check
    // 2- subcategory check
    const subCategoryCheck = await subCategory.findById(subCategoryId).populate('categoryId', 'folderId')
    if (!subCategoryCheck) return next({ message: 'SubCategory not found', cause: 404 })

    // 3- duplicate  brand document check 
    const isBrandExists = await Brand.findOne({ name, subCategoryId })
    if (isBrandExists) return next({ message: 'Brand already exists for this subCategory', cause: 400 })

    // 4- categogry check
    if (categoryId != subCategoryCheck.categoryId._id) return next({ message: 'Category not found', cause: 404 })

    // 5 - generate the slug
    const slug = slugify(name, '-')

    // 6- upload brand logo
    if (!req.file) return next({ message: 'Please upload the brand logo', cause: 400 })

    const folderId = generateUniqueString(4)
    const { secure_url, public_id } = await cloudinaryConnection().uploader.upload(req.file.path, {
        folder: `${process.env.MAIN_FOLDER}/Categories/${subCategoryCheck.categoryId.folderId}/SubCategories/${subCategoryCheck.folderId}/Brands/${folderId}`,
    })

    const brandObject = {
        name, slug,
        Image: { secure_url, public_id },
        folderId,
        addedBy: _id,
        subCategoryId,
        categoryId
    }

    const newBrand = await Brand.create(brandObject)

    res.status(201).json({
        status: 'success',
        message: 'Brand added successfully',
        data: newBrand
    })

}

// ======================update brand ================================
export const updateBrand = async (req, res, next) => {

        // 1- Destructure the required data from the request object
        const { name } = req.body;
        const { brandId } = req.params; 
        const { _id } = req.authUser;

        // 2- Find the brand to update
        const brand = await Brand.findOne({_id:brandId,addedBy:_id});
        if (!brand) {
            return next({ message: 'Brand not found', cause: 404 });
        }

      

        // 4- Update the brand document
        if (name) {
            brand.name = name;
        }

        // Update image if provided
        if (req.file) {
            const { secure_url, public_id } = await cloudinaryConnection().uploader.upload(req.file.path, {
                folder: `${process.env.MAIN_FOLDER}/Categories/${brand.categoryId.folderId}/SubCategories/${brand.subCategoryId.folderId}/Brands/${brand.folderId}`,
            });

            // Remove old image from cloudinary if exists
            if (brand.Image.public_id) {
                await cloudinaryConnection().uploader.destroy(brand.Image.public_id);
            }

            brand.Image = { secure_url, public_id };
        }

        // Save the updated brand
        const updatedBrand = await brand.save();

        res.status(200).json({
            status: 'success',
            message: 'Brand updated successfully',
            data: updatedBrand
        });
   
}


// ====================delete brand ==============================

export const deletebrand =  async (req, res, next) => {

        // Extract brand ID from request parameters
        const { brandId } = req.params;
        const {_id} = req.authUser

        // Find the brand by ID
        const brand = await Brand.findOne({_id:brandId,addedBy:_id});
        if (!brand) {
            return next({ message: 'Brand not found', cause: 404 })
        }

       

        // Remove the brand from the database
        await Brand.findByIdAndDelete(brandId);

        // Respond with success message
        res.status(200).json({ success: true, message: 'Brand deleted successfully' });

};



// ====================get all brands ==============================
export const getAllBrands = async (req, res, next) => {
  
        const brands = await Brand.find();
        if(!brands)    return next({ message: 'no Brands yet', cause: 404 })


        res.status(200).json({
            status: 'success',
            data: brands
        });

}