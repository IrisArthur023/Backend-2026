//Import mongoose
const mongoose = require("mongoose");

//Define our schema
const Schema = mongoose.Schema;

const StudentSchema = new Schema({
  name: {
    type: String,
  },
  age: {
    type: Number,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: Number,
    required: true,
  },
});

//Define Model
const StudentModel = mongoose.model("Student", StudentSchema);

//Export Model
module.exports = StudentModel;