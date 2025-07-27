/* eslint-env node */
require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

// Enable CORS for all routes
app.use((req, res, next) => {
  const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",
    "https://recipe-app-frontend.vercel.app",
    "https://grand-projet-omega.vercel.app",
    "https://grand-projet-psi.vercel.app",
  ];

  const origin = req.headers.origin;
  console.log("Request origin:", origin);
  console.log("Allowed origins:", allowedOrigins);

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    console.log("Set CORS origin to:", origin);
  } else {
    console.log("Origin not in allowed list:", origin);
  }

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "86400");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request");
    res.status(200).end();
    return;
  }

  next();
});

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

// Explicit OPTIONS handler for ai-recipe endpoint
app.options("/ai-recipe", (req, res) => {
  const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",
    "https://recipe-app-frontend.vercel.app",
    "https://grand-projet-omega.vercel.app",
    "https://grand-projet-psi.vercel.app",
  ];

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Max-Age", "86400");

  console.log("OPTIONS request for /ai-recipe from origin:", origin);
  res.status(200).end();
});

app.post("/ai-recipe", async (req, res) => {
  console.log("AI recipe endpoint hit");
  console.log("Request headers:", req.headers);
  console.log("Request origin:", req.headers.origin);

  // Set CORS headers explicitly for this endpoint
  const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",
    "https://recipe-app-frontend.vercel.app",
    "https://grand-projet-omega.vercel.app",
    "https://grand-projet-psi.vercel.app",
  ];

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
