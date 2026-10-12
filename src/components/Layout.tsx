import { useEffect, useRef, useState, type ReactNode } from "react";
import { Icon, Logo, SITE, orPending, to, type IconName } from "../lib/core";

/* ===================== Thanh thông tin trên cùng ===================== */
function weatherLabel(code: number): [string, string] {
  if (code === 0) return ["☀️", "Trời quang"];
  if (code <= 2) return ["🌤️", "Ít mây"];
  if (code === 3) return ["☁️", "Nhiều mây"];
  if (code <= 48) return ["🌫️", "Sương mù"];
  if (code <= 57) return ["🌦️", "Mưa phùn"];
  if (code <= 67) return ["🌧️", "Có mưa"];
  if (code <= 82) return ["🌧️", "Mưa rào"];
  return ["⛈️", "Có dông"];
}

export function TopBar() {
  const [now, setNow] = useState(() => new Date());
  const [weather, setWeather] = useState<{ temp: number; code: number } | null>(null);
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(id); }, []);
  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${SITE.lat}&longitude=${SITE.lon}&current=temperature_2m,weather_code&timezone=Asia%2FHo_Chi_Minh`)
        .then((r) => r.json())
        .then((d) => { if (alive && d.current) setWeather({ temp: Math.round(d.current.temperature_2m), code: d.current.weather_code }); })
        .catch(() => {});
    load();
    const id = setInterval(load, 15 * 60 * 1000);
    return () => { alive = false; clearInterval(id); };
  }, []);
  const tz = "Asia/Ho_Chi_Minh";
  const time = new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: tz }).format(now);
  const weekday = new Intl.DateTimeFormat("vi-VN", { weekday: "long", timeZone: tz }).format(now);
  const date = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: tz }).format(now);
  const [wIcon, wText] = weather ? weatherLabel(weather.code) : ["🌤️", "Đang tải thời tiết"];
  return (
    <div className="topbar-wrap">
      <div className="topbar">
        <div className="topbar__time"><strong>{time}</strong><span>Giờ địa phương</span></div>
        <i className="topbar__sep" />
        <span className="topbar__date">{weekday.charAt(0).toUpperCase() + weekday.slice(1)}, {date}</span>
        <i className="topbar__sep topbar__sep--date" />
        <span>{wIcon} {weather ? `${weather.temp}°C · ${wText}` : wText}</span>
        <i className="topbar__sep topbar__sep--place" />
        <span className="topbar__place">📍 {SITE.place}</span>
        <a className="topbar__admin" href={SITE.adminUrl}>Truy cập trang quản trị →</a>
      </div>
    </div>
  );
}

/* ===================== Thanh điều hướng các mục (trang con) ===================== */
export const NAV: { path: string; label: string; icon: IconName }[] = [
  { path: "/", label: "Trang chủ", icon: "home" },
  { path: "/gioi-thieu", label: "Giới thiệu", icon: "building" },
  { path: "/bo-may-to-chuc", label: "Bộ máy", icon: "users" },
  { path: "/ap-so", label: "Ấp số", icon: "home" },
  { path: "/quy-hoach", label: "Quy hoạch", icon: "map" },
  { path: "/du-lich", label: "Du lịch", icon: "camera" },
  { path: "/an-sinh", label: "An sinh", icon: "heart" },
  { path: "/dich-vu-cong", label: "Dịch vụ công", icon: "file" },
  { path: "/phan-anh", label: "Phản ánh", icon: "megaphone" },
  { path: "/tin-tuc", label: "Tin tức", icon: "calendar" },
];

export function SubNav({ current }: { current: string }) {
  const [open, setOpen] = useState(false);
  const active = (p: string) => (p === "/" ? current === "/" : current === p || current.startsWith(p + "/"));
  return (
    <nav className="subnav">
      <div className="container subnav__inner">
        <a href={to("/")} className="subnav__brand" aria-label="Trang chủ"><Logo /></a>
        <button className="subnav__toggle" aria-label="Mở danh mục" onClick={() => setOpen(!open)}><Icon name={open ? "close" : "menu"} /></button>
        <div className={`subnav__links ${open ? "subnav__links--open" : ""}`}>
          {NAV.slice(1).map((n) => <a key={n.path} href={to(n.path)} className={active(n.path) ? "active" : ""} onClick={() => setOpen(false)}>{n.label}</a>)}
        </div>
      </div>
    </nav>
  );
}

/* ===================== Đầu trang con: breadcrumb + tiêu đề ===================== */
export function PageHero({ crumbs, eyebrow, title, desc, children }: { crumbs: [string, string?][]; eyebrow?: string; title: string; desc?: string; children?: ReactNode }) {
  return (
    <section className="page-hero">
      <div className="container">
        <div className="breadcrumb">
          <a href={to("/")}>Trang chủ</a>
          {crumbs.map(([label, path], i) => <span key={i}><Icon name="chevron" size={14} />{path ? <a href={to(path)}>{label}</a> : <b>{label}</b>}</span>)}
        </div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {desc && <p>{desc}</p>}
        {children}
      </div>
    </section>
  );
}

export function Tabs<T extends string>({ value, onChange, items }: { value: T; onChange: (v: T) => void; items: [T, string, number?][] }) {
  return (
    <div className="tabs" role="tablist">
      {items.map(([v, label, count]) => (
        <button key={v} role="tab" aria-selected={value === v} className={value === v ? "active" : ""} onClick={() => onChange(v)}>
          {label}{count !== undefined && <i>{count}</i>}
        </button>
      ))}
    </div>
  );
}

export function DemoNotice({ children }: { children: ReactNode }) {
  return <div className="demo-notice"><Icon name="info" size={18} /><span>{children}</span></div>;
}

/* ===================== Chân trang ===================== */
export function Footer() {
  return (
    <>
      <section className="support-strip">
        <div className="container support-grid">
          {([["chat","Zalo Tân Lập","Kết nối nhanh", SITE.zaloUrl || to("/lien-he")],["bot","Trợ lý AI","Hỏi đáp 24/7","#tro-ly-ai"],["guide","Hướng dẫn","Dễ dàng sử dụng",to("/ho-tro/huong-dan")],["phone","Liên hệ","Luôn lắng nghe",to("/lien-he")]] as [IconName,string,string,string][]).map(([icon,title,desc,href]) =>
            <a href={href} key={title}><span><Icon name={icon} /></span><div><strong>{title}</strong><small>{desc}</small></div><Icon name="chevron" size={18} /></a>)}
        </div>
      </section>
      <footer className="footer">
        <div className="container footer__top">
          <div className="footer__brand"><Logo light /><p>Cổng thông tin số phục vụ người dân, đồng hành cùng sự phát triển của địa phương.</p><div className="footer__badge"><Icon name="shield" size={18} /> {SITE.ubnd}</div></div>
          <div><h4>Khám phá</h4><a href={to("/gioi-thieu")}>Giới thiệu</a><a href={to("/bo-may-to-chuc")}>Bộ máy tổ chức</a><a href={to("/ap-so")}>Ấp số</a><a href={to("/quy-hoach")}>Bản đồ quy hoạch</a><a href={to("/du-lich")}>Du lịch Tân Lập</a></div>
          <div><h4>Hỗ trợ người dân</h4><a href={to("/dich-vu-cong")}>Dịch vụ công</a><a href={to("/phan-anh")}>Phản ánh kiến nghị</a><a href={to("/an-sinh")}>An sinh xã hội</a><a href={to("/ho-tro/cau-hoi-thuong-gap")}>Câu hỏi thường gặp</a><a href={to("/ho-tro/chinh-sach-bao-mat")}>Chính sách bảo mật</a></div>
          <div className="footer__contact"><h4>Thông tin liên hệ</h4><p><Icon name="pin" size={19} /> {SITE.address}</p><p><Icon name="phone" size={19} /> {orPending(SITE.phone)}</p><p><Icon name="mail" size={19} /> {orPending(SITE.email)}</p><p><Icon name="clock" size={19} /> {SITE.hours}</p></div>
        </div>
        <div className="container footer__bottom"><span>© {new Date().getFullYear()} Cổng thông tin {SITE.name} · <a href={to("/ho-tro/dieu-khoan")}>Điều khoản sử dụng</a></span><span>Vì người dân · Phục vụ người dân</span></div>
      </footer>
    </>
  );
}

/* ===================== Trợ lý AI (chatbot góc màn hình) =====================
   Đang trả lời theo bộ câu hỏi mẫu. Khi có API AI thật, sửa hàm askAssistant(). */
type ChatMsg = { from: "bot" | "user"; text: string };
const QUICK_QUESTIONS = ["Thủ tục hành chính", "Gửi phản ánh", "Chính sách an sinh", "Thông tin liên hệ"];
const FAQ_BOT: { keys: string[]; answer: string }[] = [
  { keys: ["thủ tục", "dịch vụ công", "hồ sơ", "giấy tờ", "chứng thực", "khai sinh", "hộ tịch"], answer: "Anh/chị xem mục **Dịch vụ công** để tra cứu thủ tục và nộp hồ sơ trực tuyến bằng tài khoản VNeID, hoặc đến Trung tâm Phục vụ hành chính công xã trong giờ hành chính." },
  { keys: ["phản ánh", "kiến nghị", "khiếu nại", "sự cố"], answer: "Anh/chị vào mục **Phản ánh**, mô tả sự việc, chọn vị trí trên bản đồ và đính kèm hình ảnh. Hệ thống cấp **mã phản ánh** để tra cứu tiến độ xử lý." },
  { keys: ["an sinh", "trợ cấp", "hộ nghèo", "chính sách", "bhyt", "bảo hiểm"], answer: "Mục **An sinh xã hội** có danh sách chính sách theo nhóm (người có công, bảo trợ xã hội, giảm nghèo, y tế...), kèm điều kiện và hồ sơ cần chuẩn bị." },
  { keys: ["giờ", "làm việc", "mở cửa", "thời gian"], answer: `UBND xã làm việc **${SITE.hours}**.` },
  { keys: ["liên hệ", "số điện thoại", "hotline", "địa chỉ", "email", "trụ sở"], answer: `Trụ sở UBND xã: **${SITE.address}**. Đường dây nóng Trung tâm Phục vụ hành chính công: **${SITE.phone}** – **${SITE.hotline2}**. Xem thêm tại mục **Liên hệ**.` },
  { keys: ["chủ tịch", "bí thư", "lãnh đạo", "ai là"], answer: "Bí thư Đảng ủy, Chủ tịch HĐND xã: **Nguyễn Trọng Tấn**. Chủ tịch UBND xã: **Nguyễn Thị Nga**. Chủ tịch Ủy ban MTTQ Việt Nam xã: **Trịnh Hoài Phong**. Xem đầy đủ tại mục **Bộ máy tổ chức**." },
  { keys: ["bản đồ", "quy hoạch", "đất", "thửa"], answer: "Anh/chị vào mục **Quy hoạch** để xem bản đồ ranh giới xã, kiểm tra một vị trí có thuộc xã Tân Lập hay không và các liên kết tra cứu quy hoạch chính thức." },
  { keys: ["du lịch", "di tích", "tham quan", "cục miền nam"], answer: "Điểm đến nổi bật của xã là **Khu di tích Căn cứ Trung ương Cục miền Nam** — di tích quốc gia đặc biệt. Xem thêm tại mục **Du lịch**." },
  { keys: ["xin chào", "chào", "hello", "hi"], answer: "Xin chào anh/chị! Tôi là Trợ lý AI của Tân Lập Số. Tôi có thể hỗ trợ về thủ tục hành chính, phản ánh kiến nghị, chính sách an sinh và thông tin của xã." },
];
async function askAssistant(question: string): Promise<string> {
  const q = question.toLowerCase();
  const hit = FAQ_BOT.find((f) => f.keys.some((k) => q.includes(k)));
  await new Promise((r) => setTimeout(r, 700));
  return hit ? hit.answer : "Cảm ơn anh/chị đã đặt câu hỏi. Hiện tôi chưa có thông tin cho nội dung này, anh/chị vui lòng liên hệ Trung tâm Phục vụ hành chính công xã hoặc gửi **Phản ánh** để được cán bộ hỗ trợ.";
}
function renderBold(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => part.startsWith("**") ? <strong key={i}>{part.slice(2, -2)}</strong> : <span key={i}>{part}</span>);
}
function BotFace({ size = 56 }: { size?: number }) {
  return (
    <svg className="bot-face" width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <line x1="32" y1="6" x2="32" y2="14" stroke="#1747b5" strokeWidth="3" strokeLinecap="round" />
      <circle className="bot-face__antenna" cx="32" cy="6" r="4" fill="#ff9a1f" />
      <rect x="8" y="14" width="48" height="40" rx="16" fill="#fff" stroke="#1747b5" strokeWidth="3" />
      <rect x="14" y="22" width="36" height="22" rx="11" fill="#1747b5" />
      <g className="bot-face__eyes" fill="#7ef0ff"><ellipse cx="24" cy="32" rx="4" ry="5" /><ellipse cx="40" cy="32" rx="4" ry="5" /></g>
      <path d="M26 39 Q32 43 38 39" stroke="#7ef0ff" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <rect x="2" y="28" width="6" height="12" rx="3" fill="#ff9a1f" /><rect x="56" y="28" width="6" height="12" rx="3" fill="#ff9a1f" />
    </svg>
  );
}
export function ChatBot() {
  const [open, setOpen] = useState(false);
  const [hint, setHint] = useState(false);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>([{ from: "bot", text: "Xin chào! Tôi là **Trợ lý AI Tân Lập Số**. Anh/chị cần hỗ trợ gì hôm nay?" }]);
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (open) { setHint(false); return; }
    const show = setTimeout(() => setHint(true), 2500);
    const cycle = setInterval(() => setHint((h) => !h), 7000);
    return () => { clearTimeout(show); clearInterval(cycle); };
  }, [open]);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a[href="#tro-ly-ai"]');
      if (a) { e.preventDefault(); setOpen(true); }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  useEffect(() => { listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" }); }, [messages, typing, open]);
  const send = async (text: string) => {
    const q = text.trim();
    if (!q || typing) return;
    setMessages((m) => [...m, { from: "user", text: q }]);
    setInput("");
    setTyping(true);
    const answer = await askAssistant(q);
    setTyping(false);
    setMessages((m) => [...m, { from: "bot", text: answer }]);
  };
  return (
    <div className={`chatbot ${open ? "chatbot--open" : ""}`}>
      {open && (
        <div className="chatbot__panel" role="dialog" aria-label="Trợ lý AI Tân Lập Số">
          <div className="chatbot__head">
            <span className="chatbot__avatar"><BotFace size={34} /></span>
            <div><strong>Trợ lý AI Tân Lập</strong><small><i />Đang trực tuyến</small></div>
            <button aria-label="Đóng trợ lý" onClick={() => setOpen(false)}><Icon name="close" size={20} /></button>
          </div>
          <div className="chatbot__list" ref={listRef}>
            {messages.map((m, i) => <div key={i} className={`chatbot__msg chatbot__msg--${m.from}`}>{renderBold(m.text)}</div>)}
            {typing && <div className="chatbot__msg chatbot__msg--bot chatbot__typing"><span /><span /><span /></div>}
          </div>
          <div className="chatbot__quick">{QUICK_QUESTIONS.map((q) => <button key={q} onClick={() => send(q)}>{q}</button>)}</div>
          <form className="chatbot__input" onSubmit={(e) => { e.preventDefault(); send(input); }}>
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Nhập câu hỏi của anh/chị..." aria-label="Nhập câu hỏi" />
            <button type="submit" aria-label="Gửi" disabled={!input.trim() || typing}><Icon name="arrow" size={20} /></button>
          </form>
          <p className="chatbot__note">Trợ lý AI có thể chưa chính xác, vui lòng kiểm tra lại với cán bộ xã.</p>
        </div>
      )}
      {!open && hint && <button className="chatbot__hint" onClick={() => setOpen(true)}>Xin chào! 👋 Tôi có thể giúp gì cho anh/chị?</button>}
      <button className="chatbot__fab" aria-label={open ? "Đóng trợ lý AI" : "Mở trợ lý AI"} onClick={() => setOpen(!open)}>
        <span className="chatbot__pulse" />
        {open ? <Icon name="close" size={28} /> : <BotFace />}
      </button>
    </div>
  );
}
