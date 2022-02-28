const mongoose = require("mongoose");
const settings = require("./settings");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Validates information which is to be passed into a new recipe schema.
const validateRecipe = (name, chefId, description, image, ingredients) => {
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
    if (!("categories" in entry)) throw "Missing ingredient categories";

    // Check if properties are of expected type and contains expected value(s);
    // === Ingredient (name) ===
    if (typeof entry.ingredient !== "string" || entry.ingredient.length <= 0)
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
    if (!Array.isArray(entry.categories)) throw "Invalid ingredient categories";
    entry.categories.forEach((category) => {
      if (
        typeof category !== "string" ||
        !settings.INGREDIENT_CATEGORIES.includes(category.toLowerCase())
      )
        throw "Invalid category";
    });
  });
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

module.exports = {
  validateRecipe,
  comparePassword,
  forceAuthorize,
};
