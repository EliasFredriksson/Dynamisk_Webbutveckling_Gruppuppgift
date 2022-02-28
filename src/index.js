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
app.engine(
    // Configure engine.
    "hbs",
    expressHandlebars.engine({
        extname: ".hbs",
        defaultLayout: "main",
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

// ======= ROUTERS =======
app.use("/recipes", recipesRouter);
// ======= ROUTES =======
// Home
app.get("/", (req, res) => {
    res.render("home", {
        title: "Home",
    });
});

// ======= LISTEN =======
app.listen(8000, () => {
    console.log("http://localhost:8000/");
});
