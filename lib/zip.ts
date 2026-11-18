import { zip, type Zippable } from "fflate";

/** Bundle files into one ZIP. Images are already compressed, so entries are stored (level 0). */
export async function makeZip(files: { name: string; blob: Blob }[]): Promise<Blob> {
  const used = new Map<string, number>();
  const entries: Zippable = {};

  for (const { name, blob } of files) {
    let unique = name;
    const count = used.get(name) ?? 0;
    if (count > 0) {
      const dot = name.lastIndexOf(".");
      unique = dot > 0 ? `${name.slice(0, dot)} (${count})${name.slice(dot)}` : `${name} (${count})`;
    }
    used.set(name, count + 1);
    entries[unique] = [new Uint8Array(await blob.arrayBuffer()), { level: 0 }];
  }

  const data = await new Promise<Uint8Array>((resolve, reject) =>
    zip(entries, (err, out) => (err ? reject(err) : resolve(out))),
  );
  return new Blob([data as BlobPart], { type: "application/zip" });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
