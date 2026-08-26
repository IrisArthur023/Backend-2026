// import express
const express = require("express")
// install mongoose
const mongoose = require("mongoose")

require("dotenv").config()

// PORT NUMBER
const PORT= process.env.PORT || 5000

// MongoDB 
const MONGO_URL= process.env.MONGO_URL


// create server
const server = express()

// middleware
server.use(express.json());

//  import the Routes
const studentRoutes = require("./Routes/studentRoutes")

// Register Routes
server.use(studentRoutes)

mongoose.connect(MONGO_URL)
.then(()=>{
  console.log("MongoDB succesfully")


  server.listen(PORT,()=>{
  console.log("Server has started succesfully on jerry 5000")
})
  })
  .catch((error)=>{
  console.log("MongoDB connection failed", error.message)
  })

// Start and listen to the server
