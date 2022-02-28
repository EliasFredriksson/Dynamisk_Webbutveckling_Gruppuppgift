const express = require("express");
const { default: mongoose } = require("mongoose");
const UsersModels = require("../models/UsersModels.js");

const usersRouter = express.Router();

//==== ROUTES ====\\

usersRouter.get("/create", (req, res) => {
  res.render("users-create");
  console.log("console log create get");
});

//Post: / users-create
usersRouter.post("/create", async (req, res) => {
  const { username, hashedPassword, email, recipes, image } = req.body;
  console.log("console log post create");

  const newUser = new UsersModels({
    username: username,
    hashedPassword: "temporary password",
    email: email,
    recipes: [],
    image: "Temporary image string",
  });
  await newUser.save();
  res.redirect("/");
});

//Get: / users-edit
usersRouter.get("/edit", async (req, res) => {
  console.log("console log get edit");

  const userId = "621cab72599c287c4d1ec784";
  const user = await UsersModels.findById(userId).lean();
  res.render("users-edit", {
    user: user,
  });
});

//Post: / users-edit
usersRouter.post("/edit", async (req, res) => {
  console.log("console log  post edit");
  const { username, hashedPassword, email, recipes, image } = req.body;
  //Temporary for testing
  const userId = "621cf8afb2fc1a28d502a8cd";
  //############
  await UsersModels.findByIdAndUpdate(userId, {
    username: username,
    hashedPassword: "temporary password",
    email: email,
    recipes: [],
    image: image,
  });

  res.redirect("/");
});

// Delete recipe
usersRouter.post("/delete", async (req, res) => {
  const userId = "621cf8c7b2fc1a28d502a8d1";
  UsersModels.findByIdAndDelete(
    { _id: new mongoose.Types.ObjectId(userId) },
    (error, docs) => {
      if (error) res.status(500).redirect(`/users/${req.params.id}`);
      else res.status(200).redirect("/");
    }
  );
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
