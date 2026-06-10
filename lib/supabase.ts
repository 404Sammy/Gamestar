import { createClient } from '@supabase/supabase-js';

// Read the variables without forcing them with "!"
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Log the status to your terminal/browser console so you can see what Next.js sees
console.log("🔍 Next.js Environment Check:", {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey
});

// Provide fallback dummy strings if variables are undefined to prevent the runtime crash
const finalUrl = supabaseUrl || "https://placeholder-fallback-url.supabase.co";
const finalKey = supabaseAnonKey || "placeholder-fallback-key";

export const supabase = createClient(finalUrl, finalKey);