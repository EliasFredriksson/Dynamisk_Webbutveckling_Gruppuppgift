require("dotenv").config();
require("./mongoose.js");

const express = require("express");
const expressHandlebars = require("express-handlebars");
const sass = require("node-sass");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const path = require("path");
const customMorgan = require("./public/js/models/Custom_Morgan_Token");

const recipesRouter = require("./routers/router-recipes");

const app = express();

// ======= CONFIG =======
new customMorgan(morgan, app).enable(); // Custom morgan
app.engine(
  // Configure engine.
  "hbs",
  expressHandlebars.engine({
    extname: ".hbs",
    defaultLayout: "main",
  })
);
app.set("view engine", "hbs"); // Tell which engine to set / use.
app.set("views", path.join(__dirname, "views")); // Tell where the views folder is located.
app.use(cookieParser()); // Used to more easily read cookies.
app.use(express.urlencoded({ extended: true })); //  So we can use froms.
app.use(express.json()); // Tell express to enable json as a valid format for req.body.
app.use(express.static("./src/public")); // Public folder. Css and  JS access.
app.use("/assets", express.static(path.join(__dirname, "./public")));

// ======= ROUTERS =======
app.use("/recipes", recipesRouter);
// ======= ROUTES =======

// Auth Middleware
app.use((req, res, next) => {
  const { token } = req.cookies;

  if (token && jwt.verify(token, process.env.JWTSECRET)) {
    const tokenData = jwt.decode(token, process.env.JWTSECRET);
    res.locals.loggedIn = true;
    res.locals.username = tokenData.username;
    res.locals.userId = tokenData.userId;
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

// Login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  UsersModel.findOne({ username }, (err, user) => {
    if (user && utils.comparePassword(password, user.hashedPassword)) {
      const userData = {
        user: user._id,
        username,
      };
      const accessToken = jwt.sign(userData, process.env.JWTSECRET);

      res.cookie("token", accessToken);
      res.redirect("/");
    } else {
      res.status(400).send("login Failed");
    }
  });
});

// Logout
app.post("/logout", (req, res) => {
  res.cookie("token", "", { maxAge: 0 });
  res.redirect("/");
});

// ======= LISTEN =======
app.listen(8000, () => {
  console.log("http://localhost:8000/");
});
