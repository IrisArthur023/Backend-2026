const {retrieveUser,createUser,getUserById,updateUser,deleteUser} = require("../controller/studentController")
const express = require("express")
const router = express.Router()

router.post("/students", createUser);
router.get("/students", retrieveUser);
router.get("/students/:id", getUserById);
router.put("/students/:id", updateUser);
router.delete("/students/:id", deleteUser);


module.exports= router