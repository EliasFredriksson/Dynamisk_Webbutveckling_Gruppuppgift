const mongoose = require("mongoose");

const CommentsSchema = new mongoose.Schema({
  text: { type: String, required: true },
  userId: {
    type: mongoose.Types.ObjectId,
    required: true,
  },
  username: { type: String, required: true },
  profileImage: { type: String },
});

const CommentsModel = mongoose.model("comments", CommentsSchema);

module.exports = CommentsModel;
