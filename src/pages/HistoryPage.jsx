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
      setRecipes(recipes);
    } catch (error) {
      console.error("Error loading recipes:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterRecipes = () => {
    let filtered = recipes;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (recipe) =>
          recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          recipe.ingredients.some((ingredient) =>
            ingredient.toLowerCase().includes(searchTerm.toLowerCase())
          ) ||
          recipe.tags.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter((recipe) =>
        recipe.tags.some((tag) =>
          tag.toLowerCase().includes(filterType.toLowerCase())
        )
      );
    }

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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <Card
                key={recipe.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
              >
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-lg line-clamp-2">
                      {recipe.title}
                    </CardTitle>
                    <div className="flex space-x-1">
                      <Badge
                        variant="outline"
                        className={getDifficultyColor(recipe.difficulty)}
                      >
                        {recipe.difficulty}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {recipe.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{recipe.cookTime} min</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-3 w-3" />
                      <span>{recipe.servings}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {recipe.tags.slice(0, 3).map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs"
                      >
                        {tag}
                      </Badge>
                    ))}
                    {recipe.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{recipe.tags.length - 3}
                      </Badge>
                    )}
                  </div>

                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-1">
                      Key ingredients:
                    </p>
                    <p className="text-sm text-gray-700 line-clamp-1">
                      {recipe.ingredients.slice(0, 3).join(", ")}...
                    </p>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      Created {formatDate(recipe.createdAt)}
                    </span>
                    <Link to={`/recipe/${recipe.id}`}>
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700"
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
