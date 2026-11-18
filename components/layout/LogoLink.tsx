"use client";

import Image from "next/image";
import Link from "next/link";
import { requestReset } from "@/lib/reset";

export function LogoLink() {
  return (
    <Link
      href="/"
      onClick={() => {
        requestReset();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
      className="flex items-center gap-2.5 font-semibold"
    >
      <Image src="/logo.png" alt="" width={28} height={28} className="rounded-full" />
      <span className="text-[17px] tracking-tight">Clean Image</span>
    </Link>
  );
}
