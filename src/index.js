require("dotenv").config();
require("./mongoose.js");
require("./passport.js");

const express = require("express");
const expressHandlebars = require("express-handlebars");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const path = require("path");
const customMorgan = require("./public/js/models/Custom_Morgan_Token");
const fileUpload = require("express-fileupload");

const recipesRouter = require("./routers/router-recipes");
const usersRouter = require("./routers/router-users");
const RecipesModel = require("./models/RecipesModel.js");
const UsersModels = require("./models/UsersModels.js");

const app = express();

// ======= CONFIG =======
app.engine(
    // Configure engine.
    "hbs",
    expressHandlebars.engine({
        extname: ".hbs",
        defaultLayout: "main",
        helpers: {
            checkIfIdAreSame: (idOne, idTwo) => {
                return idOne == idTwo;
            },
            checkIfInFavorites: (recipeId, favorites) => {
                let inFavs = false;
                favorites.forEach((entry) => {
                    if (entry.recipe.toString() == recipeId) inFavs = true;
                });
                return inFavs;
            },
        },
    })
);
app.use(express.static("./src/public")); // Public folder. Css and  JS access.
new customMorgan(morgan, app).enable(); // Custom morgan

app.set("view engine", "hbs"); // Tell which engine to set / use.
app.set("views", path.join(__dirname, "views")); // Tell where the views folder is located.
app.use(cookieParser()); // Used to more easily read cookies.
app.use(express.urlencoded({ extended: true })); //  So we can use froms.
app.use(express.json()); // Tell express to enable json as a valid format for req.body.
app.use("/assets", express.static(path.join(__dirname, "./public")));
app.use(fileUpload());

// ======= ROUTES =======

// Auth Middleware
app.use((req, res, next) => {
    const { token } = req.cookies;

    if (token && jwt.verify(token, process.env.JWTSECRET)) {
        const tokenData = jwt.decode(token, process.env.JWTSECRET);
        res.locals.loggedIn = true;
        res.locals.username = tokenData.username;
        res.locals.id = tokenData._id;
        res.locals.profileImage = tokenData.profileImage;
    } else {
        res.locals.loggedIn = false;
    }
    next();
});

// Home
app.get("/", (req, res) => {
    res.render("home", {
        title: "Recept Haket",
        jsFiles: JSON.stringify(["/js/home.js"]),
    });
});

// ======= ROUTERS =======
app.use("/recipes", recipesRouter);
app.use("/users", usersRouter);

// ======= 404 ROUTE =======
app.use("/", (req, res) => {
    res.sendStatus(404);
});
// ======= LISTEN =======
app.listen(8000, () => {
    console.log("http://localhost:8000/");
});
