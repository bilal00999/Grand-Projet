/* eslint-disable */
const express = require("express");
const Recipe = require("../models/Recipe");
const supabaseAuth = require("../middleware/auth");

const router = express.Router();

// Create a new recipe
router.post("/", supabaseAuth, async (req, res) => {
  console.log("=== Recipe POST endpoint hit ===");
  console.log("Request headers:", req.headers);
  console.log("Request body:", req.body);
  console.log("User:", req.user);

  try {
    const { title, ingredients, instructions, cookTime } = req.body;
    console.log("Backend received cookTime:", cookTime);
    console.log("Backend received body:", req.body);
    const userId = req.user.sub; // Supabase user id
    console.log("User ID:", userId);

    if (!title || !ingredients || !instructions) {
      console.log(
        "Missing fields - title:",
        !!title,
        "ingredients:",
        !!ingredients,
        "instructions:",
        !!instructions
      );
      return res.status(400).json({ error: "Missing fields" });
    }

    const recipe = new Recipe({
      userId,
      title,
      ingredients,
      instructions,
      cookTime,
    });
    console.log("Recipe object before save:", recipe);
    await recipe.save();
    console.log("Recipe saved successfully with ID:", recipe._id);
    console.log("Recipe saved with cookTime:", recipe.cookTime);
    res.status(201).json(recipe);
  } catch (err) {
    console.error("Error saving recipe:", err);
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
