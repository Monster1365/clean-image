"use client";

import { useRef, useState } from "react";
import { ImageUp } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const ACCEPT = "image/png,image/jpeg,image/webp,image/avif,image/gif,image/bmp";
// HEIC MIME types are often missing on Chrome/Firefox, so extensions are listed too.
const INPUT_ACCEPT = `${ACCEPT},image/heic,image/heif,.heic,.heif`;

export function DropZone({
  onFiles,
  compact = false,
}: {
  onFiles: (files: File[]) => void;
  compact?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const depth = useRef(0);

  const open = () => inputRef.current?.click();

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="이미지 파일 선택"
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open();
        }
      }}
      onDragEnter={(e) => {
        e.preventDefault();
        depth.current++;
        setDragging(true);
      }}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={() => {
        depth.current--;
        if (depth.current <= 0) setDragging(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        depth.current = 0;
        setDragging(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length) onFiles(files);
      }}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed text-center transition-colors ${
        dragging
          ? "border-primary bg-primary-soft"
          : "border-border-strong bg-surface-muted hover:border-primary hover:bg-primary-soft"
      } ${compact ? "gap-2 px-6 py-8" : "gap-5 px-6 py-20 sm:py-24"}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={INPUT_ACCEPT}
        multiple
        hidden
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = "";
          if (files.length) onFiles(files);
        }}
      />

      {compact ? (
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">이미지 추가</span> · 끌어다 놓거나 클릭
        </p>
      ) : (
        <>
          <span className="grid size-14 place-items-center rounded-lg border border-border bg-surface">
            <ImageUp className="size-7 text-primary" strokeWidth={1.5} aria-hidden />
          </span>
          <div>
            <p className="font-medium">이미지를 여기로 끌어다 놓으세요</p>
            <p className="mt-1.5 text-sm text-muted-foreground">
              또는 클릭해서 파일 선택 · 최대 20MB · HEIC(아이폰 사진) 지원
            </p>
          </div>
          <Button size="md" className="pointer-events-none mt-2" tabIndex={-1}>
            파일 선택
          </Button>
        </>
      )}
    </div>
  );
}
