/* eslint-disable */
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:5174",
      "https://recipe-app-frontend.vercel.app",
      "https://grand-projet-omega.vercel.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// Connect to MongoDB
mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const recipesRoute = require("./routes/recipes");
app.use("/recipes", recipesRoute);

// Add OPTIONS handling for recipes endpoint
app.options(
  "/recipes",
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:5174",
      "https://recipe-app-frontend.vercel.app",
      "https://grand-projet-omega.vercel.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Add OPTIONS handling for ai-recipe endpoint
app.options(
  "/ai-recipe",
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:5174",
      "https://recipe-app-frontend.vercel.app",
      "https://grand-projet-omega.vercel.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Add AI recipe generation endpoint
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

// Health check route
app.get("/", (req, res) => {
  res.send("API is running");
});

// Handle OPTIONS for root path
app.options(
  "/",
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:5174",
      "https://recipe-app-frontend.vercel.app",
      "https://grand-projet-omega.vercel.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
