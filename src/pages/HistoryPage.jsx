import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Badge } from "@/components/ui/badge";
import { ChefHat, User, Search, Clock, Users, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import recipeService from "../services/recipeService";

export default function HistoryPage() {
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [loading, setLoading] = useState(true);
  const { user, signOut, jwt } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadRecipes();
  }, []);

  useEffect(() => {
    filterRecipes();
  }, [recipes, searchTerm, filterType]);

  const loadRecipes = async () => {
    try {
      const recipes = await recipeService.fetchRecipesFromBackend(jwt);
      console.log("Loaded recipes:", recipes);
      console.log(
        "Recipe titles:",
        recipes.map((r) => r.title)
      );
      setRecipes(recipes);
    } catch (error) {
      console.error("Error loading recipes:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterRecipes = () => {
    console.log("Filtering recipes...");
    console.log("Search term:", searchTerm);
    console.log("Filter type:", filterType);
    console.log("Total recipes:", recipes.length);
    let filtered = recipes;

    // Filter by search term
    if (searchTerm) {
      console.log("Filtering by search term:", searchTerm);
      filtered = filtered.filter(
        (recipe) =>
          recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          recipe.ingredients.some((ingredient) =>
            ingredient.toLowerCase().includes(searchTerm.toLowerCase())
          ) ||
          (recipe.tags &&
            recipe.tags.some((tag) =>
              tag.toLowerCase().includes(searchTerm.toLowerCase())
            ))
      );
      console.log("Filtered recipes count:", filtered.length);
    }

    // Filter by type
    if (filterType !== "all") {
      console.log("Filtering by type:", filterType);
      filtered = filtered.filter(
        (recipe) =>
          recipe.tags &&
          recipe.tags.some((tag) =>
            tag.toLowerCase().includes(filterType.toLowerCase())
          )
      );
      console.log("After type filter count:", filtered.length);
    }

    console.log("Final filtered recipes:", filtered.length);
    setFilteredRecipes(filtered);
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

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading recipes...</p>
        </div>
      </div>
    );
  }

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
              <Link to="/dashboard">
                <Button variant="ghost" className="flex items-center space-x-2">
                  <span>Dashboard</span>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            My Recipe History
          </h1>
          <p className="text-gray-600">
            Browse and manage all your generated recipes
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search recipes or ingredients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Recipes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Recipes</SelectItem>
              <SelectItem value="quick">Quick</SelectItem>
              <SelectItem value="healthy">Healthy</SelectItem>
              <SelectItem value="vegetarian">Vegetarian</SelectItem>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="one-pan">One-pan</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-gray-600">
            Showing {filteredRecipes.length} of {recipes.length} recipes
          </p>
        </div>

        {/* Recipes Grid */}
        {filteredRecipes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <ChefHat className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {recipes.length === 0 ? "No recipes yet" : "No recipes found"}
            </h3>
            <p className="text-gray-600 mb-6">
              {recipes.length === 0
                ? "Start generating recipes to see them here!"
                : "Try adjusting your search or filter criteria."}
            </p>
            <Link to="/dashboard">
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                Generate Your First Recipe
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {filteredRecipes.map((recipe) => (
              <Card
                key={recipe._id || recipe.id}
                className="hover:shadow-lg transition-shadow cursor-pointer bg-white border border-gray-200 rounded-lg overflow-hidden"
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <CardTitle className="text-lg font-bold text-gray-900 line-clamp-2 flex-1 mr-3">
                      {recipe.title}
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className="bg-green-100 text-green-800 border-green-200 text-xs px-2 py-1 rounded-full"
                    >
                      Easy
                    </Badge>
                  </div>

                  <CardDescription className="text-gray-600 text-sm mb-4 line-clamp-2">
                    A delicious and healthy one-pan meal featuring tender
                    chicken breast with fresh vegetables in a savory garlic
                    butter sauce...
                  </CardDescription>

                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>
                        {recipe.cookingTime
                          ? recipe.cookingTime
                          : recipe.cookTime !== undefined
                          ? `${recipe.cookTime} minutes`
                          : "-"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span>4</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge
                      variant="secondary"
                      className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                    >
                      Quick
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                    >
                      Healthy
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                    >
                      One-pan
                    </Badge>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1">
                      Key ingredients:
                    </p>
                    <p className="text-sm text-gray-700 line-clamp-1">
                      2 large chicken breasts, sliced, 2 cups broccoli
                      florets,...
                    </p>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Created Today</span>
                    <Link to={`/recipe/${recipe._id || recipe.id}`}>
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                      >
                        View Recipe
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination would go here if needed */}
      </div>
    </div>
  );
}
