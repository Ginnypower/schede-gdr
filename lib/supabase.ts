import { createClient } from '@supabase/supabase-js';

// Leggiamo le variabili
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Se mancano (ad esempio durante il build di Vercel), usiamo stringhe vuote temporanee
// ma se siamo nel browser "vero", devono esserci!
export const supabase = createClient(
  supabaseUrl || '', 
  supabaseAnonKey || ''
);