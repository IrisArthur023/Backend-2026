const express = require("express");
const router = express.Router();
const {
  createUser,
  retrieveUser,
  retrieveSingleUser,
  updateUser,
  deleteUser,
} = require("../controller/studentController");

// CRUD Routes
router.post("/students", createUser);
router.post("/create", createUser); // Alias for backward compatibility

router.get("/students", retrieveUser);
router.get("/students/:id", retrieveSingleUser);

router.put("/students/:id", updateUser);
router.patch("/students/:id", updateUser);

router.delete("/students/:id", deleteUser);

module.exports = router;