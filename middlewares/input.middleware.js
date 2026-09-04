const {
    signupSchema,
    loginSchema,
    emailSchema,
    otpSchema,
    resetPasswordSchema,
    productSchema,
    rejectionSchema
} = require("../valid/input.schema");

const validate = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: true,
            stripUnknown: true
        });

        if (error) {
            return res.status(400).json({
                message: error.details[0].message
            });
        }

        req.body = value;
        next();
    };
};

const validateSignup = validate(signupSchema);
const validateLogin = validate(loginSchema);
const validateEmail = validate(emailSchema);
const validateOtp = validate(otpSchema);
const validateResetPassword = validate(resetPasswordSchema);
const validateProduct = validate(productSchema);
const validateRejection = validate(rejectionSchema);

module.exports = {
    validateSignup,
    validateLogin,
    validateEmail,
    validateOtp,
    validateResetPassword,
    validateProduct,
    validateRejection
};
