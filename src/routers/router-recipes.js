const express = require("express");

const settings = require("../settings");

const {
    validateRecipe,
    validateComment,
    forceAuthorize,
    forceOwnComment,
    forceOwnRecipe,
} = require("../utils");
const RecipesModel = require("../models/RecipesModel.js");
const UsersModel = require("../models/UsersModels.js");
const CommentsModel = require("../models/CommentsModel");
const mongoose = require("mongoose");

const recipesRouter = express.Router();

// ===== ROUTES =====
// ####################### CREATE #######################
// Go to create recipe page.
recipesRouter.get("/create", forceAuthorize, (req, res) => {
    // res.status(200).send("Sent back to create page.");
    res.render("recipes-create", {
        title: "Create Recipe",
        ingredientUnits: settings.INGREDIENT_UNITS,
        ingredientCategories: settings.INGREDIENT_CATEGORIES,
        jsFiles: JSON.stringify(["/js/recipes-create.js"]),
    });
});

// Create new recipe and save to database.
// MISSING:
//      Adding the recipe to the currently logged in users recipe.
recipesRouter.post("/create", forceAuthorize, async (req, res) => {
    const { name, description, image, ingredients } = req.body;
    try {
        if (!res.locals.loggedIn) throw "Not logged in.";
        validateRecipe(
            name,
            res.locals.id,
            description,
            image,
            ingredients,
            []
        );
        const newRecipe = new RecipesModel({
            name: name,
            chef: new mongoose.Types.ObjectId(res.locals.id),
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
            .populate("comments.comment")
            .lean();
        const chef = await UsersModel.findById(recipe.chef).lean();

        if (res.locals.loggedIn) {
            const user = await UsersModel.findById(res.locals.id);
            res.locals.loggedInFavorites = user.favorites;
        }

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
            jsFiles: JSON.stringify(["/js/recipes-single.js"]),
        });
    } catch (error) {
        console.log("\n\nERROR:", error);
        res.status(400).redirect("/");
    }
});
// ######################## UPDATE ########################
// Go to Update (Edit) recipe page.
recipesRouter.get("/:id/edit", forceAuthorize, forceOwnRecipe, (req, res) => {
    RecipesModel.findById(req.params.id, (error, recipe) => {
        if (error) res.status(500).redirect(`/`);
        else {
            if (recipe) {
                res.status(200).render("recipes-edit", {
                    title: "Edit Recipe",
                    recipe: recipe,
                    strigifiedIngredients: JSON.stringify(recipe.ingredients),
                    jsFiles: JSON.stringify(["/js/recipes-create.js"]),
                });
            } else {
                res.status(400).redirect(`/`);
            }
        }
    }).lean();
});

// Update recipe and save to database.
recipesRouter.post("/:id/edit", forceAuthorize, forceOwnRecipe, (req, res) => {
    const { name, chefId, description, image, ingredients } = req.body;
    try {
        validateRecipe(
            name,
            res.locals.id,
            description,
            image,
            ingredients,
            []
        );
        RecipesModel.findByIdAndUpdate(
            req.params.id,
            {
                name: name,
                chef: new mongoose.Types.ObjectId(res.locals.id),
                description: description,
                image: image,
                ingredients: ingredients,
            },
            (error, result) => {
                if (error) res.sendStatus(500);
                else res.status(200).send(result._id);
            }
        );
    } catch (error) {
        console.log("\n\nERROR: ", error);
        res.status(400).redirect("/");
    }
});
// ######################## DELETE ########################
// Delete recipe
recipesRouter.post(
    "/:id/delete",
    forceAuthorize,
    forceOwnRecipe,
    async (req, res) => {
        RecipesModel.findByIdAndDelete(req.params.id, (error, docs) => {
            if (error) res.status(500).redirect(`/recipe/${req.params.id}`);
            else res.status(200).redirect("/");
        });
    }
);

// ######################## COMMENT ########################
// Create comment
recipesRouter.post("/:id/comments/add", forceAuthorize, async (req, res) => {
    try {
        if (!res.locals.loggedIn) throw "Not logged in.";
        validateComment(req.body.text, res.locals.id);

        const newComment = new CommentsModel({
            text: req.body.text,
            userId: new mongoose.Types.ObjectId(res.locals.id),
            username: res.locals.username,
            profileImage: res.locals.profileImage,
        });
        const commentResult = await newComment.save();
        RecipesModel.findByIdAndUpdate(
            req.params.id,
            {
                $push: { comments: { comment: commentResult._id } },
            },
            (error, docs, result) => {
                if (error)
                    res.status(500).redirect("/recipes/" + req.params.id);
                else res.status(200).redirect("/recipes/" + req.params.id);
            }
        );
    } catch (error) {
        console.log(
            "\n\n================= ERROR =================\n",
            error,
            "\n\n"
        );
        res.status(400).send(error);
    }
});

// Edit comment
recipesRouter.post(
    "/:id/comments/edit/:commentId",
    forceAuthorize,
    forceOwnComment,
    async (req, res) => {
        try {
            if (!res.locals.ownComment) throw "Not own comment.";
            validateComment(req.body.text, req.params.commentId);
            CommentsModel.findByIdAndUpdate(
                req.params.commentId,
                {
                    text: req.body.text,
                },
                (error, docs, result) => {
                    if (error) res.sendStatus(500);
                    else res.sendStatus(200);
                }
            );
        } catch (error) {
            console.log("\n\nERROR: ", error);
            res.status(400).redirect("/");
        }
    }
);

// Delete comment
recipesRouter.post(
    "/:id/comments/remove/:commentId",
    forceAuthorize,
    forceOwnComment,
    async (req, res) => {
        RecipesModel.findByIdAndUpdate(
            req.params.id,
            {
                $pull: {
                    comments: {
                        comment: new mongoose.Types.ObjectId(
                            req.params.commentId
                        ),
                    },
                },
            },
            (error, docs, result) => {
                if (error)
                    res.status(500).redirect("/recipes/" + req.params.id);
                else {
                    CommentsModel.findByIdAndDelete(
                        req.params.commentId,
                        (error, docs) => {
                            if (error)
                                res.status(500).redirect(
                                    `/recipe/${req.params.id}`
                                );
                            else
                                res.status(200).redirect(
                                    "/recipes/" + req.params.id
                                );
                        }
                    );
                }
            }
        );
    }
);
// ########################################################

module.exports = recipesRouter;
