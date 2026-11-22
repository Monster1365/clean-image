// Lightweight HEIC/HEIF detection, safe to import from UI code
// (the decoder itself lives in heic.ts and is only loaded inside the worker).

const HEIC_EXT = /\.(heic|heif)$/i;
const HEIC_MIME = new Set(["image/heic", "image/heif", "image/heic-sequence", "image/heif-sequence"]);
// ISO-BMFF major brands used by HEIF images encoded with HEVC.
// (AVIF shares the container but uses the "avif"/"avis" brands, so it is not matched.)
const HEIC_BRANDS = new Set(["heic", "heix", "hevc", "hevx", "heim", "heis", "mif1", "msf1"]);

/** Cheap check from name/MIME only (MIME is often empty for HEIC on Chrome/Firefox). */
export function looksLikeHeic(file: { name?: string; type: string }): boolean {
  return HEIC_MIME.has(file.type) || (!!file.name && HEIC_EXT.test(file.name));
}

/** Reliable check from the file header: `....ftyp<brand>`. */
export async function sniffHeic(blob: Blob): Promise<boolean> {
  const head = new Uint8Array(await blob.slice(0, 12).arrayBuffer());
  if (head.length < 12) return false;
  const ascii = (a: number, b: number) => String.fromCharCode(...head.subarray(a, b));
  return ascii(4, 8) === "ftyp" && HEIC_BRANDS.has(ascii(8, 12));
}
