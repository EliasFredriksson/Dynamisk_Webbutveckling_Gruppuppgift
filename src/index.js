require("dotenv").config();
require("./mongoose.js");

const express = require("express");
const expressHandlebars = require("express-handlebars");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const path = require("path");
const customMorgan = require("./public/js/models/Custom_Morgan_Token");

const recipesRouter = require("./routers/router-recipes");
const usersRouter = require("./routers/router-users");
const UsersModels = require("./models/UsersModels.js");
const RecipesModel = require("./models/RecipesModel.js");
const { send } = require("process");

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

// ======= ROUTES =======

// Auth Middleware
app.use((req, res, next) => {
  const { token } = req.cookies;

  if (token && jwt.verify(token, process.env.JWTSECRET)) {
    const tokenData = jwt.decode(token, process.env.JWTSECRET);
    res.locals.loggedIn = true;
    res.locals.username = tokenData.username;
    res.locals.id = tokenData._id;
  } else {
    res.locals.loggedIn = false;
  }
  next();
});

// Home
app.get("/", (req, res) => {
  res.render("home", {
    title: "Home",
  });
});

// ======= ROUTERS =======
app.use("/recipes", recipesRouter);
app.use("/users", usersRouter);

//Search Recipes
app.get("/search", async (req, res) => {
  const recipes = await RecipesModel.find().populate("chef").lean();
  const users = await UsersModels.find().lean();

  const searchTerm = req.query.search;
  let foundRecipes = [];
  let foundUsers = [];

  if (!searchTerm || searchTerm.length <= 0) {
    foundRecipes = recipes;
    foundUsers = users;
  } else {
    for (let i = 0; i < recipes.length; i++) {
      const recipe = recipes[i];

      if (recipe.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        foundRecipes.push(recipe);
      }
    }
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      if (user.username.toLowerCase().includes(searchTerm.toLowerCase())) {
        foundUsers.push(user);
      }
    }
  }

  res.render("search", { foundRecipes: foundRecipes, foundUsers: foundUsers });
});

app.use("/", (req, res) => {
  res.sendStatus(404);
});
// ======= 404 ROUTE =======
// ======= LISTEN =======
app.listen(8000, () => {
  console.log("http://localhost:8000/");
});
