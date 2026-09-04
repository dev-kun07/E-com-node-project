const Joi = require("joi");

const signupSchema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    phone: Joi.number().integer().min(100000000).max(9999999999).required(),
    addresses: Joi.array().items(Joi.object({
        fullName: Joi.string().required(),
        street: Joi.string().allow(""),
        city: Joi.string().allow(""),
        state: Joi.string().allow(""),
        pincode: Joi.string().allow(""),
        country: Joi.string().allow("")
    })).default([])
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
});

const emailSchema = Joi.object({
    email: Joi.string().email().required()
});

const otpSchema = Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(4).pattern(/^\d+$/).required()
});

const resetPasswordSchema = Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(4).pattern(/^\d+$/).required(),
    password: Joi.string().min(6).required()
});

const productSchema = Joi.object({
    name: Joi.string().min(3).max(30).required(),
    description: Joi.string().min(3).required(),
    price: Joi.number().min(1).required(),
    stock: Joi.number().integer().min(0).required(),
    category: Joi.string().required()
});

const rejectionSchema = Joi.object({
    rejectionReason: Joi.string().min(3).max(200).required()
});

module.exports = {
    signupSchema,
    loginSchema,
    emailSchema,
    otpSchema,
    resetPasswordSchema,
    productSchema,
    rejectionSchema
};
