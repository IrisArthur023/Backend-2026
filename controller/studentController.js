// controller
const studentModel = require('../model/student')

const createUser = async(req,res)=>{
   try {
     const student = await studentModel.create(req.body);
     res.status(201).json(student)
   } catch (error) {
     res.status(400).json({message: error.message})
   }
}


const retrieveUser=(req,res)=>{
   res.send("Users retrieved")
}

module.exports={createUser,retrieveUser}