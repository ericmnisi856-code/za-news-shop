type AdminCred = { email: string; password: string };

export const ADMIN_USERS: AdminCred[] = [
  { email: "ericmnisi007@gmail.com", password: "Banele@123321" },
  { email: "russonray@yahoo.com", password: "Citynewsza@123" },
];

// Back-compat exports (first admin)
export const ADMIN_EMAIL = ADMIN_USERS[0].email;
export const ADMIN_PASSWORD = ADMIN_USERS[0].password;

const KEY = "cnza_admin_auth";

export function signInAdmin(email: string, password: string): boolean {
  const e = email.trim().toLowerCase();
  const match = ADMIN_USERS.some(
    (u) => u.email.toLowerCase() === e && u.password === password
  );
  if (match) {
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
