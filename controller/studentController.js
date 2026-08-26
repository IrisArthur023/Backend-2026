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

module.exports={createUser,retrieveUser}