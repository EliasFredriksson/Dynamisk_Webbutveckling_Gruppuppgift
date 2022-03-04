const mongoose = require("mongoose");
const settings = require("./settings");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const CommentsModel = require("./models/CommentsModel");
const RecipesModel = require("./models/RecipesModel");

// Validates information which is to be passed into a new recipe schema.
const validateRecipe = (
    name,
    chefId,
    description,
    image,
    ingredients,
    comments
) => {
    if (typeof name !== "string" || name.length <= 0) throw "Invalid Name";
    // ############## TEMPORARY ##############
    // Until we have valid users to use.
    chefId = new mongoose.Types.ObjectId();
    // #######################################
    if (!mongoose.Types.ObjectId.isValid(chefId)) throw "Invalid ID";
    if (typeof description !== "string" || description.length <= 0)
        throw "Invalid description";
    // Validation of image here (If we implement it).
    if (!Array.isArray(ingredients)) throw "Invalid ingredients";
    ingredients.forEach((entry) => {
        // Check all nessecary properties exists.
        if (!("ingredient" in entry)) throw "Missing ingredient name";
        if (!("amount" in entry)) throw "Missing ingredient amount";
        if (!("unit" in entry)) throw "Missing ingredient unit";
        if (!("category" in entry)) throw "Missing ingredient category";

        // Check if properties are of expected type and contains expected value(s);
        // === Ingredient (name) ===
        if (
            typeof entry.ingredient !== "string" ||
            entry.ingredient.length <= 0
        )
            throw "Invalid ingredient name";
        // === Amount ===
        if (typeof entry.amount !== "number" || entry.amount <= 0)
            throw "Invalid ingredient amount";
        // === Unit ===
        if (
            typeof entry.unit !== "string" ||
            !settings.INGREDIENT_UNITS.includes(entry.unit.toLowerCase())
        )
            throw "Invalid ingredient unit";
        // === Categories ===

        if (
            typeof entry.category !== "string" ||
            !settings.INGREDIENT_CATEGORIES.includes(
                entry.category.toLowerCase()
            )
        )
            throw "Invalid category";
    });
    if (!Array.isArray(comments)) throw "Invalid comments";
    comments.forEach((entry) => {
        if (typeof entry.text !== "string" || entry.text.length <= 0)
            throw "Invalid comment text.";
        if (!mongoose.Types.ObjectId.isValid(entry.user))
            throw "Invalid comment userId.";
    });
};

const validateComment = (text, userId) => {
    if (typeof text !== "string" || text.length <= 0)
        throw "Invalid comment text.";
    if (!mongoose.Types.ObjectId.isValid(userId))
        throw "Invalid comment userId.";
};

const comparePassword = (password, hash) => {
    const correct = bcrypt.compareSync(password, hash);
    return correct;
};

const forceAuthorize = (req, res, next) => {
    const { token } = req.cookies;

    if (token && jwt.verify(token, process.env.JWTSECRET)) {
        next();
    } else {
        res.sendStatus(401);
    }
};

const hashPassword = (password) => {
    const hashValue = bcrypt.hashSync(password, 12);
    return hashValue;
};

function validateUser(user) {
    let valid = true;
    valid = valid && user.username;
    valid = valid && user.username.length > 0;
    valid = valid && user.password === user.confirmPassword;
    valid = valid && user.password.length > 0;
    valid = valid && user.email === user.confirmemail;
    valid =
        valid &&
        user.email
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    return valid;
}

const forceOwnComment = async (req, res, next) => {
    try {
        const comment = await CommentsModel.findById(req.params.commentId);
        if (comment) {
            if (comment.userId.toString() === res.locals.id) {
                res.locals.ownComment = true;
            } else {
                res.locals.ownComment = false;
            }
        } else {
            res.locals.ownComment = false;
        }
        next();
    } catch (error) {
        res.sendStatus(500);
    }
};

const forceOwnRecipe = async (req, res, next) => {
    try {
        const recipe = await RecipesModel.findById(req.params.id);

        if (recipe) {
            if (recipe.chef.toString() === res.locals.id) {
                res.locals.ownRecipe = true;
            } else {
                res.locals.ownRecipe = false;
            }
        } else {
            res.locals.ownRecipe = false;
        }
        next();
    } catch (error) {
        res.sendStatus(500);
    }
};

module.exports = {
    validateComment,
    validateRecipe,
    comparePassword,
    forceAuthorize,
    forceOwnComment,
    forceOwnRecipe,
    hashPassword,
    validateUser,
};
