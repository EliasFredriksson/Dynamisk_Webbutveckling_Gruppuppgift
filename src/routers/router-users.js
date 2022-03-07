const express = require("express");
const { default: mongoose } = require("mongoose");
const UsersModels = require("../models/UsersModels.js");
const RecipesModel = require("../models/RecipesModel.js");
const utils = require("../utils.js");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { validate } = require("../models/UsersModels.js");
const passport = require("passport");

const usersRouter = express.Router();

//==== ROUTES ====\\

usersRouter.get("/create", (req, res) => {
    res.render("users-create");
});

//Post: / users-create
usersRouter.post("/create", async (req, res) => {
    const validateUser = {
        username: req.body.username,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        email: req.body.email,
        confirmemail: req.body.confirmemail,
    };
    if (utils.validateUser(validateUser)) {
        const { username, email, password, confirmPassword, confirmemail } =
            req.body;
        UsersModels.findOne({ username }, async (err, user) => {
            if (user) {
                res.send(409).redirect("/");
            } else if (password !== confirmPassword) {
                res.send("Password dont match");
            } else {
                const newUser = new UsersModels({
                    username: username,
                    hashedPassword: utils.hashPassword(password),

                    email: email,
                    recipes: [],
                    image: "Temporary image string",
                });

                await newUser.save();
                res.redirect("/");
            }
        });
    } else {
        res.status(401).send("Fel på inmatad data");
    }
});

//Get: / users-edit
usersRouter.get("/edit", utils.forceAuthorize, async (req, res) => {
    const user = await UsersModels.findById(req.params.id).lean();
    console.log(user);
    res.render("users-edit", user);
});

//Post: / users-edit
usersRouter.post("/edit", utils.forceAuthorize, async (req, res) => {
    const id = res.locals.id;

    console.log("BODY:\n", req.body);

    const validateUser = {
        username: req.body.username,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        email: req.body.email,
        confirmemail: req.body.confirmemail,
    };
    if (utils.validateUser(validateUser)) {
        UsersModels.findByIdAndUpdate(
            id,
            {
                username: req.body.username,
                hashedPassword: utils.hashPassword(req.body.password),
                email: req.body.email,
            },
            (error, docs, result) => {
                if (error) throw error;
                else res.status(200).redirect("/");
            }
        );
    } else {
        res.status(409).send("Fel inmatade data");
    }
});

//Post / Delete
usersRouter.post("/delete", utils.forceAuthorize, async (req, res) => {
    const id = res.locals.id;
    UsersModels.findOneAndDelete({ _id: id }, (err) => {
        res.clearCookie("token");
        if (err) res.status(500).redirect(`/users/${req.params.id}`);
        else res.status(200).redirect("/");
    });
});

// Login
usersRouter.post("/login", async (req, res) => {
    const { username, password } = req.body;
    UsersModels.findOne({ username }, (err, user) => {
        if (user && utils.comparePassword(password, user.hashedPassword)) {
            const userData = {
                _id: user._id,
                username,
            };
            console.log(userData);
            const accessToken = jwt.sign(userData, process.env.JWTSECRET);

            res.cookie("token", accessToken);
            res.redirect("/");
        } else {
            res.status(400).send("login Failed");
        }
    });
});

//Login with google
usersRouter.get(
  "/login/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

usersRouter.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/create" }),
  async (req, res) => {
    const googleId = req.user.id;

    UsersModels.findOne({ googleId }, async (err, user) => {
      const userData = { username: req.user.displayName };

      if (user) {
        userData.id = user._id;
      } else {
        const newUser = new UsersModels({
          googleId,
          username: req.user.displayName,
          email: req.user.emails[0].value,
          image: req.user.photos[0].value,
        });
        console.log(newUser);
        const result = await newUser.save();
        userData._id = result._id;
      }

      const accessToken = jwt.sign(userData, process.env.JWTSECRET);

      res.cookie("token", accessToken);
      res.redirect("/");
    });
  }
);

// Logout
usersRouter.post("/logout", utils.forceAuthorize, (req, res) => {
    res.clearCookie("token");
    res.redirect("/");
});

//Get id
usersRouter.get("/:id", async (req, res) => {
    const id = req.params.id;
    const user = await UsersModels.findById(req.params.id).lean();
    const recipes = await RecipesModel.find({ chef: id }).lean();

    res.render("users-single", { recipes: recipes, user: user });
});

module.exports = usersRouter;
