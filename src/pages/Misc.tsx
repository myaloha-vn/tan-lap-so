import { useMemo, useState, type ReactNode } from "react";
import { PageHero } from "../components/Layout";
import { EmptyState, Icon, SITE, fold, go, orPending, to, type IconName } from "../lib/core";
import { BoundaryMap } from "../lib/maps";
import { DESTINATIONS, FAQS, HAMLETS, NEWS, POLICIES, PROCEDURES } from "../data/content";

export function ContactPage() {
  return (
    <main className="subpage">
      <PageHero crumbs={[["Liên hệ"]]} eyebrow="KẾT NỐI VỚI CHÚNG TÔI" title="Liên hệ UBND xã Tân Lập" desc="Thông tin liên hệ, địa chỉ trụ sở và các kênh hỗ trợ người dân." />
      <div className="container page-grid">
        <div className="page-main">
          <section className="card">
            <h2 className="card__title">Trụ sở Đảng ủy – HĐND – UBND xã</h2>
            <ul className="contact-list contact-list--wide">
              <li><Icon name="pin" size={20} /><div><small>Địa chỉ</small><strong>{SITE.address}</strong></div></li>
              <li><Icon name="phone" size={20} /><div><small>Đường dây nóng TT Phục vụ hành chính công</small><strong className={SITE.phone ? "" : "pending"}>{SITE.phone ? <><a href={`tel:${SITE.phone}`}>{SITE.phone}</a>{SITE.hotline2 && <> – <a href={`tel:${SITE.hotline2}`}>{SITE.hotline2}</a></>}</> : "Đang cập nhật"}</strong></div></li>
              <li><Icon name="mail" size={20} /><div><small>Email</small><strong className={SITE.email ? "" : "pending"}>{SITE.email ? <a href={`mailto:${SITE.email}`}>{SITE.email}</a> : "Đang cập nhật"}</strong></div></li>
              <li><Icon name="clock" size={20} /><div><small>Thời gian làm việc</small><strong>{SITE.hours}</strong></div></li>
            </ul>
            <div className="big-map"><BoundaryMap /></div>
            <a className="btn btn--ghost" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("UBND xã Tân Lập, Tây Ninh")}`} target="_blank" rel="noopener noreferrer"><Icon name="route" size={17} /> Chỉ đường tới trụ sở</a>
          </section>
        </div>
        <aside className="page-side">
          <section className="card">
            <h2 className="card__title">Kênh hỗ trợ</h2>
            <div className="channel-list">
              {([["megaphone", "Gửi phản ánh kiến nghị", "Không cần đăng nhập", to("/phan-anh")], ["bot", "Trợ lý AI", "Hỏi đáp nhanh 24/7", "#tro-ly-ai"], ["file", "Dịch vụ công trực tuyến", "Nộp và tra cứu hồ sơ", to("/dich-vu-cong")], ["chat", "Zalo Tân Lập", orPending(SITE.zaloUrl ? "Mở Zalo" : ""), SITE.zaloUrl || to("/lien-he")]] as [IconName, string, string, string][]).map(([icon, t, d, href]) =>
                <a key={t} href={href} className="channel"><span><Icon name={icon} size={20} /></span><div><strong>{t}</strong><small>{d}</small></div><Icon name="chevron" size={16} /></a>)}
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}

const SUPPORT: Record<string, { title: string; body: () => ReactNode }> = {
  "huong-dan": { title: "Hướng dẫn sử dụng", body: () => (
    <>
      <h3>Tìm thông tin</h3><p>Dùng ô tìm kiếm ở trang chủ để tìm thủ tục, chính sách, điểm đến, tin tức. Các mục chính: Giới thiệu, Ấp số, Quy hoạch, Du lịch, An sinh, Dịch vụ công, Phản ánh, Tin tức.</p>
      <h3>Gửi phản ánh</h3><p>Vào mục Phản ánh → nhập họ tên, số điện thoại, mô tả sự việc, chọn vị trí trên bản đồ, đính kèm 1–5 ảnh → Gửi. Lưu mã phản ánh (dạng PA-xxxxxx) để tra cứu tiến độ.</p>
      <h3>Nộp hồ sơ trực tuyến</h3><p>Vào mục Dịch vụ công → làm theo 5 bước hướng dẫn, sử dụng tài khoản VNeID mức độ 2.</p>
      <h3>Bản đồ số</h3><p>Ở mục Quy hoạch, bấm lên bản đồ hoặc dùng “Vị trí của tôi” để kiểm tra một điểm có thuộc địa bàn xã Tân Lập hay không. Chuyển lớp Bản đồ / Vệ tinh ở góc trên.</p>
      <h3>Trợ lý AI</h3><p>Bấm biểu tượng robot ở góc phải màn hình để hỏi nhanh. Thông tin từ trợ lý mang tính tham khảo.</p>
    </>
  ) },
  "cau-hoi-thuong-gap": { title: "Câu hỏi thường gặp", body: () => <div className="faq">{FAQS.map((f) => <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>)}</div> },
  "chinh-sach-bao-mat": { title: "Chính sách bảo mật", body: () => (
    <>
      <p>Cổng thông tin Tân Lập Số tôn trọng và bảo vệ dữ liệu cá nhân của người dân theo Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân và quy định pháp luật liên quan.</p>
      <h3>Thông tin thu thập</h3><p>Khi gửi phản ánh: họ tên, số điện thoại, email (nếu có), ấp, nội dung, vị trí và hình ảnh do người dân cung cấp. Cổng không yêu cầu số căn cước công dân khi gửi phản ánh.</p>
      <h3>Mục đích sử dụng</h3><p>Chỉ để tiếp nhận, xử lý, phản hồi phản ánh và thống kê tổng hợp. Không công khai họ tên, số điện thoại của người gửi; không cung cấp cho bên thứ ba ngoài cơ quan có thẩm quyền xử lý.</p>
      <h3>Dữ liệu an sinh</h3><p>Danh sách cá nhân hưởng chính sách an sinh không công khai trên cổng; chỉ hiển thị số liệu tổng hợp.</p>
      <h3>Quyền của người dân</h3><p>Người dân có quyền yêu cầu xem, chỉnh sửa hoặc xóa thông tin cá nhân đã cung cấp bằng cách liên hệ UBND xã.</p>
    </>
  ) },
  "dieu-khoan": { title: "Điều khoản sử dụng", body: () => (
    <>
      <p>Thông tin trên cổng mang tính chất tham khảo, phục vụ người dân tra cứu. Văn bản, quyết định có giá trị pháp lý là bản do cơ quan có thẩm quyền ban hành.</p>
      <p>Người sử dụng cam kết cung cấp thông tin trung thực khi gửi phản ánh, góp ý; không đăng tải nội dung vi phạm pháp luật, xúc phạm danh dự, nhân phẩm của tổ chức, cá nhân.</p>
      <p>Bản đồ nền © Esri; dữ liệu ranh giới © OpenStreetMap contributors (giấy phép ODbL), chỉ có giá trị tham khảo.</p>
    </>
  ) },
};

export function SupportPage({ slug }: { slug: string }) {
  const page = SUPPORT[slug];
  if (!page) return <NotFoundPage />;
  return (
    <main className="subpage">
      <PageHero crumbs={[["Hỗ trợ", "/ho-tro/huong-dan"], [page.title]]} eyebrow="HỖ TRỢ" title={page.title} />
      <div className="container page-grid">
        <section className="page-main card article">{page.body()}</section>
        <aside className="page-side"><section className="card"><h2 className="card__title">Hỗ trợ</h2><ul className="link-list">{Object.entries(SUPPORT).map(([k, v]) => <li key={k}><a className={k === slug ? "active" : ""} href={to(`/ho-tro/${k}`)}>{v.title}</a></li>)}<li><a href={to("/lien-he")}>Liên hệ hỗ trợ</a></li></ul></section></aside>
      </div>
    </main>
  );
}

type Hit = { type: string; title: string; desc: string; path: string; external?: boolean };
export function SearchPage({ q: initial }: { q: string }) {
  const [q, setQ] = useState(initial);
  const hits = useMemo<Hit[]>(() => {
    const k = fold(initial.trim());
    if (!k) return [];
    const m = (s: string) => fold(s).includes(k);
    return [
      ...PROCEDURES.filter((p) => m(p.name + p.field)).map((p) => ({ type: "Thủ tục", title: p.name, desc: `Lĩnh vực ${p.field}`, path: `/dich-vu-cong?q=${encodeURIComponent(p.name)}` })),
      ...POLICIES.filter((p) => m(p.name + p.target + p.group)).map((p) => ({ type: "Chính sách", title: p.name, desc: p.target, path: `/an-sinh/chinh-sach/${p.slug}` })),
      ...DESTINATIONS.filter((d) => m(d.name + d.summary)).map((d) => ({ type: "Điểm đến", title: d.name, desc: d.summary, path: `/du-lich/${d.slug}` })),
      ...HAMLETS.filter((h) => m(h.name)).map((h) => ({ type: "Ấp", title: h.name, desc: h.note || h.group, path: `/ap-so/${h.slug}` })),
      ...NEWS.filter((n) => m(n.title + n.summary)).map((n) => ({ type: "Tin tức", title: n.title, desc: n.summary, path: `/tin-tuc/${n.slug}` })),
      ...FAQS.filter((f) => m(f.q + f.a)).map((f) => ({ type: "Hỏi đáp", title: f.q, desc: f.a, path: "/ho-tro/cau-hoi-thuong-gap" })),
    ];
  }, [initial]);
  return (
    <main className="subpage">
      <PageHero crumbs={[["Tìm kiếm"]]} title={initial ? `Kết quả cho “${initial}”` : "Tìm kiếm"}>
        <form className="page-search" onSubmit={(e) => { e.preventDefault(); go(`/tim-kiem?q=${encodeURIComponent(q.trim())}`); }}>
          <Icon name="search" size={20} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm thủ tục, chính sách, địa điểm, tin tức..." autoFocus /><button className="btn btn--primary" type="submit">Tìm</button>
        </form>
      </PageHero>
      <div className="container">
        {initial && <p className="muted">{hits.length} kết quả</p>}
        {hits.length ? <div className="search-list">{hits.map((h, i) => <a key={i} href={to(h.path)} className="search-hit"><span className="tag">{h.type}</span><div><strong>{h.title}</strong><p>{h.desc}</p></div><Icon name="chevron" size={18} /></a>)}</div>
          : initial ? <EmptyState icon="search" title="Không tìm thấy kết quả phù hợp">Thử từ khóa ngắn hơn, hoặc hỏi <a href="#tro-ly-ai">Trợ lý AI</a>.</EmptyState> : null}
      </div>
    </main>
  );
}

export function NotFoundPage() {
  return (
    <main className="subpage">
      <PageHero crumbs={[["Không tìm thấy"]]} title="Không tìm thấy trang" desc="Đường dẫn không tồn tại hoặc đã được thay đổi." />
      <div className="container"><EmptyState icon="map" title="Trang bạn tìm không có ở đây"><a href={to("/")}>← Về trang chủ</a></EmptyState></div>
    </main>
  );
}
