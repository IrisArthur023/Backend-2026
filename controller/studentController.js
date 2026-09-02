const StudentModel = require("../model/student");

// Create a new student
const createUser = async (req, res) => {
  try {
    const student = new StudentModel(req.body);
    const savedStudent = await student.save();
    res.status(201).json({
      success: true,
      message: "Student created successfully",
      data: savedStudent,
    });
  } catch (error) {
    console.error("Error creating student:", error.message);
    res.status(400).json({
      success: false,
      error: error.message || "Failed to create user",
    });
  }
};

// Retrieve all students
const retrieveUser = async (req, res) => {
  try {
    const students = await StudentModel.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    console.error("Error retrieving students:", error.message);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to retrieve users",
    });
  }
};

// Retrieve a single student by ID
const retrieveSingleUser = async (req, res) => {
  try {
    const student = await StudentModel.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        error: "Student not found",
      });
    }

    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    console.error("Error retrieving single student:", error.message);
    res.status(400).json({
      success: false,
      error: error.message || "Invalid student ID or failed to retrieve user",
    });
  }
};

// Update student by ID
const updateUser = async (req, res) => {
  try {
    const student = await StudentModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        error: "Student not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Student updated successfully",
      data: student,
    });
  } catch (error) {
    console.error("Error updating student:", error.message);
    res.status(400).json({
      success: false,
      error: error.message || "Failed to update user",
    });
  }
};

// Delete student by ID
const deleteUser = async (req, res) => {
  try {
    const student = await StudentModel.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        error: "Student not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Student deleted successfully",
      data: student,
    });
  } catch (error) {
    console.error("Error deleting student:", error.message);
    res.status(400).json({
      success: false,
      error: error.message || "Failed to delete user",
    });
  }
};

module.exports = {
  createUser,
  retrieveUser,
  retrieveSingleUser,
  updateUser,
  deleteUser,
};