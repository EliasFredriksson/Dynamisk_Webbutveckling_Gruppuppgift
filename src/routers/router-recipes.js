const express = require("express");

const { checkForRecipePrototype } = require("../utils");
const RecipesModel = require("../models/RecipesModel.js");

const recipesRouter = express.Router();

recipesRouter.use(checkForRecipePrototype);

// ===== ROUTES =====
// ######################## READ ########################
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
// ######################################################
// ####################### CREATE #######################
// Go to create recipe page.
recipesRouter.get("/create", (req, res) => {
    res.render("recipes-create", {
        title: "Create Recipe",
        recipePrototype: res.locals.recipePrototype,
    });
});

// Update recipePrototype name and description.
recipesRouter.post("/create/strings", (req, res) => {
    const { name, description } = req.body;
    if (name == undefined || description == undefined)
        res.status(400).redirect("/recipes/create");

    res.locals.recipePrototype.name = name;
    res.locals.recipePrototype.description = description;
});

// Add new ingredient to recipePrototype.
recipesRouter.post("/create/ingredients", (req, res) => {
    const { ingredient, amount, unit, category } = req.body;
    if (
        ingredient == undefined ||
        amount == undefined ||
        unit == undefined ||
        category == undefined
    )
        res.status(400).redirect("/recipes/create");
    const newIngredient = {
        ingredient,
        amount,
        unit,
        category,
    };
    res.locals.recipePrototype.ingredients.push(newIngredient);
    res.status(200).redirect("/recipes/create");
});

// Change existing ingredient by index in recipePrototype.
recipesRouter.post("/create/ingredients/:index", (req, res) => {
    const { property, newValue } = req.body;
    const index = req.params.index;
    try {
        const ingredientIndex = parseInt(index);
        if (
            ingredientIndex < 0 ||
            ingredientIndex >= res.locals.recipePrototype.ingredients.length ||
            (property !== "ingredient" &&
                property !== "amount" &&
                property !== "unit" &&
                property !== "category")
        )
            throw "Invalid provided data.";
        res.locals.recipePrototype[property] = newValue;
        res.status(200).redirect("/recipes/create");
    } catch (error) {
        res.status(400).redirect("/recipes/create");
    }
});

// Create new recipe and save to database.
recipesRouter.post("/create/save", async (req, res) => {
    try {
        res.locals.recipePrototype.ingredients.forEach((ingredient) => {
            ingredient.amount = parseInt(ingredient.amount);
        });
        const newRecipe = new RecipesModel(res.locals.recipePrototype);
        await newRecipe.save();
        res.status(200).redirect(`/recipes/${newRecipe._id}`);
    } catch (error) {
        res.status(400).redirect("/recipes/create");
    }
});
// ########################################################
// ######################## UPDATE ########################
// ======= NOT DONE =======
// Go to Update (Edit) recipe page.
recipesRouter.get("/:id/edit", (req, res) => {
    res.status(200).render("recipes-edit", {
        title: "Edit Recipe",
    });
});

// Update recipe and save to database.
recipesRouter.post("/:id/edit", (req, res) => {
    res.status(200).redirect("/");
});
// ########################################################
// ######################## DELETE ########################
// --- not done
// ########################################################

module.exports = recipesRouter;
