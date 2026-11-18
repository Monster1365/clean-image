import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export function Header() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex h-20 max-w-5xl items-center justify-between px-6 sm:px-10">
        <Link href="/" className="flex items-center gap-2.5 font-semibold">
          <Image src="/logo.png" alt="" width={28} height={28} className="rounded-full" />
          <span className="text-[17px] tracking-tight">Clean Image</span>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
