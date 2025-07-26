import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChefHat, User, History, Sparkles, Clock, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import recipeService from "../services/recipeService";

export default function DashboardPage() {
  const [ingredients, setIngredients] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [recipe, setRecipe] = useState(null); // recipe object
  const [error, setError] = useState("");
  const [recentRecipes, setRecentRecipes] = useState([]);
  const [hasSaved, setHasSaved] = useState(false);
  const { user, signOut, jwt } = useAuth();
  const navigate = useNavigate();

  // Fetch real recent recipes on mount and after save
  useEffect(() => {
    if (jwt) fetchRecentRecipes();
    // eslint-disable-next-line
  }, [jwt]);

  const fetchRecentRecipes = async () => {
    try {
      const recipes = await recipeService.fetchRecipesFromBackend(jwt);
      console.log("Fetched recipes:", recipes);
      setRecentRecipes(recipes.slice(0, 4)); // Show only first 4 recipes
    } catch (e) {
      console.error("Error fetching recipes:", e);
      setRecentRecipes([]);
    }
  };

  // Save recipe to backend
  const saveRecipeToHistory = async (recipeObj) => {
    console.log("=== saveRecipeToHistory START ===");
    console.log("recipeObj:", recipeObj);
    console.log("hasSaved:", hasSaved);
    console.log("recipeObj truthy:", !!recipeObj);
    console.log("=== saveRecipeToHistory called ===");
    console.log("recipeObj received:", recipeObj);
    console.log("hasSaved:", hasSaved);
    if (!recipeObj || hasSaved) return;
    console.log("Proceeding with save...");
    try {
      // Convert instructions array to string if needed
      console.log("Original instructions:", recipeObj.instructions);
      console.log("First instruction object:", recipeObj.instructions[0]);
      const instructions = Array.isArray(recipeObj.instructions)
        ? recipeObj.instructions
            .map((step) => {
              console.log("Processing step:", step);
              if (typeof step === "string") return step;
              if (typeof step === "object") {
                const text =
                  step.description ||
                  step.text ||
                  step.instruction ||
                  step.content ||
                  step.step ||
                  "";
                console.log("Extracted text:", text);
                return text;
              }
              return "";
            })
            .filter(Boolean)
            .join("\n")
        : recipeObj.instructions;
      console.log("Instructions converted:", instructions);

      // Add ingredients if missing (use the original input ingredients)
      console.log("recipeObj.cookingTime:", recipeObj.cookingTime);
      console.log("recipeObj.cookTime:", recipeObj.cookTime);
      const extractedCookTime =
        extractCookTime(recipeObj.cookingTime) ||
        extractCookTime(recipeObj.cookTime);
      console.log("Extracted cookTime:", extractedCookTime);
      const recipeToSave = {
        ...recipeObj,
        instructions,
        ingredients:
          recipeObj.ingredients ||
          ingredients
            .split(",")
            .map((i) => i.trim())
            .filter(Boolean),
        cookTime: extractedCookTime || 30,
      };

      console.log("Saving recipe to backend:", recipeToSave);
      console.log("About to call recipeService.saveRecipeToBackend...");
      const savedRecipe = await recipeService.saveRecipeToBackend(
        recipeToSave,
        jwt
      );
      if (savedRecipe && (savedRecipe._id || savedRecipe.id)) {
        navigate(`/recipe/${savedRecipe._id || savedRecipe.id}`);
      }
      console.log("recipeService.saveRecipeToBackend completed successfully");
      setHasSaved(true);
      fetchRecentRecipes();
    } catch (e) {
      console.error("Error in saveRecipeToHistory:", e);
      console.error("Error saving recipe:", e);
    }
  };

  // Generate recipe handler
  const handleGenerateRecipe = async (e) => {
    e.preventDefault();
    if (!ingredients.trim()) return;
    setIsGenerating(true);
    setRecipe(null);
    setError("");
    setHasSaved(false);
    try {
      const response = await fetch("http://localhost:5000/ai-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredients: ingredients
            .split(",")
            .map((i) => i.trim())
            .filter(Boolean),
        }),
      });
      if (!response.ok) throw new Error("Failed to generate recipe");
      const data = await response.json();
      let recipeObj = null;
      if (data.recipe && typeof data.recipe.result === "string") {
        const match = data.recipe.result.match(/```json\n([\s\S]*?)```/);
        if (match && match[1]) {
          try {
            recipeObj = JSON.parse(match[1]);
          } catch (e) {
            try {
              recipeObj = JSON.parse(data.recipe.result);
            } catch (e2) {
              recipeObj = null;
            }
          }
        }
      }
      setRecipe(recipeObj);
      console.log("AI Generated Recipe Object:", recipeObj);
      console.log("Full recipeObj keys:", Object.keys(recipeObj));
      console.log(
        "Testing extractCookTime with '40 minutes':",
        extractCookTime("40 minutes")
      );
      console.log(
        "Testing extractCookTime with '25 min':",
        extractCookTime("25 min")
      );
      if (recipeObj) {
        await saveRecipeToHistory(recipeObj);
        // Navigation will happen inside saveRecipeToHistory
      }
    } catch {
      setError("Error generating recipe. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate Another Recipe handler
  const handleGenerateAnother = async () => {
    if (recipe && !hasSaved) {
      await saveRecipeToHistory(recipe);
    }
    setRecipe(null);
    setIngredients("");
    setError("");
    setHasSaved(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    if (diffDays <= 30) return `${Math.ceil((diffDays - 1) / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const extractCookTime = (timeString) => {
    if (!timeString) return null;
    // Extract number from strings like "40 minutes", "25 min", "1 hour", etc.
    const match = timeString.toString().match(/(\d+)/);
    return match ? parseInt(match[1]) : null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <ChefHat className="h-8 w-8 text-emerald-600" />
              <span className="text-xl font-bold text-gray-900">
                AI Recipe Generator
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/history">
                <Button variant="ghost" className="flex items-center space-x-2">
                  <History className="h-4 w-4" />
                  <span>History</span>
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">{user?.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Generate Your Recipe
              </h1>
              <p className="text-gray-600">
                Tell us what ingredients you have, and we'll create a delicious
                recipe for you!
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-emerald-600" />
                  <span>Recipe Generator</span>
                </CardTitle>
                <CardDescription>
                  Enter your available ingredients and preferences to get a
                  personalized recipe.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleGenerateRecipe} className="space-y-6">
                  <div className="space-y-2">
                    <label
                      htmlFor="ingredients"
                      className="text-sm font-medium text-gray-700"
                    >
                      What ingredients do you have? *
                    </label>
                    <Textarea
                      id="ingredients"
                      placeholder="e.g., chicken breast, broccoli, garlic, soy sauce, rice..."
                      value={ingredients}
                      onChange={(e) => setIngredients(e.target.value)}
                      className="min-h-[120px] resize-none"
                      required
                    />
                    <p className="text-xs text-gray-500">
                      List all the ingredients you have available. Be as
                      specific as possible for better results.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-lg py-6"
                    disabled={isGenerating || !ingredients.trim()}
                  >
                    {isGenerating ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Generating recipe...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Sparkles className="h-5 w-5" />
                        <span>Generate Recipe</span>
                      </div>
                    )}
                  </Button>
                </form>
                {/* Output Section */}
                <div className="mt-8">
                  {isGenerating && (
                    <div className="text-emerald-700 font-medium">
                      Generating recipe...
                    </div>
                  )}
                  {error && (
                    <div className="text-red-600 font-medium">{error}</div>
                  )}
                  {recipe && !isGenerating && !error && (
                    <>
                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mt-4">
                        <h2 className="text-xl font-bold mb-2">
                          {recipe.title || "Your AI-Generated Recipe"}
                        </h2>
                        {recipe.cookingTime && (
                          <div>
                            <strong>Cooking Time:</strong> {recipe.cookingTime}
                          </div>
                        )}
                        {recipe.servings && (
                          <div>
                            <strong>Servings:</strong> {recipe.servings}
                          </div>
                        )}
                        {recipe.instructions &&
                          Array.isArray(recipe.instructions) && (
                            <div className="mt-4">
                              <strong>Instructions:</strong>
                              <ol className="list-decimal list-inside ml-4">
                                {recipe.instructions.map((step, idx) => (
                                  <li key={idx}>{step.description || step}</li>
                                ))}
                              </ol>
                            </div>
                          )}
                        {recipe.instructions &&
                          !Array.isArray(recipe.instructions) && (
                            <div className="mt-4 whitespace-pre-line">
                              {recipe.instructions}
                            </div>
                          )}
                      </div>
                      <Button
                        className="w-full mt-4"
                        variant="outline"
                        onClick={handleGenerateAnother}
                      >
                        Generate Another Recipe
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <History className="h-5 w-5 text-emerald-600" />
                  <span>Recent Recipes</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentRecipes.length === 0 ? (
                  <div className="text-gray-500">No recent recipes found.</div>
                ) : (
                  recentRecipes.map((recipe) => (
                    <div
                      key={recipe._id || recipe.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {recipe.title}
                        </h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span>
                            {recipe.cookTime || recipe.time || "30"} min
                          </span>
                          <span>•</span>
                          <span>
                            {recipe.createdAt
                              ? formatDate(recipe.createdAt)
                              : "-"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <Link to="/history">
                  <Button variant="outline" className="w-full mt-4">
                    View All Recipes
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tips for Better Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p>
                    Be specific about quantities when possible (e.g., "2 chicken
                    breasts" instead of just "chicken")
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p>
                    Include seasonings and pantry staples you have available
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p>
                    Mention cooking equipment if you have preferences (oven,
                    stovetop, etc.)
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
