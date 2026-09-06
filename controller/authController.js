const UserModel = require("../model/user")
const { validationResult } = require("express-validator")

const signupController = async (req, res) => {
     const errors = validationResult(req)
     if (!errors.isEmpty()) {
       return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() })
     }

     const { username, email, password } = req.body
     try {
        const user = new UserModel({ username, email, password })
        await user.save()
        const { password: _, ...safeUser } = user.toObject()
        res.status(201).json({ message: "Sign up successful", data: safeUser })
     } catch (error) {
       res.status(400).json({ message: error.message })
     }
}

module.exports = { signupController }

