import { auth } from "@/auth";

function adminEmails() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export async function isAdmin() {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase();
  return Boolean(email && adminEmails().includes(email));
}

export async function requireAdmin() {
  if (!(await isAdmin())) throw new Error("Forbidden");
}