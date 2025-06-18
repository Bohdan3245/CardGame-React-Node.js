const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  friendList: {
    type: [String],
    default: [],
  },
  friendRequest: {
    type: [String],
    default: [],
  },
  socketID: {
    type: String,
  },
});

module.exports = mongoose.model("User", UserSchema);
