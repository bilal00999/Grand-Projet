# 🍳 AI Recipe Generator

A smart recipe app that helps you create recipes from whatever ingredients you have at home. Just type what you’ve got, hit generate, and get a step-by-step recipe instantly using AI.

🔗 [Live Demo] https://grand-projet-psi.vercel.app/

---

## 📌 What This Project Does

The AI Recipe Generator takes your available ingredients, sends them to an AI (Gemini via n8n), and gives you back a full recipe with steps, cooking time, servings, and more. It’s like having your own personal chef who knows what to do with what’s in your kitchen.

---

## 🔥 Key Features

- **Instant Recipe Generator** — Just enter ingredients, get a recipe
- **AI Integration** — Uses Gemini through n8n workflows
- **User Login** — Supabase auth (email sign-in)
- **Recipe History** — View your recent recipe generations
- **Fully Responsive** — Works on all devices
- **Clean UI** — Built with Tailwind CSS + ShadCN components

---

## 🧠 How It Works (Short Version)

1. User enters ingredients on the dashboard
2. Clicks “Generate Recipe”
3. Ingredients are sent to backend (`Express.js`)
4. Backend sends data to **n8n + Gemini API**
5. AI returns a recipe
6. Frontend displays it nicely

---

## 📄 Pages and What They Do

### 🔐 Login Page
- Login with Supabase magic link
- Automatically redirects logged-in users to the dashboard

### 🧪 Dashboard Page
- Input ingredients (just type or paste them)
- Click “Generate” to get a recipe
- Shows recipe title, time, servings, ingredients, instructions
- Also shows a preview of your recent 4 recipes
- Option to log out from user menu

### 🕓 History Page
- Full list of previously generated recipes
- View, search

---

🧰 Tech Stack
Frontend: React, Vite, Tailwind CSS

Backend: Node.js, Express

AI: Gemini API via n8n workflow

Auth: Supabase (magic link login)

Database: MongoDB (for saving recipes)

Hosting: Vercel (frontend, backend), n8n Cloud (AI)

## 📁 Project Structure

grand_project/
├── src/
│   ├── pages/
│   │   ├── LoginPage.jsx          # User authentication
│   │   ├── DashboardPage.jsx      # Main recipe generation
│   │   ├── HistoryPage.jsx        # Recipe history and search
│   │   ├── HomePage.jsx           # Landing page
│   │   └── RecipeViewPage.jsx     # Individual recipe view
│   ├── components/
│   │   ├── ProtectedRoute.jsx     # Authentication wrapper
│   │   └── ui/                    # Reusable UI components
│   ├── contexts/
│   │   └── AuthContext.jsx        # User authentication state
│   ├── services/
│   │   └── recipeService.js       # API communication
│   ├── lib/
│   │   ├── supabase.js           # Database configuration
│   │   └── utils.js              # Utility functions
│   └── hooks/
│       └── use-mobile.js         # Responsive design hooks
├── backend/
│   ├── server.js                 # Express server
│   ├── routes/
│   │   └── recipes.js            # Recipe API endpoints
│   ├── models/
│   │   └── Recipe.js             # Recipe data model
│   └── middleware/
│       └── auth.js               # Authentication middleware
└── public/                       # Static assets
