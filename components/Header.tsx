import Link from "next/link";
import { auth, signIn, signOut } from "@/auth";
import ThemeToggle from "./ThemeToggle";

const btn = "rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-card";

export default async function Header() {
  const session = await auth();

  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-6xl items-center justify-between p-4 md:px-8">
        <Link href="/" className="font-bold">LearnMap</Link>

        <div className="flex items-center gap-2">
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