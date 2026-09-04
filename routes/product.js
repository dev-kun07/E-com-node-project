const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");
const sellerMiddleware = require("../middlewares/seller.middleware");
const adminMiddleware = require("../middlewares/role.middleware");
const { validateProduct, validateRejection } = require("../middlewares/input.middleware");
const {
    createProduct,
    getAllProducts,
    getProductById,
    getMyProducts,
    updateProduct,
    deleteProduct,
    getPendingProducts,
    approveProduct,
    rejectProduct
} = require("../controllers/product.controller");

router.get("/all", getAllProducts);
router.get("/id/:id", getProductById);

router.post("/create", authMiddleware, upload.single("image"), validateProduct, createProduct);
router.get("/my-products", authMiddleware, sellerMiddleware, getMyProducts);
router.put("/update/:id", authMiddleware, sellerMiddleware, validateProduct, updateProduct);
router.delete("/delete/:id", authMiddleware, sellerMiddleware, deleteProduct);

router.get("/pending", authMiddleware, adminMiddleware, getPendingProducts);
router.put("/approve/:id", authMiddleware, adminMiddleware, approveProduct);
router.put("/reject/:id", authMiddleware, adminMiddleware, validateRejection, rejectProduct);

module.exports = router;
