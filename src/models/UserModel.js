const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, required: true, default: false },
    phone: { type: Number },
    address: { type: String },
    avatar: { type: String },
    city: { type: String },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  {
    timestamps: true,
  }
);
const User = mongoose.model("User", userSchema);
module.exports = User;
