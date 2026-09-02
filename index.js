require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const studentRoutes = require("./Routes/studentRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Base health route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to Student API Backend",
    status: "Healthy",
  });
});

// Register Routes (available at both root and /api prefix)
app.use("/api", studentRoutes);
app.use(studentRoutes);

// 404 Handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Connect to Database and start server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server is running successfully on port ${PORT}`);
  });
};

startServer();