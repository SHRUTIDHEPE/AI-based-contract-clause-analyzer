import { v2 as cloudinary } from 'cloudinary';
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

// CONFIGURE CLOUDINARY 
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload function
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "raw", //  necessary for PDFs, DOCX, etc.
            folder: "majorproj", //  optional: keeps your uploads organized
        });

        //console.log(" File uploaded to Cloudinary:", response.url);

        // safely remove local file after successful upload
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }

        return response;
    } catch (error) {
        console.error("❌ Cloudinary upload error:", error);

        // delete local file safely even if upload fails
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }

        return null;
    }
};

// Delete function
const deleteFromCloudinary = async (publicId) => {
    try {
        if (!publicId) {
            console.error("No publicId provided for Cloudinary deletion");
            return null;
        }

        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: "raw", //  specify "raw" since PDFs are non-image files
        });

        console.log("Deleted from Cloudinary:", publicId);
        return result;
    } catch (error) {
        console.error("Error deleting from Cloudinary:", error);
        return null;
    }
};

export { uploadOnCloudinary, deleteFromCloudinary };
