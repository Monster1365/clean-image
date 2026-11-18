"use client";

import { SegmentedControl } from "@/components/ui/SegmentedControl";
import type { ConvertOptions, OutputFormat, ResizeOption } from "@/lib/convert/types";

const formatOptions: { value: OutputFormat; label: string }[] = [
  { value: "jpg", label: "JPG" },
  { value: "png", label: "PNG" },
  { value: "webp", label: "WEBP" },
  { value: "avif", label: "AVIF" },
];

type ResizeMode = ResizeOption["mode"];
const resizeOptions: { value: ResizeMode; label: string }[] = [
  { value: "original", label: "원본" },
  { value: "width", label: "너비" },
  { value: "percent", label: "비율" },
];

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
      <span className="w-14 shrink-0 text-sm text-muted-foreground">{label}</span>
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

const inputClass =
  "h-9 w-24 rounded-md border border-border-strong bg-surface px-3 text-sm tabular-nums outline-none focus-visible:border-primary";

export function OptionsPanel({
  options,
  onChange,
}: {
  options: ConvertOptions;
  onChange: (o: ConvertOptions) => void;
}) {
  const set = (patch: Partial<ConvertOptions>) => onChange({ ...options, ...patch });
  const { resize } = options;

  const setResizeMode = (mode: ResizeMode) => {
    if (mode === "original") set({ resize: { mode } });
    if (mode === "width") set({ resize: { mode, width: 1920 } });
    if (mode === "percent") set({ resize: { mode, percent: 50 } });
  };

  return (
    <div className="flex flex-col gap-5 rounded-lg border border-border p-5 sm:p-6">
      <Row label="포맷">
        <SegmentedControl
          label="출력 포맷"
          value={options.format}
          options={formatOptions}
          onChange={(format) => set({ format })}
        />
      </Row>

      {options.format !== "png" && (
        <Row label="품질">
          <input
            type="range"
            min={1}
            max={100}
            value={options.quality}
            onChange={(e) => set({ quality: Number(e.target.value) })}
            aria-label="품질"
            className="h-1.5 min-w-0 flex-1 cursor-pointer accent-primary"
          />
          <span className="w-8 text-right text-sm font-medium tabular-nums">{options.quality}</span>
        </Row>
      )}

      <Row label="크기">
        <SegmentedControl
          label="크기 조절"
          value={resize.mode}
          options={resizeOptions}
          onChange={setResizeMode}
        />
        {resize.mode === "width" && (
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="number"
              min={1}
              max={10000}
              value={resize.width || ""}
              onChange={(e) =>
                set({ resize: { mode: "width", width: Math.min(10000, Number(e.target.value) || 0) } })
              }
              aria-label="너비(px)"
              className={inputClass}
            />
            px
          </label>
        )}
        {resize.mode === "percent" && (
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="number"
              min={1}
              max={400}
              value={resize.percent || ""}
              onChange={(e) =>
                set({ resize: { mode: "percent", percent: Math.min(400, Number(e.target.value) || 0) } })
              }
              aria-label="비율(%)"
              className={inputClass}
            />
            %
          </label>
        )}
      </Row>
    </div>
  );
}
