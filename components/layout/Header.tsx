import { LogoLink } from "@/components/layout/LogoLink";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export function Header() {
  return (
    <header className="border-b border-border">
      <div className="flex h-20 w-full items-center justify-between px-6 sm:px-10">
        <LogoLink />
        <ThemeToggle />
      </div>
    </header>
  );
}
