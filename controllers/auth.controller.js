const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Token = require("../models/token.model");
const otpGen = require("../utils/otpGen");
const sendmail = require("../models/mail.model");

const registerUser = async (req, res) => {
    const { name, password, phone, addresses } = req.body;
    const email = req.body.email.toLowerCase().trim();

    try {
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            phone,
            addresses
        });

        await newUser.save();

        const otp = otpGen();
        const newToken = new Token({
            userId: newUser._id,
            token: otp,
            type: "verify",
            expiresAt: new Date(Date.now() + 10 * 60 * 1000)
        });

        await newToken.save();
        await sendmail(
            email,
            "Verify Your Account",
            `Your OTP is ${otp}. It is valid for 10 minutes.`
        );

        return res.status(201).json({
            message: "User registered successfully. Please verify your email.",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

const loginUser = async (req, res) => {
    const password = req.body.password;
    const email = req.body.email.toLowerCase().trim();

    try {
        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            return res.status(400).json({
                message: "Wrong email or password"
            });
        }

        if (!user.isVerified) {
            return res.status(403).json({
                message: "Please verify your email before logging in"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                message: "Wrong email or password"
            });
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                sellerStatus: user.sellerStatus
            }
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

const verifyOtp = async (req, res) => {
    const email = req.body.email.toLowerCase().trim();
    const { otp } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const token = await Token.findOne({
            userId: user._id,
            token: otp,
            type: "verify"
        });

        if (!token) {
            return res.status(400).json({
                message: "Invalid OTP"
            });
        }

        if (token.expiresAt < new Date()) {
            await Token.deleteOne({ _id: token._id });

            return res.status(400).json({
                message: "OTP expired"
            });
        }

        user.isVerified = true;
        await user.save();
        await Token.deleteOne({ _id: token._id });

        return res.status(200).json({
            message: "Account verified successfully"
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

const resendOtp = async (req, res) => {
    const email = req.body.email.toLowerCase().trim();

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (user.isVerified) {
            return res.status(400).json({
                message: "User is already verified"
            });
        }

        await Token.deleteMany({
            userId: user._id,
            type: "verify"
        });

        const otp = otpGen();
        const newToken = new Token({
            userId: user._id,
            token: otp,
            type: "verify",
            expiresAt: new Date(Date.now() + 10 * 60 * 1000)
        });

        await newToken.save();
        await sendmail(
            email,
            "Verify Your Account",
            `Your OTP is ${otp}. It is valid for 10 minutes.`
        );

        return res.status(200).json({
            message: "OTP sent successfully"
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

const forgotPassword = async (req, res) => {
    const email = req.body.email.toLowerCase().trim();

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        await Token.deleteMany({
            userId: user._id,
            type: "reset"
        });

        const otp = otpGen();
        const newToken = new Token({
            userId: user._id,
            token: otp,
            type: "reset",
            expiresAt: new Date(Date.now() + 10 * 60 * 1000)
        });

        await newToken.save();
        await sendmail(
            email,
            "Reset Your Password",
            `Your password reset OTP is ${otp}. It is valid for 10 minutes.`
        );

        return res.status(200).json({
            message: "Password reset OTP sent successfully"
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

const resetPassword = async (req, res) => {
    const email = req.body.email.toLowerCase().trim();
    const { otp, password } = req.body;

    try {
        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        const token = await Token.findOne({
            userId: user._id,
            token: otp,
            type: "reset"
        });

        if (!token) {
            return res.status(400).json({
                message: "Invalid OTP"
            });
        }

        if (token.expiresAt < new Date()) {
            await Token.deleteOne({ _id: token._id });

            return res.status(400).json({
                message: "OTP expired"
            });
        }

        user.password = await bcrypt.hash(password, 10);
        await user.save();
        await Token.deleteOne({ _id: token._id });

        return res.status(200).json({
            message: "Password reset successfully"
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

const getUser = async (req, res) => {
    return res.status(200).json({
        user: req.user
    });
};

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");

        return res.status(200).json({
            users
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

const applySeller = async (req, res) => {
    try {
        if (!req.user.isVerified) {
            return res.status(403).json({
                message: "Please verify your email before applying as a seller"
            });
        }

        if (req.user.role === "seller") {
            return res.status(400).json({
                message: "You are already an approved seller"
            });
        }

        if (req.user.sellerStatus === "pending") {
            return res.status(400).json({
                message: "Your seller application is already pending"
            });
        }

        req.user.sellerStatus = "pending";
        await req.user.save();

        return res.status(200).json({
            message: "Seller application submitted successfully"
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

const getSellerApplications = async (req, res) => {
    try {
        const applications = await User.find({ sellerStatus: "pending" }).select("-password");

        return res.status(200).json({
            applications
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

const approveSeller = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid user id"
            });
        }

        const user = await User.findById(req.params.id);

        if (!user || user.sellerStatus !== "pending") {
            return res.status(404).json({
                message: "Pending seller application not found"
            });
        }

        user.role = "seller";
        user.sellerStatus = "approved";
        await user.save();

        return res.status(200).json({
            message: "Seller approved successfully"
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

const rejectSeller = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid user id"
            });
        }

        const user = await User.findById(req.params.id);

        if (!user || user.sellerStatus !== "pending") {
            return res.status(404).json({
                message: "Pending seller application not found"
            });
        }

        user.sellerStatus = "none";
        await user.save();

        return res.status(200).json({
            message: "Seller application rejected"
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            error: error.message
        });
    }
};

module.exports = {
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
};
