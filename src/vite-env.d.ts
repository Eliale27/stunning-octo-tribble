/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Public Supabase project URL; when set (with the anon key) the study room goes online. */
  readonly VITE_SUPABASE_URL?: string
  /** Public "anon" key: safe in the browser by design. */
  readonly VITE_SUPABASE_ANON_KEY?: string
}
