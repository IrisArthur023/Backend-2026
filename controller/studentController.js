// controller
const createUser =(req,res)=>{
    res.send("User Created")
}


const retrieveUser=(req,res)=>{
   res.send("Users retrieved")
}

module.exports={createUser,retrieveUser}