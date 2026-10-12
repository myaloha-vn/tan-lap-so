import { useMemo, useState } from "react";
import { DemoNotice, PageHero, Tabs } from "../components/Layout";
import { EmptyState, Icon, to } from "../lib/core";
import { BoundaryMap, insideCommune } from "../lib/maps";
import { findFeedback, fmtDate, isDemoMode, listFeedback, submitFeedback, submitSuggestion, type Feedback } from "../lib/store";
import { FEEDBACK_FIELDS, HAMLETS } from "../data/content";

const MAX_PHOTOS = 5;
const MAX_MB = 10;

export function FeedbackPage({ hamlet = "", field = "" }: { hamlet?: string; field?: string }) {
  const [tab, setTab] = useState("gui");
  const [items, setItems] = useState<Feedback[]>(() => listFeedback());
  const stats = useMemo(() => ({
    total: items.length,
    doing: items.filter((i) => i.status !== "Đã xử lý").length,
    done: items.filter((i) => i.status === "Đã xử lý").length,
  }), [items]);
  return (
    <main className="subpage">
      <PageHero crumbs={[["Phản ánh kiến nghị"]]} eyebrow="KÊNH TƯƠNG TÁC" title="Phản ánh kiến nghị" desc="Gửi phản ánh về giao thông, môi trường, an ninh trật tự, hạ tầng, thủ tục... — không cần đăng nhập. Mỗi phản ánh được cấp mã để tra cứu tiến độ.">
        <div className="hero-kpis"><div><strong>{stats.total}</strong><small>Tổng phản ánh</small></div><div><strong>{stats.doing}</strong><small>Đang xử lý</small></div><div><strong>{stats.done}</strong><small>Đã xử lý</small></div></div>
      </PageHero>
      <div className="container">
        {isDemoMode() && <DemoNotice>Hệ thống đang <b>chạy thử</b>: phản ánh được lưu trên trình duyệt của bạn, chưa chuyển tới cán bộ xã. Khi kết nối máy chủ (cấu hình <code>SITE.apiBase</code>), phản ánh sẽ được gửi trực tiếp tới UBND xã.</DemoNotice>}
        <Tabs value={tab} onChange={setTab} items={[["gui", "Gửi phản ánh"], ["tra-cuu", "Tra cứu tiến độ"], ["gan-day", "Phản ánh của tôi", items.length], ["gop-y", "Góp ý xây dựng"]]} />
        {tab === "gui" && <FeedbackForm hamlet={hamlet} field={field} onDone={() => setItems(listFeedback())} />}
        {tab === "tra-cuu" && <TrackBox />}
        {tab === "gan-day" && (items.length
          ? <div className="fb-list">{items.map((f) => <FeedbackRow f={f} key={f.code} />)}</div>
          : <EmptyState icon="megaphone" title="Chưa có phản ánh nào trên thiết bị này">Phản ánh bạn gửi sẽ hiển thị tại đây để theo dõi.</EmptyState>)}
        {tab === "gop-y" && <SuggestionForm />}
      </div>
    </main>
  );
}

function FeedbackRow({ f }: { f: Feedback }) {
  const cls = f.status === "Đã xử lý" ? "tag--ok" : f.status === "Đang xử lý" ? "tag--warn" : "tag--muted";
  return (
    <article className="fb-row">
      <div className="fb-row__head"><span className="code">{f.code}</span><span className={`tag ${cls}`}>{f.status}</span></div>
      <h3>{f.title}</h3>
      <p>{f.desc}</p>
      <div className="fb-row__meta"><span><Icon name="flag" size={14} /> {f.field}</span>{f.hamlet && <span><Icon name="home" size={14} /> {f.hamlet}</span>}{f.location && <span><Icon name="pin" size={14} /> {f.location}</span>}<span><Icon name="calendar" size={14} /> {fmtDate(f.createdAt)}</span>{f.photos > 0 && <span><Icon name="camera" size={14} /> {f.photos} ảnh</span>}</div>
    </article>
  );
}

function FeedbackForm({ hamlet, field, onDone }: { hamlet: string; field: string; onDone: () => void }) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", hamlet, field: field || FEEDBACK_FIELDS[0], title: "", desc: "", location: "" });
  const [point, setPoint] = useState<[number, number] | null>(null);
  const [pickOnMap, setPickOnMap] = useState(false);
  const [files, setFiles] = useState<{ name: string; url: string }[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [agree, setAgree] = useState(false);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<Feedback | null>(null);
  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => setForm({ ...form, [k]: e.target.value });

  const setLocation = (lat: number, lng: number) => {
    setPoint([lat, lng]);
    setForm((f) => ({ ...f, location: `${lat.toFixed(5)}, ${lng.toFixed(5)}${insideCommune(lat, lng) ? "" : " (ngoài địa bàn xã)"}` }));
  };
  const myLocation = () => navigator.geolocation?.getCurrentPosition((p) => setLocation(p.coords.latitude, p.coords.longitude), () => setErrors((e) => ({ ...e, location: "Không lấy được vị trí, vui lòng chọn trên bản đồ." })));
  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const next = [...files];
    for (const f of Array.from(list)) {
      if (next.length >= MAX_PHOTOS) break;
      if (!f.type.startsWith("image/")) continue;
      if (f.size > MAX_MB * 1024 * 1024) { setErrors((e) => ({ ...e, photos: `Ảnh "${f.name}" vượt quá ${MAX_MB}MB.` })); continue; }
      next.push({ name: f.name, url: URL.createObjectURL(f) });
    }
    setFiles(next);
  };
  const validate = () => {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 2) e.name = "Vui lòng nhập họ và tên.";
    if (!/^(0|\+84)\d{9,10}$/.test(form.phone.replace(/[\s.]/g, ""))) e.phone = "Số điện thoại chưa hợp lệ.";
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Email chưa hợp lệ.";
    if (form.title.trim().length < 5) e.title = "Vui lòng nhập tiêu đề ngắn gọn (tối thiểu 5 ký tự).";
    if (form.desc.trim().length < 15) e.desc = "Vui lòng mô tả chi tiết hơn (tối thiểu 15 ký tự).";
    if (!files.length) e.photos = "Vui lòng đính kèm ít nhất 1 ảnh minh chứng.";
    if (!agree) e.agree = "Vui lòng xác nhận đồng ý xử lý thông tin.";
    setErrors(e);
    return !Object.keys(e).length;
  };
  const send = async () => {
    if (!validate()) return;
    setSending(true);
    try {
      const res = await submitFeedback({ ...form, lat: point?.[0], lng: point?.[1], photos: files.length });
      setDone(res); onDone();
    } catch (err) { setErrors({ submit: (err as Error).message }); }
    setSending(false);
  };

  if (done) return (
    <div className="card success-card">
      <span className="success-card__icon"><Icon name="check" size={34} /></span>
      <h2>Đã ghi nhận phản ánh</h2>
      <p>Mã phản ánh của bạn: <b className="code">{done.code}</b></p>
      <p className="muted">Vui lòng lưu lại mã để tra cứu tiến độ xử lý.{isDemoMode() ? " (Chế độ chạy thử: phản ánh chỉ lưu trên thiết bị này.)" : ""}</p>
      <div className="btn-row center"><button className="btn btn--primary" onClick={() => { setDone(null); setForm({ ...form, title: "", desc: "", location: "" }); setFiles([]); setPoint(null); setAgree(false); }}>Gửi phản ánh khác</button><a className="btn btn--ghost" href={to("/")}>Về trang chủ</a></div>
    </div>
  );

  return (
    <form className="fb-form" onSubmit={(e) => { e.preventDefault(); send(); }} noValidate>
      <section className="card">
        <h2 className="card__title">Thông tin người gửi</h2>
        <div className="field-row">
          <label className={`field ${errors.name ? "field--err" : ""}`}><span>Họ và tên *</span><input value={form.name} onChange={set("name")} placeholder="Nguyễn Văn A" autoComplete="name" />{errors.name && <em>{errors.name}</em>}</label>
          <label className={`field ${errors.phone ? "field--err" : ""}`}><span>Số điện thoại *</span><input value={form.phone} onChange={set("phone")} placeholder="0901234567" inputMode="tel" autoComplete="tel" />{errors.phone && <em>{errors.phone}</em>}</label>
        </div>
        <div className="field-row">
          <label className={`field ${errors.email ? "field--err" : ""}`}><span>Email (không bắt buộc)</span><input value={form.email} onChange={set("email")} placeholder="email@example.com" inputMode="email" />{errors.email && <em>{errors.email}</em>}</label>
          <label className="field"><span>Ấp</span><select value={form.hamlet} onChange={set("hamlet")}><option value="">-- Chọn ấp --</option>{HAMLETS.map((h) => <option key={h.slug}>{h.name}</option>)}<option>Khác / chưa rõ</option></select></label>
        </div>
        <p className="muted small"><Icon name="shield" size={14} /> Họ tên, số điện thoại chỉ dùng để liên hệ phản hồi, không công khai. Cổng không thu thập số CCCD.</p>
      </section>
      <section className="card">
        <h2 className="card__title">Nội dung phản ánh</h2>
        <div className="field-row">
          <label className="field"><span>Lĩnh vực *</span><select value={form.field} onChange={set("field")}>{FEEDBACK_FIELDS.map((f) => <option key={f}>{f}</option>)}</select></label>
          <label className={`field ${errors.title ? "field--err" : ""}`}><span>Tiêu đề *</span><input value={form.title} onChange={set("title")} placeholder="VD: Đường ấp Tân Hòa xuất hiện ổ gà" maxLength={120} />{errors.title && <em>{errors.title}</em>}</label>
        </div>
        <label className={`field ${errors.desc ? "field--err" : ""}`}><span>Mô tả chi tiết *</span><textarea value={form.desc} onChange={set("desc")} rows={5} placeholder="Mô tả vấn đề cụ thể, địa điểm, thời gian xảy ra..." maxLength={2000} /><small className="counter">{form.desc.length}/2000</small>{errors.desc && <em>{errors.desc}</em>}</label>
        <label className={`field ${errors.location ? "field--err" : ""}`}><span>Địa điểm xảy ra vụ việc</span><input value={form.location} onChange={set("location")} placeholder="Nhập địa chỉ, hoặc dùng các nút bên dưới" />{errors.location && <em>{errors.location}</em>}</label>
        <div className="btn-row">
          <button type="button" className="btn btn--ghost" onClick={myLocation}><Icon name="locate" size={17} /> Lấy vị trí hiện tại</button>
          <button type="button" className={`btn ${pickOnMap ? "btn--primary" : "btn--ghost"}`} onClick={() => setPickOnMap(!pickOnMap)}><Icon name="map" size={17} /> {pickOnMap ? "Đang chọn — bấm lên bản đồ" : "Chọn trên bản đồ"}</button>
        </div>
        {(pickOnMap || point) && <div className="pick-map"><BoundaryMap marker={point} pickMode={pickOnMap} onPick={(lat, lng) => { setLocation(lat, lng); setPickOnMap(false); }} showLabel={false} /></div>}
        <div className={`field ${errors.photos ? "field--err" : ""}`}>
          <span>Hình ảnh minh chứng * (1–{MAX_PHOTOS} ảnh, mỗi ảnh &lt; {MAX_MB}MB)</span>
          <label className="dropzone">
            <input type="file" accept="image/*" multiple onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} disabled={files.length >= MAX_PHOTOS} />
            <Icon name="upload" size={24} /><strong>Nhấn để chọn ảnh</strong><small>{files.length}/{MAX_PHOTOS} ảnh</small>
          </label>
          {files.length > 0 && <div className="thumbs">{files.map((f, i) => <div key={f.url} className="thumb"><img src={f.url} alt={f.name} /><button type="button" aria-label="Xóa ảnh" onClick={() => setFiles(files.filter((_, j) => j !== i))}><Icon name="close" size={14} /></button></div>)}</div>}
          {errors.photos && <em>{errors.photos}</em>}
        </div>
        <label className={`check ${errors.agree ? "field--err" : ""}`}><input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} /> <span>Tôi đồng ý để UBND xã Tân Lập sử dụng thông tin trên nhằm tiếp nhận, xử lý và phản hồi phản ánh (xem <a href={to("/ho-tro/chinh-sach-bao-mat")}>Chính sách bảo mật</a>).</span></label>
        {errors.agree && <em className="err">{errors.agree}</em>}
        {errors.submit && <div className="result result--error"><Icon name="info" size={18} /><span>{errors.submit}</span></div>}
        <button className="btn btn--primary btn--lg" type="submit" disabled={sending}>{sending ? "Đang gửi..." : <>Gửi phản ánh <Icon name="arrow" size={18} /></>}</button>
      </section>
    </form>
  );
}

function TrackBox() {
  const [code, setCode] = useState("");
  const [res, setRes] = useState<Feedback | null | undefined>(undefined);
  return (
    <section className="card track">
      <h2 className="card__title">Tra cứu tiến độ xử lý</h2>
      <form className="inline-search inline-search--lg" onSubmit={(e) => { e.preventDefault(); setRes(findFeedback(code) || null); }}>
        <Icon name="search" size={18} /><input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Nhập mã phản ánh, VD: PA-123456" aria-label="Mã phản ánh" />
        <button className="btn btn--primary" type="submit">Tra cứu</button>
      </form>
      {res === null && <div className="result result--warn"><Icon name="info" size={18} /><span>Không tìm thấy phản ánh với mã này{isDemoMode() ? " trên thiết bị này" : ""}.</span></div>}
      {res && <><FeedbackRow f={res} /><ol className="timeline">
        <li className="done"><b>Đã gửi</b><small>{fmtDate(res.createdAt)}</small></li>
        <li className={res.status !== "Chờ tiếp nhận" ? "done" : ""}><b>Tiếp nhận & phân công</b></li>
        <li className={res.status === "Đã xử lý" ? "done" : ""}><b>Xử lý & phản hồi</b></li>
      </ol></>}
    </section>
  );
}

function SuggestionForm() {
  const [content, setContent] = useState("");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");
  if (sent) return <div className="card success-card"><span className="success-card__icon"><Icon name="heart" size={32} /></span><h2>Cảm ơn góp ý của bạn!</h2><p className="muted">Ý kiến giúp chúng tôi cải thiện dịch vụ và xây dựng Tân Lập Số tốt hơn.</p><button className="btn btn--ghost" onClick={() => { setSent(false); setContent(""); }}>Gửi góp ý khác</button></div>;
  return (
    <form className="card" onSubmit={async (e) => { e.preventDefault(); if (content.trim().length < 10) { setErr("Vui lòng nhập ít nhất 10 ký tự."); return; } try { await submitSuggestion({ name, contact, content }); setSent(true); } catch (x) { setErr((x as Error).message); } }}>
      <h2 className="card__title">💡 Góp ý xây dựng Tân Lập Số</h2>
      <p className="muted">Ý kiến, đề xuất của bạn về cổng thông tin, dịch vụ công hoặc các vấn đề của địa phương.</p>
      <label className={`field ${err ? "field--err" : ""}`}><span>Nội dung góp ý *</span><textarea rows={5} value={content} onChange={(e) => { setContent(e.target.value); setErr(""); }} placeholder="Nhập ý kiến, đề xuất của bạn..." />{err && <em>{err}</em>}</label>
      <div className="field-row"><label className="field"><span>Họ tên (không bắt buộc)</span><input value={name} onChange={(e) => setName(e.target.value)} /></label><label className="field"><span>Liên hệ (không bắt buộc)</span><input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Số điện thoại hoặc email" /></label></div>
      <button className="btn btn--primary" type="submit">Gửi góp ý <Icon name="arrow" size={18} /></button>
    </form>
  );
}
