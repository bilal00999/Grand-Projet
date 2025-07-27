// Recipe generation service using OpenAI API

class RecipeService {
  constructor() {
    // Use Vite environment variables (available in browser)
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    this.apiBase =
      import.meta.env.VITE_OPENAI_API_BASE || "https://api.openai.com/v1";
    const backendUrl =
      import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
    // Ensure no trailing slash to avoid double slashes
    this.backendUrl = backendUrl.replace(/\/$/, "");
  }

  extractCookTime(timeString) {
    if (!timeString) return null;
    // Extract number from strings like "40 minutes", "25 min", "1 hour", etc.
    const match = timeString.toString().match(/(\d+)/);
    return match ? parseInt(match[1]) : null;
  }

  async generateRecipe(
    ingredients,
    dietaryPreferences = "",
    additionalRequirements = ""
  ) {
    try {
      // For demo purposes, we'll use a mock response if no API key is available
      if (!this.apiKey) {
        return this.generateMockRecipe(ingredients, dietaryPreferences);
      }

      const prompt = this.buildPrompt(
        ingredients,
        dietaryPreferences,
        additionalRequirements
      );

      const response = await fetch(`${this.apiBase}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content:
                "You are a professional chef and recipe creator. Generate detailed, practical recipes based on the ingredients provided. Always include cooking time, servings, difficulty level, and nutritional information.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: 1500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const recipeText = data.choices[0].message.content;

      return this.parseRecipeResponse(recipeText, ingredients);
    } catch (error) {
      console.error("Error generating recipe:", error);
      // Fallback to mock recipe on error
      return this.generateMockRecipe(ingredients, dietaryPreferences);
    }
  }

  buildPrompt(ingredients, dietaryPreferences, additionalRequirements) {
    let prompt = `Create a detailed recipe using these ingredients: ${ingredients}\n\n`;

    if (dietaryPreferences && dietaryPreferences !== "none") {
      prompt += `Dietary requirements: ${dietaryPreferences}\n`;
    }

    if (additionalRequirements) {
      prompt += `Additional requirements: ${additionalRequirements}\n`;
    }

    prompt += `
Please provide the recipe in the following format:

TITLE: [Recipe name]
DESCRIPTION: [Brief description]
COOK_TIME: [Time in minutes]
SERVINGS: [Number of servings]
DIFFICULTY: [Easy/Medium/Hard]
TAGS: [Comma-separated tags like "Quick, Healthy, One-pan"]

INGREDIENTS:
- [Ingredient 1 with quantity]
- [Ingredient 2 with quantity]
...

INSTRUCTIONS:
1. [Step 1]
2. [Step 2]
...

NUTRITION (per serving):
Calories: [number]
Protein: [amount]
Carbs: [amount]
Fat: [amount]

Make sure the recipe is practical, uses the provided ingredients as main components, and includes clear step-by-step instructions.`;

    return prompt;
  }

  parseRecipeResponse(recipeText, originalIngredients) {
    // Parse the structured response from OpenAI
    const lines = recipeText.split("\n").filter((line) => line.trim());

    const recipe = {
      id: Date.now().toString(),
      title: "",
      description: "",
      cookTime: 30,
      servings: 4,
      difficulty: "Medium",
      tags: [],
      ingredients: [],
      instructions: [],
      nutrition: {
        calories: 0,
        protein: "0g",
        carbs: "0g",
        fat: "0g",
      },
      originalIngredients: originalIngredients,
      createdAt: new Date().toISOString(),
    };

    let currentSection = "";

    for (const line of lines) {
      const trimmedLine = line.trim();

      if (trimmedLine.startsWith("TITLE:")) {
        recipe.title = trimmedLine.replace("TITLE:", "").trim();
      } else if (trimmedLine.startsWith("DESCRIPTION:")) {
        recipe.description = trimmedLine.replace("DESCRIPTION:", "").trim();
      } else if (trimmedLine.startsWith("COOK_TIME:")) {
        const timeMatch = trimmedLine.match(/(\d+)/);
        if (timeMatch) recipe.cookTime = parseInt(timeMatch[1]);
      } else if (trimmedLine.startsWith("SERVINGS:")) {
        const servingsMatch = trimmedLine.match(/(\d+)/);
        if (servingsMatch) recipe.servings = parseInt(servingsMatch[1]);
      } else if (trimmedLine.startsWith("DIFFICULTY:")) {
        recipe.difficulty = trimmedLine.replace("DIFFICULTY:", "").trim();
      } else if (trimmedLine.startsWith("TAGS:")) {
        const tagsText = trimmedLine.replace("TAGS:", "").trim();
        recipe.tags = tagsText
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag);
      } else if (trimmedLine === "INGREDIENTS:") {
        currentSection = "ingredients";
      } else if (trimmedLine === "INSTRUCTIONS:") {
        currentSection = "instructions";
      } else if (trimmedLine.startsWith("NUTRITION")) {
        currentSection = "nutrition";
      } else if (
        currentSection === "ingredients" &&
        trimmedLine.startsWith("-")
      ) {
        recipe.ingredients.push(trimmedLine.replace("-", "").trim());
      } else if (
        currentSection === "instructions" &&
        /^\d+\./.test(trimmedLine)
      ) {
        recipe.instructions.push(trimmedLine.replace(/^\d+\.\s*/, ""));
      } else if (currentSection === "nutrition") {
        if (trimmedLine.includes("Calories:")) {
          const caloriesMatch = trimmedLine.match(/(\d+)/);
          if (caloriesMatch)
            recipe.nutrition.calories = parseInt(caloriesMatch[1]);
        } else if (trimmedLine.includes("Protein:")) {
          recipe.nutrition.protein = trimmedLine.split(":")[1]?.trim() || "0g";
        } else if (trimmedLine.includes("Carbs:")) {
          recipe.nutrition.carbs = trimmedLine.split(":")[1]?.trim() || "0g";
        } else if (trimmedLine.includes("Fat:")) {
          recipe.nutrition.fat = trimmedLine.split(":")[1]?.trim() || "0g";
        }
      }
    }

    // Fallback values if parsing failed
    if (!recipe.title) recipe.title = "Delicious Recipe";
    if (!recipe.description)
      recipe.description = "A wonderful dish made with your ingredients";
    if (recipe.ingredients.length === 0) {
      recipe.ingredients = originalIngredients
        .split(",")
        .map((ing) => ing.trim())
        .filter((ing) => ing);
    }
    if (recipe.instructions.length === 0) {
      recipe.instructions = [
        "Prepare all ingredients according to the recipe requirements.",
        "Follow standard cooking procedures for the type of dish.",
        "Cook until done and serve hot.",
      ];
    }

    return recipe;
  }

  generateMockRecipe(ingredients, dietaryPreferences) {
    // Generate a realistic mock recipe for demo purposes
    const mockRecipes = [
      {
        title: "Garlic Butter Chicken with Vegetables",
        description:
          "A delicious and healthy one-pan meal featuring tender chicken breast with fresh vegetables in a savory garlic butter sauce.",
        cookTime: 25,
        servings: 4,
        difficulty: "Easy",
        tags: ["Quick", "Healthy", "One-pan"],
        ingredients: [
          "2 large chicken breasts, sliced",
          "2 cups broccoli florets",
          "1 red bell pepper, sliced",
          "3 cloves garlic, minced",
          "3 tbsp butter",
          "2 tbsp olive oil",
          "1 tsp dried thyme",
          "Salt and pepper to taste",
          "1/4 cup chicken broth",
          "2 tbsp fresh parsley, chopped",
        ],
        instructions: [
          "Season chicken slices with salt, pepper, and thyme on both sides.",
          "Heat olive oil in a large skillet over medium-high heat.",
          "Add chicken to the skillet and cook for 5-6 minutes per side until golden brown and cooked through. Remove and set aside.",
          "In the same skillet, add butter and minced garlic. Sauté for 30 seconds until fragrant.",
          "Add broccoli and bell pepper to the skillet. Cook for 4-5 minutes until vegetables are tender-crisp.",
          "Pour in chicken broth and let it simmer for 1-2 minutes.",
          "Return chicken to the skillet and toss everything together.",
          "Garnish with fresh parsley and serve immediately.",
        ],
        nutrition: {
          calories: 285,
          protein: "32g",
          carbs: "8g",
          fat: "14g",
        },
      },
      {
        title: "Mediterranean Vegetable Pasta",
        description:
          "A vibrant pasta dish loaded with fresh vegetables, herbs, and a light olive oil dressing.",
        cookTime: 20,
        servings: 3,
        difficulty: "Easy",
        tags: ["Vegetarian", "Mediterranean", "Quick"],
        ingredients: [
          "12 oz pasta (penne or fusilli)",
          "2 zucchini, diced",
          "1 red bell pepper, chopped",
          "1 cup cherry tomatoes, halved",
          "1/2 red onion, sliced",
          "3 cloves garlic, minced",
          "1/4 cup olive oil",
          "2 tbsp fresh basil, chopped",
          "1/4 cup pine nuts",
          "Salt and pepper to taste",
          "Parmesan cheese for serving",
        ],
        instructions: [
          "Cook pasta according to package directions until al dente. Drain and reserve 1/2 cup pasta water.",
          "Heat olive oil in a large pan over medium heat.",
          "Add onion and garlic, cook for 2-3 minutes until fragrant.",
          "Add zucchini and bell pepper, cook for 5-6 minutes until tender.",
          "Add cherry tomatoes and cook for 2-3 minutes until they start to soften.",
          "Add cooked pasta to the pan and toss with vegetables.",
          "Add pasta water if needed to create a light sauce.",
          "Season with salt, pepper, and fresh basil.",
          "Serve topped with pine nuts and Parmesan cheese.",
        ],
        nutrition: {
          calories: 420,
          protein: "14g",
          carbs: "65g",
          fat: "16g",
        },
      },
    ];

    // Select a recipe based on ingredients or dietary preferences
    let selectedRecipe = mockRecipes[0];

    if (dietaryPreferences === "vegetarian" || dietaryPreferences === "vegan") {
      selectedRecipe = mockRecipes[1];
    }

    // Customize the recipe with user's ingredients
    const userIngredients = ingredients
      .split(",")
      .map((ing) => ing.trim())
      .filter((ing) => ing);
    if (userIngredients.length > 0) {
      // Try to incorporate some user ingredients into the recipe
      selectedRecipe.originalIngredients = ingredients;
    }

    return {
      ...selectedRecipe,
      id: Date.now().toString(),
      originalIngredients: ingredients,
      createdAt: new Date().toISOString(),
    };
  }

  // Save recipe to backend
  async saveRecipeToBackend(recipe, jwt) {
    console.log("=== saveRecipeToBackend called ===");
    console.log("Recipe to save:", recipe);
    console.log("JWT:", jwt ? "Present" : "Missing");
    console.log("Backend URL:", this.backendUrl);

    try {
      // Ensure instructions is a string
      let instructions = recipe.instructions;
      if (Array.isArray(instructions)) {
        instructions = instructions.join("\n");
      } else if (typeof instructions !== "string") {
        instructions = String(instructions);
      }

      // Ensure ingredients is an array
      let ingredients = recipe.ingredients;
      if (typeof ingredients === "string") {
        ingredients = ingredients
          .split(",")
          .map((i) => i.trim())
          .filter(Boolean);
      }

      const requestBody = {
        title: recipe.title,
        ingredients: ingredients,
        instructions: instructions,
        cookTime: (() => {
          console.log("recipe.cookingTime in service:", recipe.cookingTime);
          console.log("recipe.cookTime in service:", recipe.cookTime);
          const extracted =
            this.extractCookTime(recipe.cookingTime) ||
            this.extractCookTime(recipe.cookTime);
          console.log("Extracted cookTime in service:", extracted);
          return extracted || 30;
        })(),
      };

      console.log("Request body to send:", requestBody);

      const response = await fetch(`${this.backendUrl}/recipes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify(requestBody),
      });
      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Response error:", errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      console.log("Save result:", result);
      return result;
    } catch (error) {
      console.error("saveRecipeToBackend error:", error);
      throw error;
    }
  }

  // Fetch recipes from backend
  async fetchRecipesFromBackend(jwt) {
    const response = await fetch(`${this.backendUrl}/recipes`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });
    if (!response.ok) throw new Error("Failed to fetch recipes");
    return await response.json();
  }

  // Fetch a single recipe by ID from backend
  async fetchRecipeByIdFromBackend(id, jwt) {
    const response = await fetch(`${this.backendUrl}/recipes/${id}`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });
    if (!response.ok) throw new Error("Failed to fetch recipe");
    return await response.json();
  }

  // Save recipe to local storage (simulating database)
  saveRecipe(recipe) {
    const savedRecipes = this.getSavedRecipes();
    savedRecipes.unshift(recipe); // Add to beginning of array
    localStorage.setItem("saved_recipes", JSON.stringify(savedRecipes));
    return recipe;
  }

  // Get saved recipes from local storage
  getSavedRecipes() {
    const saved = localStorage.getItem("saved_recipes");
    return saved ? JSON.parse(saved) : [];
  }

  // Get recipe by ID
  getRecipeById(id) {
    const savedRecipes = this.getSavedRecipes();
    return savedRecipes.find((recipe) => recipe.id === id);
  }

  // Delete recipe
  deleteRecipe(id) {
    const savedRecipes = this.getSavedRecipes();
    const filtered = savedRecipes.filter((recipe) => recipe.id !== id);
    localStorage.setItem("saved_recipes", JSON.stringify(filtered));
    return true;
  }
}

export default new RecipeService();
