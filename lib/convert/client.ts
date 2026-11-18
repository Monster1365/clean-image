// Main-thread side: a small pool of conversion workers with a FIFO queue.

import type { ConvertOptions, ConvertResult, WorkerRequest, WorkerResponse } from "./types";

type Task = {
  req: WorkerRequest;
  resolve: (r: ConvertResult) => void;
  reject: (e: Error) => void;
};

const MAX_WORKERS = 4;

let nextId = 1;
const queue: Task[] = [];
const idle: Worker[] = [];
const busy = new Map<Worker, Task>();
let created = 0;

function poolSize() {
  const cores = typeof navigator !== "undefined" ? navigator.hardwareConcurrency || 2 : 2;
  return Math.max(1, Math.min(MAX_WORKERS, cores - 1));
}

function spawn(): Worker {
  const w = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" });
  w.onmessage = (e: MessageEvent<WorkerResponse>) => {
    const task = busy.get(w);
    busy.delete(w);
    idle.push(w);
    if (task) {
      const msg = e.data;
      if (msg.ok) {
        task.resolve({
          blob: new Blob([msg.buffer], { type: msg.mime }),
          width: msg.width,
          height: msg.height,
        });
      } else {
        task.reject(new Error(msg.error));
      }
    }
    pump();
  };
  w.onerror = (e) => {
    // A crashed worker (e.g. out of memory) is replaced on next use.
    const task = busy.get(w);
    busy.delete(w);
    w.terminate();
    created--;
    task?.reject(new Error(e.message || "변환 중 오류가 발생했습니다."));
    pump();
  };
  created++;
  return w;
}

function pump() {
  while (queue.length > 0) {
    let w = idle.pop();
    if (!w && created < poolSize()) w = spawn();
    if (!w) return;
    const task = queue.shift()!;
    busy.set(w, task);
    w.postMessage(task.req);
  }
}

export function convertImage(file: Blob, options: ConvertOptions): Promise<ConvertResult> {
  return new Promise((resolve, reject) => {
    queue.push({ req: { id: nextId++, file, options }, resolve, reject });
    pump();
  });
}
