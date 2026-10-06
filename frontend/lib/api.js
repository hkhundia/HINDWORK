export const BASE = process.env.NEXT_PUBLIC_API || "http://127.0.0.1:8000/api";
export const auth = {
  user() { try { return JSON.parse(localStorage.getItem("ks_user")); } catch { return null; } },
  save(t, u) { localStorage.setItem("ks_token", t); localStorage.setItem("ks_user", JSON.stringify(u)); },
  clear() { localStorage.removeItem("ks_token"); localStorage.removeItem("ks_user"); },
};
export async function api(path, { method = "GET", body } = {}) {
  const h = { "Content-Type": "application/json" };
  const t = localStorage.getItem("ks_token");
  if (t) h.Authorization = "Token " + t;
  let r;
  try { r = await fetch(BASE + path, { method, headers: h, body: body ? JSON.stringify(body) : undefined }); }
  catch { throw new Error("Cannot reach the backend. Is it running on port 8000?"); }
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(d.detail || Object.entries(d).map(([k, v]) => `${k}: ${[].concat(v).join(" ")}`).join(". ") || "Something went wrong");
  return d;
}
export const toJob = j => ({ ...j, desc: j.description, by: j.employer_name, cat: j.category, lang: j.language, skills: (j.skills || "").split(",").filter(Boolean) });
export const toPerson = u => ({ ...u, name: u.username[0].toUpperCase() + u.username.slice(1), rate: u.hourly_rate, skills: (u.skills || "").split(",").filter(Boolean) });
