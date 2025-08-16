const mongoose = require("mongoose");
const { Schema } = mongoose;

// Define the schema
const userSchema = new Schema({
  id_number: Number,
  password: String,
});

// Create a model based on the schema
const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;
