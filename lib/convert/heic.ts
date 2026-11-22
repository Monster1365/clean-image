// HEIC/HEIF support (iPhone photos).
//
// Only Safari can decode HEIC natively, so every browser goes through libheif
// (WASM, LGPL-3.0, used unmodified). The decoder (~1.5 MB) is loaded lazily the
// first time a HEIC file is converted.

type HeifImage = {
  get_width(): number;
  get_height(): number;
  is_primary(): boolean;
  display(target: ImageData, cb: (result: ImageData | null) => void): void;
  free(): void;
};
type HeifDecoder = { decoder: number | null; decode(data: Uint8Array): HeifImage[] };
type LibHeif = {
  HeifDecoder: new () => HeifDecoder;
  heif_context_free(ctx: number): void;
};

let libPromise: Promise<LibHeif> | null = null;

function loadLibheif(): Promise<LibHeif> {
  if (!libPromise) {
    libPromise = (async () => {
      const { default: factory } = await import("libheif-js/libheif-wasm/libheif.js");
      const wasmUrl = new URL(
        "../../node_modules/libheif-js/libheif-wasm/libheif.wasm",
        import.meta.url,
      ).href;
      return new Promise<LibHeif>((resolve, reject) => {
        try {
          // onRuntimeInitialized can fire before the factory call returns, so
          // defer resolving until `lib` has actually been assigned.
          let lib: LibHeif | undefined = undefined;
          lib = (factory as unknown as (opts: object) => LibHeif)({
            locateFile: () => wasmUrl,
            onRuntimeInitialized: () => queueMicrotask(() => resolve(lib!)),
            onAbort: (what: unknown) => reject(new Error(String(what))),
          });
        } catch (e) {
          reject(e);
        }
      });
    })();
    libPromise.catch(() => {
      libPromise = null; // allow a retry, e.g. after a network hiccup
    });
  }
  return libPromise;
}

/** Decode the primary image of a HEIC file to RGBA pixels (rotation/mirroring applied by libheif). */
export async function decodeHeic(blob: Blob): Promise<ImageData> {
  const lib = await loadLibheif();
  const decoder = new lib.HeifDecoder();
  const images = decoder.decode(new Uint8Array(await blob.arrayBuffer()));
  try {
    if (!images.length) throw new Error("HEIC 이미지를 읽을 수 없습니다.");
    const image = images.find((i) => i.is_primary()) ?? images[0];
    const target = new ImageData(image.get_width(), image.get_height());
    const result = await new Promise<ImageData | null>((resolve) => image.display(target, resolve));
    if (!result) throw new Error("HEIC 이미지를 읽을 수 없습니다.");
    return result;
  } finally {
    images.forEach((i) => i.free());
    if (decoder.decoder) lib.heif_context_free(decoder.decoder);
  }
}
