import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ghnfggrrpqmrssyfmtve.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdobmZnZ3JycHFtcnNzeWZtdHZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwMzk1MzEsImV4cCI6MjA5ODYxNTUzMX0.HWGpDK0o8e4b3FcTAVUnTWKYinWpvNNj7fSfH5yUFKY";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);