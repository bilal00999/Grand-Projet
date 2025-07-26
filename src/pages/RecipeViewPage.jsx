import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChefHat,
  ArrowLeft,
  User,
  History,
  Clock,
  Users,
  Bookmark,
  Share2,
  CheckCircle,
  LogOut,
} from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import recipeService from "../services/recipeService";

export default function RecipeViewPage() {
  const [recipe, setRecipe] = useState(null);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const { user, signOut, jwt } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadRecipe();
    // eslint-disable-next-line
  }, [id, jwt]);

  const loadRecipe = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedRecipe = await recipeService.fetchRecipeByIdFromBackend(
        id,
        jwt
      );
      setRecipe(fetchedRecipe);
      setIsSaved(true);
    } catch {
      setError("Recipe not found or you do not have access.");
      setRecipe(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const toggleStepCompletion = (stepIndex) => {
    const newCompleted = new Set(completedSteps);
    if (newCompleted.has(stepIndex)) {
      newCompleted.delete(stepIndex);
    } else {
      newCompleted.add(stepIndex);
    }
    setCompletedSteps(newCompleted);
  };

  const handleSaveRecipe = () => {
    // Recipe is already saved when generated, so this is just UI feedback
    setIsSaved(true);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe.title,
          text: recipe.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Recipe link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading recipe...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold">{error}</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Recipe not found</p>
          <Link to="/dashboard">
            <Button className="mt-4">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Defensive defaults for missing fields
  const {
    title = "Untitled Recipe",
    description = "No description provided.",
    cookingTime, // string from n8n, e.g., "40 minutes"
    cookTime, // number, e.g., 40
    servings = 4,
    difficulty = "Easy",
    tags = ["Quick", "Healthy", "One-pan"],
    nutrition = { calories: 285, protein: 32, carbs: 8, fat: 14 },
    instructions = [],
    ingredients = [],
  } = recipe;

  // Ensure instructions is always an array
  let safeInstructions = instructions;
  console.log("Original instructions:", instructions);
  console.log("Type of instructions:", typeof instructions);

  if (typeof safeInstructions === "string") {
    safeInstructions = safeInstructions.split("\n").filter(Boolean);
    console.log("After splitting string:", safeInstructions);
  }
  if (!Array.isArray(safeInstructions)) {
    safeInstructions = [];
    console.log("Defaulting to empty array");
  }

  console.log("Final safeInstructions:", safeInstructions);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <ChefHat className="h-8 w-8 text-emerald-600" />
                <span className="text-xl font-bold text-gray-900">
                  AI Recipe Generator
                </span>
              </div>
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Recipe Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div className="mr-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{title}</h1>
              {description && description !== "No description provided." && (
                <p className="text-lg text-gray-600 mb-4">{description}</p>
              )}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={handleShare}
                className="flex items-center space-x-2"
              >
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </Button>
            </div>
          </div>

          {/* Recipe Meta */}
          <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>
                {cookingTime
                  ? cookingTime
                  : cookTime !== undefined
                  ? `${cookTime} minutes`
                  : "-"}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>{servings} servings</span>
            </div>
            <Badge variant="secondary">{difficulty}</Badge>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-emerald-700 border-emerald-300"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Ingredients */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Ingredients</CardTitle>
                <CardDescription>
                  Everything you'll need for this recipe
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {ingredients.map((ingredient, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm">{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Nutrition */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Nutrition (per serving)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-emerald-600">
                      {nutrition.calories}
                    </div>
                    <div className="text-sm text-gray-600">Calories</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-emerald-600">
                      {nutrition.protein}
                    </div>
                    <div className="text-sm text-gray-600">Protein</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-emerald-600">
                      {nutrition.carbs}
                    </div>
                    <div className="text-sm text-gray-600">Carbs</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-emerald-600">
                      {nutrition.fat}
                    </div>
                    <div className="text-sm text-gray-600">Fat</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Instructions */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Instructions</CardTitle>
                <CardDescription>
                  Follow these steps to create your delicious meal
                </CardDescription>
              </CardHeader>
              <CardContent>
                {safeInstructions.length === 0 ? (
                  <div className="text-gray-500">No instructions provided.</div>
                ) : (
                  <ol className="list-decimal list-inside space-y-2">
                    {safeInstructions.map((instruction, index) => {
                      let text = "";
                      if (typeof instruction === "string") {
                        text = instruction;
                      } else if (
                        typeof instruction === "object" &&
                        instruction !== null
                      ) {
                        text =
                          instruction.description ||
                          instruction.step ||
                          instruction.text ||
                          "";
                      }
                      return (
                        <li
                          key={index}
                          className="text-sm text-gray-700 leading-relaxed"
                        >
                          {text}
                        </li>
                      );
                    })}
                  </ol>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="mt-6 flex justify-center space-x-4">
              <Link to="/dashboard">
                <Button variant="outline" size="lg">
                  Generate Another Recipe
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
