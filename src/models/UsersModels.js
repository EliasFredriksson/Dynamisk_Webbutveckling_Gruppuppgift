const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  hashedPassword: { type: String, required: true },
  email: { type: String, required: true },
  recipe: { type: [], required: true },
  image: { type: String },
});

const UsersModel = mongoose.model("Users", userSchema);

module.exports = UsersModel;
