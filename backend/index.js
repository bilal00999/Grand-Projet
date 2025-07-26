/* eslint-env node */
require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "https://recipe-app-frontend.vercel.app",
      "http://localhost:5174",
    ],
    credentials: true,
  })
);
app.use(express.json());

app.options(
  "/ai-recipe",
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "https://recipe-app-frontend.vercel.app",
      "http://localhost:5174",
    ],
    credentials: true,
  })
);

app.post("/ai-recipe", async (req, res) => {
  try {
    let { ingredients } = req.body;
    console.log("Received ingredients:", ingredients);
    if (!ingredients || !Array.isArray(ingredients)) {
      return res.status(400).json({ error: "Ingredients must be an array" });
    }
    // Join array into a string for n8n
    const ingredientsString = ingredients.join(", ");
    console.log("Sending to n8n:", ingredientsString);
    // Send to n8n webhook
    const response = await axios.post(process.env.N8N_WEBHOOK_URL, {
      ingredients: ingredientsString,
    });
    // Return the recipe from n8n
    res.json({ recipe: response.data });
  } catch (error) {
    console.error("Error generating recipe:", error.message);
    res.status(500).json({ error: "Failed to generate recipe" });
  }
});

app.get("/", (req, res) => {
  res.send("Recipe AI Backend is running.");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
