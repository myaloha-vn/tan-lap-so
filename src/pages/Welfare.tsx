import { useMemo, useState } from "react";
import { PageHero, Tabs } from "../components/Layout";
import { EmptyState, Icon, SITE, fold, orPending, to } from "../lib/core";
import { POLICIES, POLICY_GROUPS, PROGRAMS, WELFARE_HOTLINE } from "../data/content";

export function WelfarePage({ initialQ = "" }: { initialQ?: string }) {
  const [q, setQ] = useState(initialQ);
  const [group, setGroup] = useState("all");
  const list = useMemo(() => POLICIES.filter((p) => (group === "all" || p.group === group) && (fold(p.name + p.target).includes(fold(q)))), [q, group]);
  return (
    <main className="subpage">
      <PageHero crumbs={[["An sinh xã hội"]]} eyebrow="AN SINH TÂN LẬP" title="An sinh xã hội" desc="Tra cứu chính sách an sinh, tìm quyền lợi phù hợp, hồ sơ cần chuẩn bị và nơi tiếp nhận tại xã Tân Lập.">
        <form className="page-search" onSubmit={(e) => e.preventDefault()}>
          <Icon name="search" size={20} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm chính sách: người có công, trợ cấp, BHYT, học phí..." aria-label="Tìm chính sách" />
        </form>
      </PageHero>
      <div className="container">
        <div className="quick-cards">
          <a className="quick-card" href={to("/an-sinh")} onClick={(e) => { e.preventDefault(); document.getElementById("chinh-sach")?.scrollIntoView({ behavior: "smooth" }); }}><Icon name="search" size={22} /><div><strong>Tra cứu chính sách</strong><small>{POLICIES.length} chính sách theo {POLICY_GROUPS.length} nhóm</small></div></a>
          <a className="quick-card" href={to("/an-sinh/tong-quan")}><Icon name="chart" size={22} /><div><strong>Tổng quan an sinh</strong><small>Số liệu tổng hợp (dành cho cán bộ)</small></div></a>
          <a className="quick-card" href={WELFARE_HOTLINE ? `tel:${WELFARE_HOTLINE}` : to("/lien-he")}><Icon name="phone" size={22} /><div><strong>Đường dây hỗ trợ</strong><small>{orPending(WELFARE_HOTLINE || SITE.phone)}</small></div></a>
        </div>
        <section className="block" id="chinh-sach">
          <h2 className="block__title">Chính sách an sinh</h2>
          <Tabs value={group} onChange={setGroup} items={[["all", "Tất cả", POLICIES.length], ...POLICY_GROUPS.map((g) => [g, g, POLICIES.filter((p) => p.group === g).length] as [string, string, number])]} />
          {list.length ? (
            <div className="policy-grid">
              {list.map((p) => (
                <article className="policy-card" key={p.slug}>
                  <div className="policy-card__tags"><span className="tag">{p.group}</span><span className="tag tag--ok">{p.status}</span></div>
                  <h3>{p.name}</h3>
                  <p><b>Đối tượng:</b> {p.target}</p>
                  <p><b>Quyền lợi:</b> {p.benefit}</p>
                  <a className="btn btn--ghost" href={to(`/an-sinh/chinh-sach/${p.slug}`)}>Xem chi tiết <Icon name="arrow" size={16} /></a>
                </article>
              ))}
            </div>
          ) : <EmptyState icon="search" title="Không tìm thấy chính sách phù hợp">Thử từ khóa khác, hoặc liên hệ Trung tâm Phục vụ hành chính công xã để được tư vấn.</EmptyState>}
        </section>
        <section className="block">
          <h2 className="block__title">Chương trình an sinh đang diễn ra</h2>
          {PROGRAMS.length ? <div className="policy-grid">{PROGRAMS.map((p) => <article className="policy-card" key={p.name}><h3>{p.name}</h3><p>{p.desc}</p><p><b>Thời gian:</b> {p.start} – {p.end}</p><p><b>Cách tham gia:</b> {p.how}</p></article>)}</div>
            : <EmptyState icon="calendar" title="Chưa có chương trình đang diễn ra">Các đợt khám bệnh miễn phí, trao quà, hỗ trợ đột xuất... sẽ được thông báo tại đây và tại mục Tin tức.</EmptyState>}
        </section>
        <div className="demo-notice"><Icon name="info" size={18} /><span>Thông tin chính sách mang tính hướng dẫn chung. Mức hưởng cụ thể thực hiện theo quy định hiện hành tại thời điểm giải quyết hồ sơ.</span></div>
      </div>
    </main>
  );
}

export function PolicyPage({ slug }: { slug: string }) {
  const p = POLICIES.find((x) => x.slug === slug);
  if (!p) return <main className="subpage"><PageHero crumbs={[["An sinh xã hội", "/an-sinh"], ["Không tìm thấy"]]} title="Không tìm thấy chính sách" /><div className="container"><EmptyState title="Chính sách không tồn tại"><a href={to("/an-sinh")}>← Về An sinh xã hội</a></EmptyState></div></main>;
  const related = POLICIES.filter((x) => x.group === p.group && x.slug !== p.slug).slice(0, 3);
  return (
    <main className="subpage">
      <PageHero crumbs={[["An sinh xã hội", "/an-sinh"], [p.group]]} eyebrow={p.group.toUpperCase()} title={p.name} />
      <div className="container page-grid">
        <div className="page-main">
          <section className="card article">
            <h3>Đối tượng áp dụng</h3><p>{p.target}</p>
            <h3>Quyền lợi</h3><p>{p.benefit}</p>
            <h3>Hồ sơ cần chuẩn bị</h3><ul className="check-list">{p.documents.map((d) => <li key={d}><Icon name="check" size={17} /> {d}</li>)}</ul>
            <h3>Nơi tiếp nhận</h3><p>{p.where}</p>
            <h3>Căn cứ pháp lý</h3><p>{p.basis}</p>
          </section>
        </div>
        <aside className="page-side">
          <section className="card">
            <h2 className="card__title">Bạn cần hỗ trợ?</h2>
            <p className="muted small">Mang theo giấy tờ đến Trung tâm Phục vụ hành chính công xã, hoặc nộp hồ sơ trực tuyến.</p>
            <a className="btn btn--primary btn--block" href={to("/dich-vu-cong")}><Icon name="file" size={18} /> Nộp hồ sơ trực tuyến</a>
            <a className="btn btn--ghost btn--block" href={to(`/phan-anh?linhvuc=${encodeURIComponent("Thủ tục hành chính")}`)}><Icon name="chat" size={18} /> Gửi câu hỏi</a>
          </section>
          {related.length > 0 && <section className="card"><h2 className="card__title">Chính sách cùng nhóm</h2><ul className="link-list">{related.map((r) => <li key={r.slug}><a href={to(`/an-sinh/chinh-sach/${r.slug}`)}>{r.name}</a></li>)}</ul></section>}
          <a className="back-link" href={to("/an-sinh")}><Icon name="back" size={17} /> Tất cả chính sách</a>
        </aside>
      </div>
    </main>
  );
}

/* Tổng quan an sinh — chỉ hiển thị SỐ LIỆU TỔNG HỢP, không công khai danh sách cá nhân. */
export function WelfareOverviewPage() {
  const blocks = ["Hộ nghèo", "Hộ cận nghèo", "Người cao tuổi hưởng trợ cấp", "Người khuyết tật", "Trẻ em có hoàn cảnh đặc biệt", "Gia đình người có công", "Hồ sơ đang xử lý", "Hồ sơ đã hoàn thành"];
  return (
    <main className="subpage">
      <PageHero crumbs={[["An sinh xã hội", "/an-sinh"], ["Tổng quan"]]} eyebrow="DÀNH CHO CÁN BỘ" title="Tổng quan an sinh" desc="Số liệu tổng hợp về đối tượng và hồ sơ an sinh trên địa bàn xã." />
      <div className="container">
        <div className="demo-notice"><Icon name="shield" size={18} /><span>Trang này chỉ hiển thị số liệu tổng hợp. Danh sách cá nhân (họ tên, địa chỉ người hưởng chính sách) là dữ liệu cá nhân nhạy cảm, chỉ cán bộ có thẩm quyền xem sau khi đăng nhập hệ thống quản trị — không công khai trên cổng thông tin.</span></div>
        <div className="kpi-grid">
          {blocks.map((b) => <div className="kpi" key={b}><strong className="pending">—</strong><small>{b}</small></div>)}
        </div>
        <EmptyState icon="chart" title="Chưa kết nối dữ liệu an sinh">Khi kết nối cơ sở dữ liệu an sinh của xã, các biểu đồ phân bố theo ấp, cơ cấu nhóm đối tượng, trạng thái hồ sơ và xu hướng theo tháng sẽ hiển thị tại đây.</EmptyState>
      </div>
    </main>
  );
}
