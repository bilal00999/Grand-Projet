/* eslint-disable */
const express = require("express");
const Recipe = require("../models/Recipe");
const supabaseAuth = require("../middleware/auth");

const router = express.Router();

// Create a new recipe
router.post("/", supabaseAuth, async (req, res) => {
  try {
    const { title, ingredients, instructions } = req.body;
    const userId = req.user.sub; // Supabase user id
    if (!title || !ingredients || !instructions) {
      return res.status(400).json({ error: "Missing fields" });
    }
    const recipe = new Recipe({ userId, title, ingredients, instructions });
    await recipe.save();
    res.status(201).json(recipe);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get all recipes for the logged-in user
router.get("/", supabaseAuth, async (req, res) => {
  try {
    const userId = req.user.sub;
    const recipes = await Recipe.find({ userId }).sort({ createdAt: -1 });
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get a single recipe by ID for the logged-in user
router.get("/:id", supabaseAuth, async (req, res) => {
  try {
    const userId = req.user.sub;
    const recipe = await Recipe.findOne({ _id: req.params.id, userId });
    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
