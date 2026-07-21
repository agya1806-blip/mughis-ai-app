let container: HTMLDivElement | null = null;

function getContainer() {
  if (!container) {
    container = document.createElement("div");
    container.style.cssText = "position:fixed;top:16px;right:16px;z-index:9999;display:flex;flex-direction:column;gap:8px;pointer-events:none";
    document.body.appendChild(container);
  }
  return container;
}

function show(message: string, bg: string) {
  if (typeof document === "undefined") return;
  if (!document.querySelector("style#mughis-toast-style")) {
    const s = document.createElement("style");
    s.id = "mughis-toast-style";
    s.textContent = `@keyframes mughisSlideIn{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}@keyframes mughisFadeOut{from{opacity:1}to{opacity:0}}`;
    document.head.appendChild(s);
  }
  const el = document.createElement("div");
  el.style.cssText = `padding:10px 16px;border-radius:12px;font-size:13px;font-weight:500;color:white;background:${bg};box-shadow:0 8px 24px rgba(0,0,0,0.3);animation:mughisSlideIn 0.3s ease-out;pointer-events:auto;max-width:320px;word-break:break-word`;
  el.textContent = message;
  getContainer().appendChild(el);
  setTimeout(() => { el.style.animation = "mughisFadeOut 0.3s ease-out forwards"; setTimeout(() => el.remove(), 300); }, 2500);
}

export function toast(message: string) { show(message, "#16a34a"); }
toast.success = (m: string) => show(m, "#16a34a");
toast.error = (m: string) => show(m, "#dc2626");
