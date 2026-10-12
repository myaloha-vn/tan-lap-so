import { SITE } from "./core";

/* ===================== Lưu trữ phản ánh / góp ý =====================
   - Nếu SITE.apiBase có giá trị: gửi lên máy chủ (POST {apiBase}/feedback, /suggestions).
   - Nếu chưa có: CHẠY THỬ — lưu trên trình duyệt của người dùng (localStorage),
     cán bộ xã KHÔNG nhận được. Giao diện sẽ hiện cảnh báo rõ ràng. */
export type Feedback = {
  code: string; name: string; phone: string; email?: string; hamlet?: string; field: string;
  title: string; desc: string; location?: string; lat?: number; lng?: number; photos: number;
  status: "Chờ tiếp nhận" | "Đang xử lý" | "Đã xử lý"; createdAt: string;
};
export type Suggestion = { name?: string; contact?: string; content: string; createdAt: string };

export const isDemoMode = () => !SITE.apiBase;

const KEY_FB = "tls_feedback_v1";
const KEY_SG = "tls_suggestions_v1";

function read<T>(key: string): T[] {
  try { return JSON.parse(localStorage.getItem(key) || "[]") as T[]; } catch { return []; }
}
function write<T>(key: string, list: T[]) {
  try { localStorage.setItem(key, JSON.stringify(list)); } catch { /* bộ nhớ bị chặn — bỏ qua */ }
}

export function listFeedback(): Feedback[] { return read<Feedback>(KEY_FB); }

export async function submitFeedback(data: Omit<Feedback, "code" | "status" | "createdAt">): Promise<Feedback> {
  const item: Feedback = { ...data, code: "PA-" + Date.now().toString().slice(-6), status: "Chờ tiếp nhận", createdAt: new Date().toISOString() };
  if (!isDemoMode()) {
    const res = await fetch(`${SITE.apiBase}/feedback`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(item) });
    if (!res.ok) throw new Error("Gửi không thành công, vui lòng thử lại.");
    return { ...item, ...(await res.json().catch(() => ({}))) };
  }
  write(KEY_FB, [item, ...listFeedback()]);
  return item;
}

export function findFeedback(code: string) {
  return listFeedback().find((f) => f.code.toLowerCase() === code.trim().toLowerCase());
}

export async function submitSuggestion(data: Omit<Suggestion, "createdAt">) {
  const item: Suggestion = { ...data, createdAt: new Date().toISOString() };
  if (!isDemoMode()) {
    const res = await fetch(`${SITE.apiBase}/suggestions`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(item) });
    if (!res.ok) throw new Error("Gửi không thành công, vui lòng thử lại.");
    return item;
  }
  write(KEY_SG, [item, ...read<Suggestion>(KEY_SG)]);
  return item;
}

export const fmtDate = (iso: string) => (iso ? new Date(iso).toLocaleDateString("vi-VN") : "Đang cập nhật");
