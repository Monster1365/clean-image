/// <reference lib="webworker" />
// Runs entirely off the main thread: decode → resize → encode.
// Codecs (see codecs.ts) are imported lazily so each WASM file is only
// downloaded when that output format is first used.

import type {
  ConvertOptions,
  OutputFormat,
  ResizeOption,
  WorkerRequest,
  WorkerResponse,
} from "./types";
import { MIME_TYPES } from "./types";
import { getEncoder } from "./codecs";
import { decodeHeic } from "./heic";
import { sniffHeic } from "./heic-detect";

declare const self: DedicatedWorkerGlobalScope;

function targetSize(w: number, h: number, resize: ResizeOption) {
  let scale = 1;
  if (resize.mode === "width" && resize.width > 0) scale = resize.width / w;
  if (resize.mode === "percent" && resize.percent > 0) scale = resize.percent / 100;
  return {
    width: Math.max(1, Math.round(w * scale)),
    height: Math.max(1, Math.round(h * scale)),
  };
}

/** Decode any supported input to an ImageBitmap. HEIC goes through libheif (see heic.ts). */
async function decode(file: Blob): Promise<ImageBitmap> {
  if (await sniffHeic(file)) {
    return createImageBitmap(await decodeHeic(file));
  }
  return createImageBitmap(file, { imageOrientation: "from-image" });
}

async function rasterize(file: Blob, options: ConvertOptions): Promise<ImageData> {
  const bitmap = await decode(file);
  try {
    const { width, height } = targetSize(bitmap.width, bitmap.height, options.resize);
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error("캔버스를 만들 수 없습니다.");

    // JPG has no alpha channel: flatten transparent pixels onto white.
    if (options.format === "jpg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
    }
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, 0, 0, width, height);
    return ctx.getImageData(0, 0, width, height);
  } finally {
    bitmap.close();
  }
}

async function encode(img: ImageData, format: OutputFormat, quality: number): Promise<ArrayBuffer> {
  const encoder = await getEncoder(format);
  return encoder(img, quality);
}

self.onmessage = async (e: MessageEvent<WorkerRequest>) => {
  const { id, file, options } = e.data;
  try {
    const img = await rasterize(file, options);
    const buffer = await encode(img, options.format, options.quality);
    const res: WorkerResponse = {
      id,
      ok: true,
      buffer,
      mime: MIME_TYPES[options.format],
      width: img.width,
      height: img.height,
    };
    self.postMessage(res, [buffer]);
  } catch (err) {
    const message =
      err instanceof DOMException && err.name === "InvalidStateError"
        ? "이미지를 읽을 수 없습니다."
        : err instanceof Error
          ? err.message
          : "변환에 실패했습니다.";
    const res: WorkerResponse = { id, ok: false, error: message };
    self.postMessage(res);
  }
};
