/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Public Supabase project URL; when set (with the anon key) the study room goes online. */
  readonly VITE_SUPABASE_URL?: string
  /** Public "anon" key: safe in the browser by design. */
  readonly VITE_SUPABASE_ANON_KEY?: string
  /** "1" keeps the study room in local (same-browser) test mode. */
  readonly VITE_ROOM_LOCAL?: string
  /** Metered TURN credentials URL (with its apiKey) so voice/screen work across strict networks. */
  readonly VITE_TURN_CREDENTIALS_URL?: string
}
