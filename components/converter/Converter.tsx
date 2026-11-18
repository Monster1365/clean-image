"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { convertImage } from "@/lib/convert/client";
import { optionsKey, type ConvertOptions } from "@/lib/convert/types";
import { replaceExtension } from "@/lib/format";
import { downloadBlob, makeZip } from "@/lib/zip";
import { ACCEPT, DropZone } from "./DropZone";
import { FileRow, type FileItem } from "./FileRow";
import { OptionsPanel } from "./OptionsPanel";

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const MAX_FILES = 50;
const ACCEPTED = new Set(ACCEPT.split(","));

type Item = FileItem & { fatal?: boolean };

let seq = 0;
const newId = () => `f${Date.now().toString(36)}${(seq++).toString(36)}`;

export function Converter() {
  const [items, setItems] = useState<Item[]>([]);
  const [options, setOptions] = useState<ConvertOptions>({
    format: "webp",
    quality: 80,
    resize: { mode: "original" },
  });
  const [zipping, setZipping] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const key = optionsKey(options);

  // Release preview object URLs when the component unmounts.
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);
  useEffect(() => () => itemsRef.current.forEach((i) => URL.revokeObjectURL(i.previewUrl)), []);

  const update = (id: string, patch: Partial<Item>) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  function addFiles(files: File[]) {
    const room = MAX_FILES - items.length;
    const accepted = files.slice(0, Math.max(0, room));
    setNotice(
      files.length > accepted.length ? `한 번에 최대 ${MAX_FILES}장까지 추가할 수 있습니다.` : null,
    );

    const next: Item[] = accepted.map((file) => {
      const base = { id: newId(), file, previewUrl: URL.createObjectURL(file) };
      if (!ACCEPTED.has(file.type))
        return { ...base, status: "error", error: "지원하지 않는 형식", fatal: true };
      if (file.size > MAX_FILE_SIZE)
        return { ...base, status: "error", error: "20MB 초과", fatal: true };
      return { ...base, status: "idle" };
    });
    setItems((prev) => [...prev, ...next]);
  }

  function remove(id: string) {
    setItems((prev) => {
      const target = prev.find((i) => i.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  }

  function clearAll() {
    items.forEach((i) => URL.revokeObjectURL(i.previewUrl));
    setItems([]);
    setNotice(null);
  }

  const isStale = (i: Item) => i.status === "done" && i.resultKey !== key;
  const needsWork = (i: Item) =>
    !i.fatal && (i.status === "idle" || i.status === "error" || isStale(i));

  const pending = items.filter(needsWork);
  const working = items.some((i) => i.status === "working");
  const ready = items.filter((i) => i.status === "done" && !isStale(i) && i.result);

  const invalidResize =
    (options.resize.mode === "width" && !(options.resize.width > 0)) ||
    (options.resize.mode === "percent" && !(options.resize.percent > 0));

  function convertAll() {
    const opts = options;
    const k = key;
    for (const item of pending) {
      update(item.id, { status: "working", error: undefined });
      convertImage(item.file, opts).then(
        (result) => update(item.id, { status: "done", result, resultKey: k }),
        (err: Error) => update(item.id, { status: "error", error: err.message }),
      );
    }
  }

  const outName = (i: Item) => replaceExtension(i.file.name, i.resultKey!.split("|")[0]);

  async function downloadAll() {
    if (ready.length === 1) {
      downloadBlob(ready[0].result!.blob, outName(ready[0]));
      return;
    }
    setZipping(true);
    try {
      const zip = await makeZip(ready.map((i) => ({ name: outName(i), blob: i.result!.blob })));
      downloadBlob(zip, "clean-image.zip");
    } finally {
      setZipping(false);
    }
  }

  if (items.length === 0) return <DropZone onFiles={addFiles} />;

  return (
    <div className="flex flex-col gap-6">
      <OptionsPanel options={options} onChange={setOptions} />

      <div>
        <ul className="divide-y divide-border border-y border-border">
          {items.map((item) => (
            <FileRow
              key={item.id}
              item={item}
              stale={isStale(item)}
              onDownload={() => downloadBlob(item.result!.blob, outName(item))}
              onRemove={() => remove(item.id)}
            />
          ))}
        </ul>
        {notice && <p className="mt-3 text-sm text-warning">{notice}</p>}
      </div>

      <DropZone onFiles={addFiles} compact />

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" onClick={clearAll} disabled={working}>
          모두 지우기
        </Button>
        {pending.length > 0 || working ? (
          <Button size="lg" onClick={convertAll} disabled={working || invalidResize}>
            {working ? "변환 중…" : `${pending.length}장 변환하기`}
          </Button>
        ) : (
          <Button size="lg" onClick={downloadAll} disabled={ready.length === 0 || zipping}>
            {zipping
              ? "압축 중…"
              : ready.length > 1
                ? `${ready.length}장 ZIP으로 받기`
                : "다운로드"}
          </Button>
        )}
      </div>
    </div>
  );
}
