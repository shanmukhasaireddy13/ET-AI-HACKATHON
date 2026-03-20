import { createClient } from "@supabase/supabase-js";
import mongoose from "mongoose";
import config from "./index.js";

// ─── Supabase ───
export const supabase = createClient(config.supabase.url, config.supabase.key);

// ─── MongoDB ───
export const connectMongo = async () => {
  try {
    await mongoose.connect(config.mongo.uri);
    console.log("✅ MongoDB Atlas connected");
  } catch (err) {
    console.error("❌ MongoDB error:", err.message);
  }
};

// ─── Supabase test ───
export const initSupabase = async () => {
  try {
    const { error } = await supabase.from("integrations").select("id").limit(1);
    if (error && error.code === "42P01") {
      console.log("⚠️  Supabase tables missing — create them in the dashboard SQL editor.");
    } else {
      console.log("✅ Supabase connected");
    }
  } catch (err) {
    console.error("❌ Supabase error:", err.message);
  }
};
