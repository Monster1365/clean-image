// Lazy, single-threaded encoders.
//
// The package entry points of @jsquash/avif and @jsquash/oxipng pick a
// multi-threaded build at runtime, and those builds spawn nested Workers
// (`new Worker(new URL(...))` referring back to themselves). Turbopack hangs
// forever trying to bundle that self-referencing worker graph, so we import
// the single-threaded builds directly. Multi-threading would need
// cross-origin isolation (COOP/COEP) anyway, which this site doesn't enable.

import type { OutputFormat } from "./types";

type Encoder = (img: ImageData, quality: number) => Promise<ArrayBuffer>;

const cache = new Map<OutputFormat, Promise<Encoder>>();

async function loadJpeg(): Promise<Encoder> {
  const { default: encode } = await import("@jsquash/jpeg/encode.js");
  return (img, quality) => encode(img, { quality });
}

async function loadWebp(): Promise<Encoder> {
  const { default: encode } = await import("@jsquash/webp/encode.js");
  return (img, quality) => encode(img, { quality });
}

async function loadAvif(): Promise<Encoder> {
  const [{ default: factory }, { defaultOptions }] = await Promise.all([
    import("@jsquash/avif/codec/enc/avif_enc.js"),
    import("@jsquash/avif/meta.js"),
  ]);
  const mod = await factory({ noInitialRun: true });
  return async (img, quality) => {
    // AVIF's quality scale is far more efficient than JPEG's; map the shared
    // 1–100 slider so equal values give comparable visual quality.
    const out = mod.encode(new Uint8Array(img.data.buffer), img.width, img.height, {
      ...defaultOptions,
      quality: Math.max(1, Math.round(quality * 0.7)),
      speed: 6,
    });
    if (!out) throw new Error("AVIF 인코딩에 실패했습니다.");
    return out.buffer as ArrayBuffer;
  };
}

async function loadPng(): Promise<Encoder> {
  const { default: init, optimise_raw } = await import("@jsquash/oxipng/codec/pkg/squoosh_oxipng.js");
  await init();
  return async (img) => optimise_raw(img.data, img.width, img.height, 2, false, false).buffer as ArrayBuffer;
}

const loaders: Record<OutputFormat, () => Promise<Encoder>> = {
  jpg: loadJpeg,
  webp: loadWebp,
  avif: loadAvif,
  png: loadPng,
};

export function getEncoder(format: OutputFormat): Promise<Encoder> {
  let p = cache.get(format);
  if (!p) {
    p = loaders[format]();
    // Allow a retry if loading failed (e.g. network hiccup fetching the .wasm).
    p.catch(() => cache.delete(format));
    cache.set(format, p);
  }
  return p;
}
