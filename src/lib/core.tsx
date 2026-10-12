import { useEffect, useState, type ReactNode } from "react";

/* ===================== Cấu hình chung của cổng thông tin =====================
   Sửa thông tin liên hệ, toạ độ (thời tiết), link quản trị tại đây. */
export const SITE = {
  name: "Tân Lập Số",
  unit: "Xã Tân Lập",
  place: "Xã Tân Lập, tỉnh Tây Ninh",
  ubnd: "UBND xã Tân Lập",
  address: "Tổ 14, ấp Tân Hòa, xã Tân Lập, tỉnh Tây Ninh",
  phone: "0276.3742.139", // đường dây nóng TT Phục vụ HCC xã (Tuổi Trẻ 28/6/2025)
  hotline2: "0327.208.848",
  email: "", // ví dụ "xatanlap@tayninh.gov.vn"
  hours: "Thứ Hai – Thứ Sáu, trong giờ hành chính",
  lat: 11.6778,
  lon: 106.04,
  adminUrl: "#",
  zaloUrl: "", // link Zalo OA của xã (nếu có)
  // Địa chỉ API nhận phản ánh/góp ý. Để trống: hệ thống chạy thử, lưu trên trình duyệt.
  apiBase: "",
  demo: true, // hiện nhãn "Bản thử nghiệm" khi chưa phải cổng chính thức
};

export const orPending = (v?: string | number | null) => (v === undefined || v === null || v === "" ? "Đang cập nhật" : String(v));

export const photos = {
  hero: `${import.meta.env.BASE_URL}bg-tan-lap.jpg`, // ảnh nền toàn trang (ảnh cũ: hero-tan-lap.jpg)
  town: "https://images.unsplash.com/photo-1504457047772-27faf1c00561?auto=format&fit=crop&w=900&q=82",
  temple: "https://images.unsplash.com/photo-1618165220283-e85246c4171c?auto=format&fit=crop&w=900&q=82",
  arch: "https://images.unsplash.com/photo-1572551887368-450aa6d8346e?auto=format&fit=crop&w=900&q=82",
  culture: "https://images.unsplash.com/photo-1532904852347-f4e5e1d80751?auto=format&fit=crop&w=900&q=82",
  street: "https://images.unsplash.com/photo-1504699439244-a7e34870c35d?auto=format&fit=crop&w=900&q=82",
  public: "https://images.unsplash.com/photo-1696147861399-93bdb59749dd?auto=format&fit=crop&w=900&q=82",
  heritage: "https://images.unsplash.com/photo-1713685714770-384c5654f6be?auto=format&fit=crop&w=900&q=82",
  park: "https://images.unsplash.com/photo-1601264405801-246728ebdf10?auto=format&fit=crop&w=900&q=82",
  forest: `${import.meta.env.BASE_URL}can-cu-tw-cuc-mien-nam.jpg`, // ảnh Khu di tích Căn cứ Trung ương Cục miền Nam
};

/* ===================== Định tuyến (hash router) =====================
   Đường dẫn dạng  #/khu-vuc/chi-tiet?tham-so=...  — chạy được cả khi mở file tĩnh,
   không cần cấu hình máy chủ. */
export type Route = { path: string; parts: string[]; query: URLSearchParams };

function parseRoute(): Route {
  const h = window.location.hash;
  const raw = h.startsWith("#/") ? h.slice(1) : "/";
  const [path, qs] = raw.split("?");
  return { path: path || "/", parts: (path || "/").split("/").filter(Boolean).map(decodeURIComponent), query: new URLSearchParams(qs || "") };
}

export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(parseRoute);
  useEffect(() => {
    const onChange = () => {
      if (!window.location.hash.startsWith("#/") && window.location.hash !== "") return; // anchor trong trang
      setRoute(parseRoute());
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    };
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return route;
}

export const to = (path: string) => `#${path.startsWith("/") ? path : "/" + path}`;
export const go = (path: string) => { window.location.hash = to(path); };

export function slugify(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
export const fold = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d");

/* ===================== Biểu tượng ===================== */
export type IconName =
  | "search" | "user" | "menu" | "close" | "arrow" | "back" | "pin" | "map" | "file"
  | "heart" | "building" | "camera" | "home" | "users" | "school" | "health"
  | "area" | "park" | "phone" | "chat" | "bot" | "guide" | "calendar"
  | "shield" | "layers" | "megaphone" | "chevron" | "clock" | "mail" | "check"
  | "info" | "external" | "upload" | "locate" | "route" | "star" | "grid" | "list" | "chart" | "flag";

export function Icon({ name, size = 22 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4.5 21a7.5 7.5 0 0 1 15 0" /></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    arrow: <><path d="M5 12h14M14 7l5 5-5 5" /></>,
    back: <><path d="M19 12H5M10 7l-5 5 5 5" /></>,
    pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    map: <><path d="m3 6 5-3 8 3 5-3v15l-5 3-8-3-5 3V6Z" /><path d="M8 3v15M16 6v15" /></>,
    file: <><path d="M6 3h8l4 4v14H6V3Z" /><path d="M14 3v5h5M9 13h6M9 17h6" /></>,
    heart: <><path d="M20.8 5.8a5.5 5.5 0 0 0-7.8 0L12 6.9l-1.1-1.1a5.5 5.5 0 0 0-7.7 7.8L12 22l8.8-8.4a5.5 5.5 0 0 0 0-7.8Z" /></>,
    building: <><path d="M4 21V9l8-5 8 5v12M8 21v-7h8v7M9 10h.01M15 10h.01" /></>,
    camera: <><path d="M4 7h4l2-3h4l2 3h4v13H4V7Z" /><circle cx="12" cy="13" r="4" /></>,
    home: <><path d="m3 11 9-8 9 8v10h-6v-6H9v6H3V11Z" /></>,
    users: <><circle cx="9" cy="8" r="3" /><circle cx="17" cy="9" r="2.5" /><path d="M3 20a6 6 0 0 1 12 0M14 15a5 5 0 0 1 7 5" /></>,
    school: <><path d="m3 9 9-5 9 5-9 5-9-5Z" /><path d="M7 12v5c3 2 7 2 10 0v-5M21 9v7" /></>,
    health: <><path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6V3Z" /></>,
    area: <><path d="M4 4h6M4 4v6M20 4h-6M20 4v6M4 20h6M4 20v-6M20 20h-6M20 20v-6" /></>,
    park: <><path d="M12 3 7 10h3l-5 7h6v4h2v-4h6l-5-7h3l-5-7Z" /></>,
    phone: <><path d="M7 3H4v4c0 7.2 5.8 13 13 13h4v-3l-5-2-2 2c-3-1-6-4-7-7l2-2-2-5Z" /></>,
    chat: <><path d="M4 4h16v13H9l-5 4V4Z" /><path d="M8 9h8M8 13h5" /></>,
    bot: <><rect x="4" y="6" width="16" height="13" rx="3" /><path d="M12 2v4M8 11h.01M16 11h.01M8 15h8" /></>,
    guide: <><path d="M4 5c4-2 6 0 8 2v14c-2-2-4-4-8-2V5ZM20 5c-4-2-6 0-8 2v14c2-2 4-4 8-2V5Z" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18" /></>,
    shield: <><path d="M12 3 4 6v6c0 5 3.5 8 8 10 4.5-2 8-5 8-10V6l-8-3Z" /><path d="m9 12 2 2 4-4" /></>,
    layers: <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5M3 16l9 5 9-5" /></>,
    megaphone: <><path d="M4 10v4h4l9 4V6L8 10H4ZM8 14l2 6h3" /><path d="M20 9v6" /></>,
    chevron: <><path d="m9 18 6-6-6-6" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
    check: <><path d="m5 12 5 5 9-10" /></>,
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7.5h.01" /></>,
    external: <><path d="M14 4h6v6M20 4l-9 9" /><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" /></>,
    upload: <><path d="M12 16V4M7 9l5-5 5 5" /><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" /></>,
    locate: <><circle cx="12" cy="12" r="4" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3" /></>,
    route: <><circle cx="6" cy="18" r="2.5" /><circle cx="18" cy="6" r="2.5" /><path d="M8.5 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.5" /></>,
    star: <><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z" /></>,
    grid: <><rect x="4" y="4" width="7" height="7" rx="1.5" /><rect x="13" y="4" width="7" height="7" rx="1.5" /><rect x="4" y="13" width="7" height="7" rx="1.5" /><rect x="13" y="13" width="7" height="7" rx="1.5" /></>,
    list: <><path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" /></>,
    chart: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></>,
    flag: <><path d="M5 21V4M5 4h11l-2 4 2 4H5" /></>,
  };
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <div className={`logo ${light ? "logo--light" : ""}`}>
      <div className="logo__mark"><span></span><span></span><span></span></div>
      <div><strong>TÂN LẬP</strong><small>CỔNG THÔNG TIN SỐ</small></div>
    </div>
  );
}

export function SectionHeading({ eyebrow, title, action, href }: { eyebrow: string; title: string; action?: string; href?: string }) {
  return (
    <div className="section-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
      </div>
      {action && <a className="view-all" href={href || "#"}>{action}<Icon name="arrow" size={18} /></a>}
    </div>
  );
}

export function EmptyState({ icon = "info", title, children }: { icon?: IconName; title: string; children?: ReactNode }) {
  return (
    <div className="empty-state">
      <span><Icon name={icon} size={30} /></span>
      <strong>{title}</strong>
      {children && <p>{children}</p>}
    </div>
  );
}
