// Cliente de Supabase para los scripts de node (correos, seed, dedup).
// En local lee .env.local; en GitHub Actions las variables ya vienen del
// workflow y dotenv no las sobreescribe.

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.error("Faltan SUPABASE_URL o SUPABASE_ANON_KEY (revisa .env.local).");
  process.exit(1);
}

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);
