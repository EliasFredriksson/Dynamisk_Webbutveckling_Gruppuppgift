const RecipesModel = require("./models/RecipesModel");

const checkForRecipePrototype = (req, res, next) => {
    if (res.locals.recipePrototype === undefined) {
        res.locals.recipePrototype = {
            name: "",
            chefId: res.locals.userId,
            description: "",
            ingredients: [],
        };
        res.status(200).redirect("/create");
    }

    try {
        await RecipesModel.validate(res.locals.recipePrototype);
    } catch (error) {
        res.locals.recipePrototype = undefined;
        res.status(400).redirect("/create");
    }
    next();
};

module.exports = {
    checkForRecipePrototype,
};
