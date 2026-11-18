export const OUTPUT_FORMATS = ["jpg", "png", "webp", "avif"] as const;
export type OutputFormat = (typeof OUTPUT_FORMATS)[number];

export const MIME_TYPES: Record<OutputFormat, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
};

export type ResizeOption =
  | { mode: "original" }
  | { mode: "width"; width: number }
  | { mode: "percent"; percent: number };

export type ConvertOptions = {
  format: OutputFormat;
  /** 1–100. Ignored for PNG (lossless). */
  quality: number;
  resize: ResizeOption;
};

export type ConvertResult = {
  blob: Blob;
  width: number;
  height: number;
};

export type WorkerRequest = {
  id: number;
  file: Blob;
  options: ConvertOptions;
};

export type WorkerResponse =
  | { id: number; ok: true; buffer: ArrayBuffer; mime: string; width: number; height: number }
  | { id: number; ok: false; error: string };

/** Stable key so the UI can tell whether a result matches the current options. */
export function optionsKey(o: ConvertOptions): string {
  const r =
    o.resize.mode === "width"
      ? `w${o.resize.width}`
      : o.resize.mode === "percent"
        ? `p${o.resize.percent}`
        : "o";
  return `${o.format}|${o.format === "png" ? "-" : o.quality}|${r}`;
}
