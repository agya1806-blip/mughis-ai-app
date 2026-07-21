type Task = {
  id: string;
  type: string;
  payload: unknown;
  status: "pending" | "processing" | "completed" | "failed";
  error?: string;
  retries: number;
  created_at: string;
};

type Handler = (task: Task) => Promise<unknown>;

const handlers = new Map<string, Handler>();
let tasks: Task[] = [];
let processing = false;

function load(): Task[] {
  try { return JSON.parse(localStorage.getItem("mughis_queue") || "[]"); } catch { return []; }
}

function save() {
  localStorage.setItem("mughis_queue", JSON.stringify(tasks));
}

export function register(type: string, handler: Handler) {
  handlers.set(type, handler);
}

export function enqueue(type: string, payload: unknown): Task {
  tasks = load();
  const task: Task = {
    id: crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    type,
    payload,
    status: "pending",
    retries: 0,
    created_at: new Date().toISOString(),
  };
  tasks.push(task);
  save();
  process();
  return task;
}

export function getAll(): Task[] {
  return load();
}

export function clearCompleted() {
  tasks = load().filter((t) => t.status === "pending" || t.status === "processing");
  save();
}

async function process() {
  if (processing) return;
  processing = true;
  tasks = load();
  const pending = tasks.filter((t) => t.status === "pending");
  for (const task of pending) {
    const handler = handlers.get(task.type);
    if (!handler) continue;
    task.status = "processing";
    save();
    try {
      await handler(task);
      task.status = "completed";
    } catch (err: any) {
      task.retries++;
      if (task.retries >= 3) {
        task.status = "failed";
        task.error = err.message;
      } else {
        task.status = "pending";
      }
    }
    save();
  }
  processing = false;
}

if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
  navigator.serviceWorker.ready.then((reg: any) => {
    if (reg.sync) reg.sync.register("sync-queue");
  });
}
