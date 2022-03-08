const mongoose = require("mongoose");

const RecipesSchema = new mongoose.Schema({
  name: { type: String, required: true },
  chef: { type: mongoose.Types.ObjectId, required: true, ref: "users" },
  description: { type: String, required: true },
  image: { type: String },
  ingredients: [
    {
      _id: false,
      ingredient: { type: String, required: true },
      amount: { type: Number, required: true },
      unit: { type: String, required: true },
      category: { type: String, required: true },
    },
  ],
  comments: [
    {
      _id: false,
      comment: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: "comments",
      },
    },
  ],
});

const RecipesModel = mongoose.model("recipes", RecipesSchema);

module.exports = RecipesModel;
