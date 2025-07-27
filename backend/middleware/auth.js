/* eslint-disable */
const jwt = require("jsonwebtoken");

const supabaseAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // If no JWT secret is configured, skip authentication for development
  if (!process.env.SUPABASE_JWT_SECRET) {
    console.log("No SUPABASE_JWT_SECRET found, skipping authentication");
    req.user = { sub: "temp-user-id" }; // Temporary user ID
    return next();
  }

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.SUPABASE_JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT verification error:", err);
    return res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = supabaseAuth;
