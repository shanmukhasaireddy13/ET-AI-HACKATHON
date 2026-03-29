import { supabase } from "../config/db.js";

// ─── Sign Up ───
export const signup = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name || "" },
      },
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(201).json({
      message: "Account created successfully",
      user: data.user,
      session: data.session,
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// ─── Login ───
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    return res.json({
      message: "Login successful",
      user: data.user,
      session: data.session,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// ─── OAuth (Google / GitHub) ───
export const oauthLogin = async (req, res) => {
  try {
    const { provider } = req.body;
    const validProviders = ["google", "github"];

    if (!provider || !validProviders.includes(provider)) {
      return res.status(400).json({ error: `Invalid provider. Use: ${validProviders.join(", ")}` });
    }

    const redirectTo = `${process.env.FRONTEND_URL || "http://localhost:3000"}/auth/callback`;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.json({ url: data.url });
  } catch (err) {
    console.error("OAuth error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// ─── Logout ───
export const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (token) {
      await supabase.auth.admin.signOut(token);
    }

    return res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// ─── Get Current User ───
export const getMe = async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    return res.json({ user: data.user });
  } catch (err) {
    console.error("GetMe error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
