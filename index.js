// import express
const express = require("express")

// PORT NUMBER
PORT=3000

// create server
const server = express()

// middleware
server.use(express.json());

//  import the Routes
const studentRoutes = require("./Routes/studentRoutes")

// Register Routes
server.use(studentRoutes)

// Start and listen to the server
server.listen(PORT,()=>{
  console.log("Server has started succesfully on josh 3000")
})