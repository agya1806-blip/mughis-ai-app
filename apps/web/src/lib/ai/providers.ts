export type AIProvider = "pollinations" | "huggingface";

export function combineSignals(...signals: AbortSignal[]): { signal: AbortSignal; clear(): void } {
  const ctrl = new AbortController();
  const onAbort = () => { ctrl.abort(); signals.forEach((s) => s.removeEventListener("abort", onAbort)); };
  signals.forEach((s) => { if (s.aborted) { ctrl.abort(); } else { s.addEventListener("abort", onAbort); } });
  return { signal: ctrl.signal, clear: () => signals.forEach((s) => s.removeEventListener("abort", onAbort)) };
}
