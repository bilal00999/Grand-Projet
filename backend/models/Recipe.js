/* eslint-disable */
const mongoose = require("mongoose");

const RecipeSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  ingredients: { type: [String], required: true },
  instructions: { type: String, required: true },
  cookTime: { type: Number, default: 30 },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Recipe", RecipeSchema);
