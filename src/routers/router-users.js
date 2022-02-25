const express = require("express");

const UsersModels = require("../models/UsersModels.js");

const usersRouter = express.Router();

//==== ROUTES ====
usersRouter.get("/:id", (req, res) => {
  res.status(200).send("Users");
});

usersRouter.get("/create", (req, res) => {
  res.render("users-create");
});

module.exports = usersRouter;
