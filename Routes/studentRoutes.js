const {retrieveUser,createUser} = require("../controller/studentController")
const express = require("express")
const router = express.Router()

router.get("/jerry",retrieveUser)
router.post("/create",createUser)


module.exports= router