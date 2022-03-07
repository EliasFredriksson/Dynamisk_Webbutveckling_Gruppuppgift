const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String },
  hashedPassword: { type: String },
  email: { type: String },
  recipes: { type: Array, required: true },
  image: { type: String },
  googleId: { type: String },
});

const UsersModels = mongoose.model("users", userSchema);

module.exports = UsersModels;
