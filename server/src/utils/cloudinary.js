import { v2 as cloudinary } from "cloudinary";
import dotenv from 'dotenv';

dotenv.config()

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload buffer or file path to Cloudinary
 * @param {Buffer|string} fileInput - File buffer or file path
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Cloudinary upload result
 */
export const uploadOnCloudinary = async (fileInput, options = {}) => {
    try {
        if (!fileInput) {
            throw new Error('File input is required');
        }

        // Validate Cloudinary configuration
        if (!process.env.CLOUDINARY_CLOUD_NAME ||
            !process.env.CLOUDINARY_API_KEY ||
            !process.env.CLOUDINARY_API_SECRET) {
            throw new Error(
                'Cloudinary credentials missing in .env file!\n' +
                'Required: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET'
            );
        }

        // Default options
        const uploadOptions = {
            resource_type: options.resource_type || 'auto',
            folder: options.folder || 'uploads',
            use_filename: true,
            unique_filename: true,
            overwrite: false,
            ...options
        };

        // Check if input is a Buffer or file path
        if (Buffer.isBuffer(fileInput)) {
            // Handle Buffer upload using upload_stream
            return new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    uploadOptions,
                    (error, result) => {
                        if (error) {
                            console.error('Cloudinary upload error:', error);
                            reject(error);
                        } else {
                            console.log('✅ File uploaded to Cloudinary:', result.secure_url);
                            resolve(result);
                        }
                    }
                );

                // Write buffer to stream
                uploadStream.end(fileInput);
            });
        } else if (typeof fileInput === 'string') {
            // Handle file path upload
            const result = await cloudinary.uploader.upload(fileInput, uploadOptions);
            console.log('✅ File uploaded to Cloudinary:', result.secure_url);
            return result;
        } else {
            throw new Error('Invalid file input type. Expected Buffer or string (file path)');
        }

    } catch (error) {
        console.error('❌ Error in uploadOnCloudinary:', error.message);
        throw error;
    }
};

// import { v2 as cloudinary } from "cloudinary";
// import fs from "node:fs"
// import dotenv from 'dotenv';

// // Load environment variables
// dotenv.config();

// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View API Keys' above to copy your API secret
// });

// const uploadOnCloudinary = async (localFilePath) => {
//     try {
//         if (!localFilePath) return
//         const response = await cloudinary.uploader.upload(localFilePath, {
//             resource_type: "auto"
//         })

//         console.log("file is uploaded on cloudinary ", response.url)
//         fs.unlinkSync(localFilePath)
//         // console.log(fs.unlinkSync(localFilePath))
//         return response
//     } catch (error) {
//         fs.unlinkSync(localFilePath)
//         return null
//     }
// }

// export { uploadOnCloudinary }