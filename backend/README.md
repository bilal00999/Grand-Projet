# AI Recipe Generator Backend

## Setup

1. Create a `.env` file in the `backend` folder with:

```
MONGODB_URI=your_mongodb_uri
MONGODB_DB=your_db_name
SUPABASE_JWT_SECRET=your_supabase_jwt_secret
PORT=5000
```

2. Install dependencies:

```
npm install
```

3. Start the server:

```
npm start
```

## API Endpoints

### POST /recipes

- Create a new recipe for the logged-in user.
- Requires `Authorization: Bearer <supabase_jwt>` header.
- Body: `{ title, ingredients, instructions }`

### GET /recipes

- Get all recipes for the logged-in user.
- Requires `Authorization: Bearer <supabase_jwt>` header.

## Notes

- The server verifies Supabase JWTs for authentication.
- Recipes are stored in MongoDB with the user's Supabase user ID.
