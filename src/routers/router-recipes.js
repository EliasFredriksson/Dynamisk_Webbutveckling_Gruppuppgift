const express = require("express");

const { checkForRecipePrototype } = require("../utils");
const RecipesModel = require("../models/RecipesModel.js");

const recipesRouter = express.Router();

// ===== ROUTES =====
// Get recipe by provided ID. Send found recipe to/and render recipe single page.
recipesRouter.get("/:id", (req, res) => {
    RecipesModel.findById(req.params.id, (error, recipe) => {
        if (error) throw error;
        if (recipe) {
            res.render("recipes-single", {
                title: "Recipe",
                recipe: recipe,
            });
        } else {
            res.status(400).redirect("/");
        }
    });
    res.status(200).send("Recipes!");
});

// Go to create recipe page.
recipesRouter.get("/create", checkForRecipePrototype, (req, res) => {
    res.render("recipes-create", {
        title: "Create Recipe",
    });
});
// Update recipe prototype name and description.
recipesRouter.post("/create/strings", checkForRecipePrototype, (req, res) => {
    const { name, description } = req.body;
});

recipesRouter.post(
    "/create/ingredients",
    checkForRecipePrototype,
    (req, res) => {
        const { name, amount, unit, category } = req.body;
    }
);

// Create new recipe and save to database.
recipesRouter.post("/create/save", checkForRecipePrototype, (req, res) => {
    const { name, chefId, description, ingredients } =
        res.locals.recipePrototype;
    try {
        const newRecipe = await RecipesModel.create({
            name: name,
            chef: chefId,
            description: description,
            ingredients: ingredients,
        });
        newRecipe.save();
        res.locals.recipeHasPreviousSettings = false;
    } catch (error) {
        res.status(400).redirect("/create");
    }

    res.status(200).redirect("/");
});

// Go to Update (Edit) recipe page.
recipesRouter.get("/:id/edit", (req, res) => {
    res.status(200).render("recipes-edit", {
        title: "Edit Recipe",
    });
});

recipesRouter.post("/:id/edit", (req, res) => {
    res.status(200).redirect("/");
});

module.exports = recipesRouter;
