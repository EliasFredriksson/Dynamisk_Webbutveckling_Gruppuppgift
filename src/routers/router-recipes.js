const express = require("express");

const settings = require("../settings");

const { validateRecipe } = require("../utils");
const RecipesModel = require("../models/RecipesModel.js");
const UsersModel = require("../models/UsersModels.js");
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
        validateRecipe(name, chefId, description, image, ingredients, []);
        const newRecipe = new RecipesModel({
            name: name,
            chef: mongoose.Types.ObjectId(chefId),
            description: description,
            image: "IMAGE_PLACEHOLDER",
            ingredients: ingredients,
            comments: [],
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
recipesRouter.get("/:id", async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) throw "Invalid Id";
        const recipe = await RecipesModel.findById(req.params.id)
            .populate("comments.user")
            .lean();
        const chef = await UsersModel.findById(recipe.chef).lean();

        let recipeCategories = [];
        recipe.ingredients.forEach((entry) => {
            if (!recipeCategories.includes(entry.category))
                recipeCategories.push(entry.category);
        });
        res.render("recipes-single", {
            title: recipe.name,
            recipe: recipe,
            chef: chef,
            categories: recipeCategories,
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
        if (recipe) res.status(200).redirect("/");
        // res.status(200).render("recipe-edit", {
        //     title: "Edit Recipe",
        //     recipe: recipe,
        // });
        else res.status(400).redirect(`/`);
    });
});
// Update recipe and save to database.
recipesRouter.post("/:id/edit", (req, res) => {
    const { name, chefId, description, image, ingredients } = req.body;
    try {
        validateRecipe(name, chefId, description, image, ingredients, []);
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

// ######################## COMMENT ########################
recipesRouter.post("/:id/comments/add", async (req, res) => {});
// ########################################################

module.exports = recipesRouter;
