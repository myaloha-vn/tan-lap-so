import { useMemo, useState } from "react";
import { PageHero, Tabs } from "../components/Layout";
import { EmptyState, Icon, fold, orPending, to } from "../lib/core";
import { BoundaryMap } from "../lib/maps";
import { HAMLETS, HAMLET_GROUPS, OVERVIEW } from "../data/content";

export function HamletsPage() {
  const [q, setQ] = useState("");
  const [group, setGroup] = useState("all");
  const [view, setView] = useState<"list" | "map">("list");
  const list = useMemo(() => HAMLETS.filter((h) => (group === "all" || h.group === group) && fold(h.name).includes(fold(q))), [q, group]);
  return (
    <main className="subpage">
      <PageHero crumbs={[["Ấp số"]]} eyebrow="ẤP SỐ TÂN LẬP" title="Không gian số các ấp" desc="Thông tin dân cư, ranh giới, ban điều hành và hoạt động cộng đồng của từng ấp trên địa bàn xã Tân Lập.">
        <form className="page-search" onSubmit={(e) => e.preventDefault()}>
          <Icon name="search" size={20} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm ấp..." aria-label="Tìm ấp" />
        </form>
      </PageHero>
      <div className="container">
        <div className="kpi-row">
          <div className="kpi"><strong>{orPending(OVERVIEW.hamlets) === "Đang cập nhật" ? HAMLETS.length + "+" : OVERVIEW.hamlets}</strong><small>Ấp</small></div>
          <div className="kpi"><strong>{OVERVIEW.population}</strong><small>Nhân khẩu ({OVERVIEW.populationYear})</small></div>
          <div className="kpi"><strong className={OVERVIEW.households ? "" : "pending"}>{orPending(OVERVIEW.households)}</strong><small>Hộ dân</small></div>
          <div className="kpi"><strong>{OVERVIEW.area} km²</strong><small>Diện tích</small></div>
        </div>
        <div className="toolbar">
          {HAMLET_GROUPS.length > 0 ? <Tabs value={group} onChange={setGroup} items={[["all", "Tất cả", HAMLETS.length], ...HAMLET_GROUPS.map((g) => [g, g, HAMLETS.filter((h) => h.group === g).length] as [string, string, number])]} /> : <span />}
          <div className="view-toggle">
            <button className={view === "list" ? "active" : ""} onClick={() => setView("list")}><Icon name="grid" size={17} /> Danh sách</button>
            <button className={view === "map" ? "active" : ""} onClick={() => setView("map")}><Icon name="map" size={17} /> Bản đồ</button>
          </div>
        </div>
        <div className="demo-notice"><Icon name="info" size={18} /><span>Xã Tân Lập có 9 ấp, hình thành từ xã Tân Lập cũ (5 ấp) và xã Thạnh Bắc cũ (4 ấp). Dân số, diện tích, ranh giới và thông tin trưởng ấp của từng ấp đang được UBND xã cập nhật.</span></div>
        {view === "map" ? (
          <div className="card"><div className="big-map"><BoundaryMap /></div><p className="muted small">Ranh giới từng ấp sẽ hiển thị khi có dữ liệu bản đồ của xã.</p></div>
        ) : list.length ? (
          <div className="hamlet-grid">
            {list.map((h) => (
              <article className="hamlet-card" key={h.slug}>
                <div className="hamlet-card__head"><span>{h.name.replace(/^Ấp /, "").slice(0, 1)}</span><div><h3>{h.name}</h3><small>{h.group}</small></div></div>
                <div className="mini-stats">
                  <div><strong className={h.population ? "" : "pending"}>{orPending(h.population)}</strong><small>Dân số</small></div>
                  <div><strong className={h.households ? "" : "pending"}>{orPending(h.households)}</strong><small>Hộ dân</small></div>
                  <div><strong className={h.area ? "" : "pending"}>{h.area ? h.area + " km²" : "Đang cập nhật"}</strong><small>Diện tích</small></div>
                </div>
                {h.note && <p><Icon name="pin" size={15} /> {h.note}</p>}
                <a className="btn btn--ghost btn--block" href={to(`/ap-so/${h.slug}`)}>Xem chi tiết <Icon name="arrow" size={16} /></a>
              </article>
            ))}
          </div>
        ) : <EmptyState icon="search" title="Không tìm thấy ấp phù hợp">Thử từ khóa khác hoặc chọn "Tất cả".</EmptyState>}
      </div>
    </main>
  );
}

export function HamletDetailPage({ slug }: { slug: string }) {
  const h = HAMLETS.find((x) => x.slug === slug);
  if (!h) return <main className="subpage"><PageHero crumbs={[["Ấp số", "/ap-so"], ["Không tìm thấy"]]} title="Không tìm thấy ấp" /><div className="container"><EmptyState title="Ấp không tồn tại hoặc đã đổi tên"><a href={to("/ap-so")}>← Về danh sách ấp</a></EmptyState></div></main>;
  const b = h.borders || {};
  return (
    <main className="subpage">
      <PageHero crumbs={[["Ấp số", "/ap-so"], [h.name]]} eyebrow={h.group.toUpperCase()} title={h.name} desc={h.note} />
      <div className="container page-grid">
        <div className="page-main">
          <section className="card">
            <h2 className="card__title">Giới thiệu chung</h2>
            {h.intro?.length ? h.intro.map((t, i) => <p key={i}>{t}</p>) : <p>{h.name} thuộc xã Tân Lập, tỉnh Tây Ninh.{h.population ? ` Quy mô ${h.population} nhân khẩu trên ${orPending(h.households)} hộ dân.` : " Số liệu dân cư đang được cập nhật."}</p>}
            <div className="fact-grid">
              <div className="fact"><span><Icon name="users" size={20} /></span><div><small>Dân số</small><strong className={h.population ? "" : "pending"}>{orPending(h.population)}</strong></div></div>
              <div className="fact"><span><Icon name="home" size={20} /></span><div><small>Số hộ dân</small><strong className={h.households ? "" : "pending"}>{orPending(h.households)}</strong></div></div>
              <div className="fact"><span><Icon name="area" size={20} /></span><div><small>Diện tích</small><strong className={h.area ? "" : "pending"}>{h.area ? h.area + " km²" : "Đang cập nhật"}</strong></div></div>
            </div>
          </section>
          {!!h.places?.length && (
            <section className="card">
              <h2 className="card__title">Cơ quan, địa điểm trên địa bàn</h2>
              <ul className="notice-list">{h.places.map((x) => <li key={x.name}><Icon name="pin" size={17} /><div><strong>{x.name}</strong><small>{x.desc}</small></div></li>)}</ul>
            </section>
          )}
          <section className="card">
            <h2 className="card__title">Ranh giới hành chính (tứ cận)</h2>
            <div className="compass">
              {([["BẮC", b.bac], ["NAM", b.nam], ["ĐÔNG", b.dong], ["TÂY", b.tay]] as [string, string | undefined][]).map(([d, v]) => <div key={d}><small>{d}</small><strong className={v ? "" : "pending"}>{v ? "Giáp " + v : "Đang cập nhật"}</strong></div>)}
            </div>
          </section>
          <section className="card">
            <h2 className="card__title">Thông báo của ấp</h2>
            {h.notices?.length ? <ul className="notice-list">{h.notices.map((n) => <li key={n.title}><Icon name="megaphone" size={17} /><div><strong>{n.title}</strong><small>{n.date}</small></div></li>)}</ul>
              : <EmptyState icon="megaphone" title="Chưa có thông báo">Thông báo họp dân, vệ sinh môi trường, lịch cắt điện nước... sẽ hiển thị tại đây.</EmptyState>}
          </section>
          <section className="card">
            <h2 className="card__title">Hoạt động cộng đồng</h2>
            {h.activities?.length ? <ul className="notice-list">{h.activities.map((n) => <li key={n.title}><Icon name="calendar" size={17} /><div><strong>{n.slug ? <a href={to(`/tin-tuc/${n.slug}`)}>{n.title}</a> : n.title}</strong><small>{n.date} · {n.tag}</small></div></li>)}</ul>
              : <EmptyState icon="users" title="Chưa có hoạt động">Hình ảnh, tin tức hoạt động của ấp sẽ được cập nhật.</EmptyState>}
          </section>
        </div>
        <aside className="page-side">
          <section className="card">
            <h2 className="card__title">Ban điều hành ấp</h2>
            <div className="person-card person-card--flat">
              <span className="person-card__avatar">{h.head?.name ? h.head.name.split(" ").pop()![0] : "T"}</span>
              <div><strong className={h.head?.name ? "" : "pending"}>{h.head?.name || "Đang cập nhật"}</strong><small>{h.head?.title || "Trưởng ấp"}</small>{h.head?.phone && <a href={`tel:${h.head.phone}`}><Icon name="phone" size={14} /> {h.head.phone}</a>}</div>
            </div>
          </section>
          <section className="card">
            <h2 className="card__title">Gửi phản ánh tại ấp</h2>
            <p className="muted small">Phát hiện sự cố về đường sá, điện, nước, môi trường, an ninh tại {h.name}?</p>
            <a className="btn btn--primary btn--block" href={to(`/phan-anh?ap=${encodeURIComponent(h.name)}`)}><Icon name="megaphone" size={18} /> Gửi phản ánh</a>
          </section>
          {!!h.sources?.length && (
            <section className="card">
              <h2 className="card__title">Nguồn thông tin</h2>
              <ul className="link-list">{h.sources.map((x) => <li key={x.url}><a href={x.url} target="_blank" rel="noopener noreferrer">{x.name}</a></li>)}</ul>
            </section>
          )}
          <a className="back-link" href={to("/ap-so")}><Icon name="back" size={17} /> Danh sách ấp</a>
        </aside>
      </div>
    </main>
  );
}
