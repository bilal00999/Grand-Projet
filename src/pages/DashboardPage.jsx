import { useState } from "react";
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
  const [dietaryPreference, setDietaryPreference] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { user, signOut, jwt } = useAuth();
  const navigate = useNavigate();

  const recentRecipes = [
    { id: 1, title: "Chicken Stir Fry", time: "25 min", date: "2 hours ago" },
    { id: 2, title: "Pasta Carbonara", time: "20 min", date: "Yesterday" },
    { id: 3, title: "Vegetable Curry", time: "35 min", date: "2 days ago" },
    { id: 4, title: "Grilled Salmon", time: "15 min", date: "3 days ago" },
  ];

  const handleGenerateRecipe = async (e) => {
    e.preventDefault();
    if (!ingredients.trim()) return;

    setIsGenerating(true);
    try {
      const recipe = await recipeService.generateRecipe(
        ingredients,
        dietaryPreference,
        ""
      );
      // Save to backend
      const savedRecipe = await recipeService.saveRecipeToBackend(recipe, jwt);
      // Navigate to the generated recipe (use savedRecipe._id or similar)
      navigate(`/recipe/${savedRecipe._id || savedRecipe.id}`);
    } catch (error) {
      console.error("Error generating or saving recipe:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
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

                  <div className="space-y-2">
                    <label
                      htmlFor="dietary"
                      className="text-sm font-medium text-gray-700"
                    >
                      Dietary Preferences
                    </label>
                    <Select
                      value={dietaryPreference}
                      onValueChange={setDietaryPreference}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select dietary preference (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No restrictions</SelectItem>
                        <SelectItem value="vegetarian">Vegetarian</SelectItem>
                        <SelectItem value="vegan">Vegan</SelectItem>
                        <SelectItem value="keto">Keto</SelectItem>
                        <SelectItem value="paleo">Paleo</SelectItem>
                        <SelectItem value="gluten-free">Gluten-free</SelectItem>
                        <SelectItem value="dairy-free">Dairy-free</SelectItem>
                        <SelectItem value="low-carb">Low-carb</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-lg py-6"
                    disabled={isGenerating || !ingredients.trim()}
                  >
                    {isGenerating ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Generating your recipe...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Sparkles className="h-5 w-5" />
                        <span>Generate Recipe</span>
                      </div>
                    )}
                  </Button>
                </form>
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
                {recentRecipes.map((recipe) => (
                  <div
                    key={recipe.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {recipe.title}
                      </h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>{recipe.time}</span>
                        <span>•</span>
                        <span>{recipe.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
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
