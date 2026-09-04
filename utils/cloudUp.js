const cloudinary = require("../config/cloudinary");

const uploadToCloudinary = async (filePath) => {
    const result = await cloudinary.uploader.upload(filePath);
    return result.secure_url;
};

module.exports = uploadToCloudinary;