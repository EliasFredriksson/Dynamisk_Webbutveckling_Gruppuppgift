const mongoose = require("mongoose");

const RecipesSchema = new mongoose.Schema({
    name: { type: String, required: true },
    chef: { type: mongoose.Types.ObjectId, required: true },
    description: { type: String, required: true },
    ingredients: [
        {
            ingredient: { type: String, required: true },
            ammount: { type: Number, required: true },
            unit: { type: String, required: true },
            categories: [
                {
                    category: { type: String, required: true },
                },
            ],
            image: { type: String },
        },
    ],
});

const RecipesModel = mongoose.model("recipes", RecipesSchema);

module.exports = RecipesModel;
