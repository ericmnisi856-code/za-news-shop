export const ADMIN_EMAIL = "ericmnisi007@gmail.com";
export const ADMIN_PASSWORD = "Banele@123321";
const KEY = "cnza_admin_auth";

export function signInAdmin(email: string, password: string): boolean {
  if (email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    try { localStorage.setItem(KEY, "1"); } catch {}
    return true;
  }
  return false;
}

export function signOutAdmin() {
  try { localStorage.removeItem(KEY); } catch {}
}

export function isAdminAuthed(): boolean {
  if (typeof window === "undefined") return false;
  try { return localStorage.getItem(KEY) === "1"; } catch { return false; }
}
