import Link from "next/link";
import { auth, signIn, signOut } from "@/auth";
import ThemeToggle from "./ThemeToggle";
import { isAdmin } from "@/lib/admin";

const btn = "rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-card";

export default async function Header() {
  const session = await auth();
    const admin = await isAdmin();

  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-6xl items-center justify-between p-4 md:px-8">
        <Link href="/" className="font-bold">LearnMap</Link>

        <div className="flex items-center gap-2">
          {admin && <Link href="/admin" className={btn}>Admin</Link>}
          <ThemeToggle />
          {session?.user ? (
            <form
              action={async () => {
                "use server";
                await signOut();
              }}
            >
              <button className={btn}>
                Sign out ({session.user.name?.split(" ")[0] ?? "you"})
              </button>
            </form>
          ) : (
            <form
              action={async () => {
                "use server";
                await signIn("github");
              }}
            >
              <button className={btn}>Sign in with GitHub</button>
            </form>
          )}
        </div>
      </div>
    </header>
  );
}