import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { ChefHat, Sparkles, Clock, Heart } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <ChefHat className="h-8 w-8 text-emerald-600" />
              <span className="text-xl font-bold text-gray-900">AI Recipe Generator</span>
            </div>
            <Link to="/login">
              <Button variant="outline" className="border-emerald-600 text-emerald-600 hover:bg-emerald-50">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <ChefHat className="h-20 w-20 text-emerald-600" />
              <Sparkles className="h-6 w-6 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            AI-Powered Recipe Generator
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Generate delicious recipes from the ingredients you have on hand. 
            Never waste food again with our smart AI-powered cooking assistant.
          </p>
          
          <Link to="/login">
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 text-lg">
              Get Started
            </Button>
          </Link>
        </div>

        {/* Features Section */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-white rounded-xl shadow-sm border">
            <div className="flex justify-center mb-4">
              <Sparkles className="h-12 w-12 text-emerald-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Powered</h3>
            <p className="text-gray-600">
              Advanced AI analyzes your ingredients and creates personalized recipes just for you.
            </p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-xl shadow-sm border">
            <div className="flex justify-center mb-4">
              <Clock className="h-12 w-12 text-emerald-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Quick & Easy</h3>
            <p className="text-gray-600">
              Get recipe suggestions in seconds with step-by-step cooking instructions.
            </p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-xl shadow-sm border">
            <div className="flex justify-center mb-4">
              <Heart className="h-12 w-12 text-emerald-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Personalized</h3>
            <p className="text-gray-600">
              Dietary preferences and restrictions are considered for every recipe suggestion.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center bg-emerald-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to start cooking?</h2>
          <p className="text-xl mb-6 text-emerald-100">
            Join thousands of home cooks who never run out of recipe ideas.
          </p>
          <Link to="/login">
            <Button size="lg" variant="secondary" className="bg-white text-emerald-600 hover:bg-gray-50">
              Start Generating Recipes
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}

