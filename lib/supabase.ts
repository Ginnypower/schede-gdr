import { createClient } from '@supabase/supabase-js';

export const getSupabase = () => {
  // Cambiamo i nomi delle variabili per forzare Vercel a cercarne di nuove
  const url = process.env.NEXT_PUBLIC_URL_DB;
  const key = process.env.NEXT_PUBLIC_KEY_DB;

  if (!url || !key) {
    console.error("Mancano le variabili: ", { url: !!url, key: !!key });
    return null;
  }

  return createClient(url, key);
};