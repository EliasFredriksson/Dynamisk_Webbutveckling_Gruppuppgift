const express = require("express");
const { default: mongoose } = require("mongoose");
const UsersModels = require("../models/UsersModels.js");
const utils = require("../utils.js");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const usersRouter = express.Router();

//==== ROUTES ====\\

usersRouter.get("/create", (req, res) => {
  res.render("users-create");
  console.log("console log create get");
});

//Post: / users-create
usersRouter.post("/create", async (req, res) => {
  const { username, password, confirmPassword, email, recipes, image } =
    req.body;
  console.log("console log post create");
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
});

//Get: / users-edit
usersRouter.get("/edit", utils.forceAuthorize, async (req, res) => {
  const user = await UsersModels.findById(req.params.id).lean();
  console.log(user);
  res.render("users-edit", user);
});

//Post: / users-edit
usersRouter.post("/edit", utils.forceAuthorize, async (req, res) => {
  console.log("Första");
  console.log(req.cookies);
  console.log(req.cookies._id, "KUKEN");
  UsersModels.findOne({ username }, async (err, user) => {
    if (user) {
      res.send(409).redirect("/");
    } else if (password !== confirmPassword) {
      res.send("Password dosen't match");
    } else {
      await UsersModels.findByIdAndUpdate(req.params.id, {
        username: username,
        hashedPassword: utils.hashPassword(password),
        email: email,
        image: "Temporary image string",
      });

      res.redirect("/");
    }
  });
});

// Delete recipe
usersRouter.post("/delete", async (req, res) => {
  //#####Temporary user id for testing###############
  const userId = "621cf8c7b2fc1a28d502a8d1";
  //##############################
  UsersModels.findByIdAndDelete(
    { _id: new mongoose.Types.ObjectId(userId) },
    (error, docs) => {
      if (error) res.status(500).redirect(`/users/${req.params.id}`);
      else res.status(200).redirect("/");
    }
  );
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
      const accessToken = jwt.sign(userData, process.env.JWTSECRET);

      res.cookie("token", accessToken);
      res.redirect("/");
    } else {
      res.status(400).send("login Failed");
    }
  });
});

// Logout
usersRouter.post("/logout", (req, res) => {
  res.cookie("token", "", { maxAge: 0 });
  res.redirect("/");
});

//Get id
usersRouter.get("/:id", async (req, res) => {
  const user = await UsersModels.findById(req.params.id);
  // UsersModels.find({ _id: new mongoose.Types.ObjectId(req.params.id) });

  try {
    res.send(user);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = usersRouter;
