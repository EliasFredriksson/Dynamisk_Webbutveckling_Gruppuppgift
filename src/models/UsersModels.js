const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    hashedPassword: { type: String },
    email: { type: String, required: true },
    recipes: { type: Array, required: true },
    image: { type: String },
    googleId: { type: String },
    favorites: [
        {
            _id: false,
            recipe: {
                type: mongoose.Types.ObjectId,
                required: true,
                ref: "recipes",
            },
        },
    ],
});

const UsersModels = mongoose.model("users", userSchema);

module.exports = UsersModels;
