const express = require("express");

const RecipesModel = require("../models/RecipesModel.js");

const recipesRouter = express.Router();

// ===== ROUTES =====
// Get recipe by provided ID. Send found recipe to/and render recipe single page.
recipesRouter.get("/:id", (req, res) => {
    res.status(200).send("Recipes!");
});

// Go to create recipe page.
recipesRouter.get("/create", (req, res) => {
    res.render("recipes-create", {
        title: "Create Recipe",
    });
});

// Create new recipe and save to database.
recipesRouter.post("/create", (req, res) => {
    res.status(200).redirect("/");
});

// Update

module.exports = recipesRouter;
