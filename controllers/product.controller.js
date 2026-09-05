const mongoose = require("mongoose");
const uploadToCloudinary = require("../utils/cloudUp");
const Product = require("../models/product.model");
const fs = require("fs");

const createProduct = async (req, res) => {
    try {
        let imageUrl = "";

        if (req.file) {
            imageUrl = await uploadToCloudinary(req.file.path);
            fs.unlink(req.file.path, () => {});
        }

        const product = new Product({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            stock: req.body.stock,
            category: req.body.category,
            images: imageUrl,
            seller: req.user._id,
            status: "pending"
        });

        await product.save();

        return res.status(201).json({
            message: "Product created and sent for admin approval",
            product
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

const getAllProducts = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);
        const filter = { status: "approved" };

        if (req.query.category) {
            filter.category = new RegExp(`^${req.query.category}$`, "i");
        }

        if (req.query.search) {
            filter.$or = [
                { name: new RegExp(req.query.search, "i") },
                { description: new RegExp(req.query.search, "i") }
            ];
        }

        const totalProducts = await Product.countDocuments(filter);
        const products = await Product.find(filter)
            .populate("seller", "name email")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        return res.status(200).json({
            products,
            pagination: {
                page,
                limit,
                totalProducts,
                totalPages: Math.ceil(totalProducts / limit)
            }
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

const getProductById = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid product id"
            });
        }

        const product = await Product.findOne({
            _id: req.params.id,
            status: "approved"
        }).populate("seller", "name email");

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        return res.status(200).json({
            product
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

const getMyProducts = async (req, res) => {
    try {
        const products = await Product.find({ seller: req.user._id }).sort({ createdAt: -1 });

        return res.status(200).json({
            products
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

const updateProduct = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid product id"
            });
        }

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        if (product.seller.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        product.name = req.body.name;
        product.description = req.body.description;
        product.price = req.body.price;
        product.stock = req.body.stock;
        product.category = req.body.category;
        product.status = "pending";
        product.rejectionReason = "";

        await product.save();

        return res.status(200).json({
            message: "Product updated and sent for admin approval",
            product
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

const deleteProduct = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid product id"
            });
        }

        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        if (product.seller.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        await product.deleteOne();

        return res.status(200).json({
            message: "Product deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

const getPendingProducts = async (req, res) => {
    try {
        const products = await Product.find({ status: "pending" })
            .populate("seller", "name email")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            products
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

const approveProduct = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid product id"
            });
        }

        const product = await Product.findById(req.params.id);

        if (!product || product.status !== "pending") {
            return res.status(404).json({
                message: "Pending product not found"
            });
        }

        product.status = "approved";
        product.rejectionReason = "";
        await product.save();

        return res.status(200).json({
            message: "Product approved successfully",
            product
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

const rejectProduct = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid product id"
            });
        }

        const product = await Product.findById(req.params.id);

        if (!product || product.status !== "pending") {
            return res.status(404).json({
                message: "Pending product not found"
            });
        }

        product.status = "rejected";
        product.rejectionReason = req.body.rejectionReason;
        await product.save();

        return res.status(200).json({
            message: "Product rejected",
            product
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    getMyProducts,
    updateProduct,
    deleteProduct,
    getPendingProducts,
    approveProduct,
    rejectProduct
};
