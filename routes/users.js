const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const adminMiddleware = require("../middlewares/role.middleware");
const {
    validateSignup,
    validateLogin,
    validateEmail,
    validateOtp,
    validateResetPassword
} = require("../middlewares/input.middleware");
const {
    registerUser,
    loginUser,
    verifyOtp,
    resendOtp,
    forgotPassword,
    resetPassword,
    getUser,
    getAllUsers,
    applySeller,
    getSellerApplications,
    approveSeller,
    rejectSeller
} = require("../controllers/auth.controller");

router.post("/signup", validateSignup, registerUser);
router.post("/login", validateLogin, loginUser);
router.post("/verify-otp", validateOtp, verifyOtp);
router.post("/resend-otp", validateEmail, resendOtp);
router.post("/forgot-password", validateEmail, forgotPassword);
router.post("/reset-password", validateResetPassword, resetPassword);

router.get("/getuser", authMiddleware, getUser);
router.post("/apply-seller", authMiddleware, applySeller);

router.get("/all-users", authMiddleware, adminMiddleware, getAllUsers);
router.get("/seller-applications", authMiddleware, adminMiddleware, getSellerApplications);
router.put("/approve-seller/:id", authMiddleware, adminMiddleware, approveSeller);
router.put("/reject-seller/:id", authMiddleware, adminMiddleware, rejectSeller);

module.exports = router;
