
import SubCategory from "../../../DB/Models/sub-category.model.js"
import Category from '../../../DB/Models/category.model.js'
import generateUniqueString from "../../utils/generate-Unique-String.js"
import cloudinaryConnection from "../../utils/cloudinary.js"
import slugify from "slugify"

//============================== add SubCategory ==============================//
export const addSubCategory = async (req, res, next) => {
    // 1- destructuring the request body
    const { name } = req.body
    const { categoryId } = req.params
    const { _id } = req.authUser

    // 2- check if the subcategory name is already exist
    const isNameDuplicated = await SubCategory.findOne({ name })
    if (isNameDuplicated) {
        return next({ cause: 409, message: 'SubCategory name is already exist' })
        // return next( new Error('Category name is already exist' , {cause:409}) )
    }

    // 3- check if the category is exist by using categoryId
    const category = await Category.findById(categoryId)
    if (!category) return next({ cause: 404, message: 'Category not found' })

    // 4- generate the slug
    const slug = slugify(name, '-')

    // 5- upload image to cloudinary
    if (!req.file) return next({ cause: 400, message: 'Image is required' })

    const folderId = generateUniqueString(4)
    const { secure_url, public_id } = await cloudinaryConnection().uploader.upload(req.file.path, {
        folder: `${process.env.MAIN_FOLDER}/Categories/${category.folderId}/SubCategories/${folderId}`
    })


    // 6- generate the subCategory object
    const subCategory = {
        name,
        slug,
        Image: { secure_url, public_id },
        folderId,
        addedBy: _id,
        categoryId
    }
    // 7- create the subCategory
    const subCategoryCreated = await SubCategory.create(subCategory)
    res.status(201).json({ success: true, message: 'subCategory created successfully', data: subCategoryCreated })
}

// ======================update sub Category ================================

export const updateSubCategory = async (req, res, next) => {

        // Extract necessary data from request
        const { name } = req.body;
        const { subCategoryId } = req.params;
        const { _id } = req.authUser;

        // Find the subcategory by ID
        let subCategory = await SubCategory.findById(subCategoryId);
        if (!subCategory) {
            return res.status(404).json({ success: false, message: 'SubCategory not found' });
        }

        // Update subcategory name and slug if provided
        if (name) {
            // Check if the new name is already taken by another subcategory
            const isNameDuplicated = await SubCategory.findOne({ name });
            if (isNameDuplicated && isNameDuplicated._id.toString() !== subCategoryId) {
                return res.status(409).json({ success: false, message: 'SubCategory name is already taken' });
            }
            // Update name and slug
            subCategory.name = name;
            subCategory.slug = slugify(name, '-');
        }

        // Upload image to cloudinary if provided
        if (req.file) {
            const folderId = generateUniqueString(4);
            const { secure_url, public_id } = await cloudinaryConnection().uploader.upload(req.file.path, {
                folder: `${process.env.MAIN_FOLDER}/Categories/${subCategory.categoryId}/SubCategories/${folderId}`
            });
            subCategory.Image = { secure_url, public_id };
            subCategory.folderId = folderId;
        }

        // Update addedBy if needed
        subCategory.addedBy = _id;

        // Save the updated subcategory
        subCategory = await subCategory.save();

        // Respond with success message and updated subcategory data
        res.status(200).json({ success: true, message: 'SubCategory updated successfully', data: subCategory });
  
};


// ====================delete sub Category ================================
export const deleteSubCategory = async (req, res, next) => {
    try {
        // Extract subcategory ID from request parameters
        const { subCategoryId } = req.params;

        // Find the subcategory by ID
        const subCategory = await SubCategory.findById(subCategoryId);
        if (!subCategory) {
            return res.status(404).json({ success: false, message: 'SubCategory not found' });
        }

        // Remove the subcategory from the database
        await SubCategory.findByIdAndDelete(subCategoryId);

        // Respond with success message
        res.status(200).json({ success: true, message: 'SubCategory deleted successfully' });
    } catch (error) {
        // Handle errors
        next(error);
    }
};



// ====================get all sub Categories with brands ================================
export const getAllsubCategoryWithbrandth = async (req, res, next) => {

        // Perform an aggregation query to get subcategories with brands
        const subcategoriesWithBrands = await SubCategory.aggregate([
            {
                $lookup: {
                    from: 'brands', // Assuming the name of the brand collection is 'brands'
                    localField: '_id',
                    foreignField: 'subCategoryId',
                    as: 'brands'
                }
            },
            {
                $addFields: {
                    brands: {
                        $map: {
                            input: "$brands",
                            as: "brand",
                            in: {
                                name: "$$brand.name",
                                slug: "$$brand.slug",
                                Image: "$$brand.Image",
                                folderId: "$$brand.folderId",
                                addedBy: "$$brand.addedBy",
                                subCategoryId: "$$brand.subCategoryId",
                                categoryId: "$$brand.categoryId",
                                _id: "$$brand._id",
                                createdAt: "$$brand.createdAt",
                                updatedAt: "$$brand.updatedAt",
                                __v: "$$brand.__v"
                            }
                        }
                    }
                }
            }
        ]);

        // Respond with the result
        res.status(200).json({ success: true, data: subcategoriesWithBrands });

};
