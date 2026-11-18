import { Converter } from "@/components/converter/Converter";

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

      <section id="convert" className="mt-20 sm:mt-24">
        <Converter />
      </section>
    </div>
  );
}
