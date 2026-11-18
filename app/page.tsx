import { ImageUp } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function Home() {
  return (
    <div className="mx-auto max-w-2xl px-6 pt-28 pb-36 sm:px-10 sm:pt-40 sm:pb-48">
      {/* Hero */}
      <section className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl">
          이미지 변환을 더 깔끔하게
        </h1>
        <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg">
          PNG, JPG, WEBP, AVIF 사이를 자유롭게.{" "}
          <br className="hidden sm:block" />
          화질은 지키고, 용량은 가볍게.
        </p>
      </section>

      {/* Drop zone (visual only) */}
      <section id="convert" className="mt-20 sm:mt-24">
        <div className="flex flex-col items-center justify-center gap-5 rounded-lg border-2 border-dashed border-border-strong bg-surface-muted px-6 py-20 text-center transition-colors hover:border-primary hover:bg-primary-soft sm:py-24">
            <span className="grid size-14 place-items-center rounded-lg border border-border bg-surface">
              <ImageUp className="size-7 text-primary" strokeWidth={1.5} aria-hidden />
            </span>
            <div>
              <p className="font-medium">이미지를 여기로 끌어다 놓으세요</p>
              <p className="mt-1.5 text-sm text-muted-foreground">
                또는 클릭해서 파일 선택 · 최대 20MB
              </p>
            </div>
            <Button size="md" className="mt-2">
              파일 선택
            </Button>
        </div>
      </section>
    </div>
  );
}
