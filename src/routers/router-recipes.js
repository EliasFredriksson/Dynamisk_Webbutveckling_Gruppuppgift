const express = require("express");

const settings = require("../settings");

const { validateRecipe } = require("../utils");
const RecipesModel = require("../models/RecipesModel.js");
const { default: mongoose } = require("mongoose");

const recipesRouter = express.Router();

// ===== ROUTES =====
// ####################### CREATE #######################
// Go to create recipe page.
recipesRouter.get("/create", (req, res) => {
    // res.status(200).send("Sent back to create page.");
    res.render("recipes-create", {
        title: "Create Recipe",
        ingredientUnits: settings.INGREDIENT_UNITS,
        ingredientCategories: settings.INGREDIENT_CATEGORIES,
    });
});
// Create new recipe and save to database.
recipesRouter.post("/create", async (req, res) => {
    const { name, description, image, ingredients } = req.body;
    // const parsedIngredients = JSON.parse(ingredients);

    // TEMPORARY
    const chefId = new mongoose.Types.ObjectId();
    // #############################
    try {
        validateRecipe(name, chefId, description, image, ingredients);
        const newRecipe = new RecipesModel({
            name: name,
            chef: mongoose.Types.ObjectId(chefId),
            description: description,
            image: "IMAGE_PLACEHOLDER",
            ingredients: ingredients,
        });
        await newRecipe.save();
        res.status(201).send(newRecipe._id);
    } catch (error) {
        console.log(
            "\n\n================= ERROR =================\n",
            error,
            "\n\n"
        );
        res.status(400).send(error);
    }
});
// ######################## READ ########################
// Get recipe by provided ID. Send found recipe to/and render recipe single page.
recipesRouter.get("/:id", (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) throw "Invalid Id";
        RecipesModel.findById(req.params.id, (error, recipe) => {
            if (error) throw error;
            if (recipe) {
                res.status(200).send(recipe);
                // ########## TEMPORARILY DISABLED ##########
                // Enable once the handlebars html is in place.
                // res.render("recipes-single", {
                //     title: "Recipe",
                //     recipe: recipe,
                // });
            } else {
                res.status(400).redirect("/");
            }
        });
    } catch (error) {
        console.log("\n\nERROR:", error);
        res.status(400).redirect("/");
    }
});
// ######################## UPDATE ########################
// Go to Update (Edit) recipe page.
recipesRouter.get("/:id/edit", (req, res) => {
    RecipesModel.findById(req.params.id, (error, recipe) => {
        if (error) res.status(500).redirect(`/`);
        if (recipe)
            res.status(200).redirect("recipe-edit", {
                title: "Edit Recipe",
                recipe: recipe,
            });
        else res.status(400).redirect(`/`);
    });
});
// Update recipe and save to database.
recipesRouter.post("/:id/edit", (req, res) => {
    const { name, chefId, description, image, ingredients } = req.body;
    try {
        validateRecipe(name, chefId, description, image, ingredients);
        RecipesModel.findByIdAndUpdate(
            req.params.id,
            {
                name: name,
                chef: mongoose.Types.ObjectId(chefId),
                description: description,
                image: image,
                ingredients: ingredients,
            },
            (error, result) => {
                if (error)
                    res.status(500).redirect(`/recipes/${req.params.id}`);
                else res.status(200).redirect(`/recipes/${req.params.id}`);
            }
        );
    } catch (error) {
        console.log("\n\nERROR: ", error);
        res.status(400).redirect("/");
    }
});
// ######################## DELETE ########################
// Delete recipe
recipesRouter.post("/:id/delete", async (req, res) => {
    RecipesModel.findByIdAndDelete(req.params.id, (error, docs) => {
        if (error) res.status(500).redirect(`/recipe/${req.params.id}`);
        else res.status(200).redirect("/");
    });
});
// ########################################################

module.exports = recipesRouter;
