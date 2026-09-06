const { signupController } = require("../controller/authController")
const { body } = require('express-validator')
const UserModel = require("../model/user")
const express = require("express")
const router = express.Router()

router.post("/signup",
    [
        body('username').trim().not().isEmpty().withMessage("Username is required"),
        body('email').isEmail().withMessage("Email is invalid")
            .custom(async (value) => {
                const existingUser = await UserModel.findOne({ email: value })
                if (existingUser) {
                    throw new Error("Email is already in use")
                }
            }),
        body('password').trim().isLength({ min: 5 }).withMessage("Password must be at least 5 characters")
    ],
    signupController)

module.exports = router