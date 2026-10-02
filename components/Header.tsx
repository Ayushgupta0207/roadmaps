import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-6xl items-center justify-between p-4 md:px-8">
        <Link href="/" className="font-bold">LearnMap</Link>
        <ThemeToggle />
      </div>
    </header>
  );
}