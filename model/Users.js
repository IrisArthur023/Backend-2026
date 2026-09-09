// Import mongoose
const mongoose = require("mongoose");

// Define Schema
const Schema = mongoose.Schema;

const AuthenticationSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "User name is required"],
      trim: true,
    },
    gender: {
      type: String,
      required: [true, "Gender is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
        },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

// Define Model
const UserModel = mongoose.model("User", AuthenticationSchema);

// Export Model
module.exports = UserModel;