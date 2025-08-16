// Libraries
require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ussdRoutes = require("./routes/ussdRoutes");

const app = express();
const PORT = process.env.PORT || 8000;

// Models
const user = require("./model/user");

// Database connection
mongoose
  .connect(process.env.MONGO_URL || "mongodb://localhost:27017/ussd")
  .then(() => console.log("Connected to Database"))
  .catch((error) => console.log("Database not connected", error));

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", ussdRoutes);

app
  .listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
  })
  .on("error", (error) => {
    console.error(`Server failed to start: ${error}`);
  });
