"use client";

import { useState } from "react";
import { Download, Loader2, X } from "lucide-react";
import { looksLikeHeic } from "@/lib/convert/heic-detect";
import { formatBytes, sizeChange } from "@/lib/format";
import type { ConvertResult } from "@/lib/convert/types";

export type ItemStatus = "idle" | "working" | "done" | "error";

export type FileItem = {
  id: string;
  file: File;
  previewUrl: string;
  status: ItemStatus;
  result?: ConvertResult;
  resultKey?: string;
  error?: string;
};

const thumbClass = "size-11 shrink-0 rounded-md border border-border bg-surface-muted";

/** Preview image; falls back to a plain tile when the browser can't render it (e.g. HEIC outside Safari). */
function Thumb({ file, src }: { file: File; src: string }) {
  const [broken, setBroken] = useState(false);
  const heic = looksLikeHeic(file);

  if (broken || !(file.type.startsWith("image/") || heic)) {
    return (
      <span
        className={`${thumbClass} grid place-items-center text-[10px] font-semibold text-muted-foreground`}
      >
        {heic ? "HEIC" : null}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- local blob preview
    <img src={src} alt="" onError={() => setBroken(true)} className={`${thumbClass} object-cover`} />
  );
}

export function FileRow({
  item,
  stale,
  onDownload,
  onRemove,
}: {
  item: FileItem;
  stale: boolean;
  onDownload: () => void;
  onRemove: () => void;
}) {
  const { file, result, status } = item;
  const done = status === "done" && result;
  const change = done ? sizeChange(file.size, result.blob.size) : 0;

  return (
    <li className="flex items-center gap-4 py-3">
      <Thumb file={file} src={item.previewUrl} />

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{file.name}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground tabular-nums">
          {formatBytes(file.size)}
          {done && (
            <>
              {" → "}
              <span className="text-foreground">{formatBytes(result.blob.size)}</span>{" "}
              <span className={change <= 0 ? "text-success" : "text-warning"}>
                ({change > 0 ? "+" : ""}
                {change}%)
              </span>
              <span className="hidden sm:inline">
                {" · "}
                {result.width}×{result.height}
              </span>
            </>
          )}
          {status === "error" && <span className="text-danger"> · {item.error}</span>}
          {done && stale && <span> · 설정 변경됨</span>}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {status === "working" && (
          <Loader2 className="size-4 animate-spin text-muted-foreground" aria-label="변환 중" />
        )}
        {done && (
          <button
            type="button"
            onClick={onDownload}
            aria-label={`${file.name} 다운로드`}
            title="다운로드"
            className="grid size-8 cursor-pointer place-items-center rounded-md text-primary transition-colors hover:bg-primary-soft"
          >
            <Download className="size-4" />
          </button>
        )}
        <button
          type="button"
          onClick={onRemove}
          disabled={status === "working"}
          aria-label={`${file.name} 삭제`}
          title="삭제"
          className="grid size-8 cursor-pointer place-items-center rounded-md text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground disabled:cursor-default disabled:opacity-40"
        >
          <X className="size-4" />
        </button>
      </div>
    </li>
  );
}
