// controller
const StudentModel = require('../model/student')

const createUser = async(req,res)=>{
  
   try {
     const student = await StudentModel.create(req.body);
     res.status(201).json(student)
   } catch (error) {
     res.status(400).json({message: error.message})
   }
}


const retrieveUser= async(req,res)=>{
   try {
      const students = await StudentModel.find();
      res.status(200).json(students);
   } catch (error) {
    res.status(500).json({ message: error.message });
   }
}

const getUserById = async (req, res) => {
  try {
    const student = await StudentModel.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Not found" });
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUser = async (req, res,) => {
  try {
    const student = await StudentModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!student) return res.status(404).json({ message: "Not found" });
    res.status(200).json(student);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


const deleteUser = async (req, res) => {
  try {
    const student = await StudentModel.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ message: "Not found" });
    res.status(200).json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports={createUser,retrieveUser,getUserById,updateUser,deleteUser}