import { useState } from "react";
import { PageHero } from "../components/Layout";
import { EmptyState, Icon, to } from "../lib/core";
import { BoundaryMap } from "../lib/maps";
import { DESTINATIONS, DEST_CATEGORIES, ITINERARIES } from "../data/content";

const mapsUrl = (q: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

export function TourismPage() {
  const [cat, setCat] = useState("all");
  const list = DESTINATIONS.filter((d) => cat === "all" || d.category === cat);
  return (
    <main className="subpage">
      <PageHero crumbs={[["Du lịch"]]} eyebrow="KHÁM PHÁ TÂN LẬP" title="Văn hóa – Du lịch Tân Lập" desc="Những điểm đến, câu chuyện lịch sử và trải nghiệm đang chờ bạn khám phá.">
        <div className="hero-kpis"><div><strong>{DESTINATIONS.length}</strong><small>Điểm đến</small></div><div><strong>{ITINERARIES.length}</strong><small>Gợi ý hành trình</small></div><div><strong>1</strong><small>Bản đồ khám phá</small></div></div>
      </PageHero>
      <div className="container">
        <section className="block">
          <h2 className="block__title">Khám phá theo cảm hứng</h2>
          <div className="chip-row">
            <button className={cat === "all" ? "chip active" : "chip"} onClick={() => setCat("all")}>✦ Tất cả <i>{DESTINATIONS.length}</i></button>
            {DEST_CATEGORIES.map((c) => <button key={c} className={cat === c ? "chip active" : "chip"} onClick={() => setCat(c)}>{c} <i>{DESTINATIONS.filter((d) => d.category === c).length}</i></button>)}
          </div>
        </section>
        <section className="block">
          <h2 className="block__title">Điểm đến nổi bật</h2>
          {list.length ? (
            <div className="dest-grid">
              {list.map((d) => (
                <article className="dest-card" key={d.slug}>
                  <a href={to(`/du-lich/${d.slug}`)} className="dest-card__img"><img src={d.image} alt="" /><span>{d.category}</span></a>
                  <div className="dest-card__body"><h3>{d.name}</h3><p><Icon name="pin" size={15} /> {d.address}</p><p>{d.summary}</p>
                    <div className="btn-row"><a className="btn btn--primary" href={to(`/du-lich/${d.slug}`)}>Khám phá</a><a className="btn btn--ghost" href={mapsUrl(d.mapQuery)} target="_blank" rel="noopener noreferrer"><Icon name="route" size={16} /> Chỉ đường</a></div>
                  </div>
                </article>
              ))}
            </div>
          ) : <EmptyState icon="camera" title="Chưa có điểm đến trong nhóm này">Điểm đến mới sẽ được UBND xã cập nhật.</EmptyState>}
        </section>
        <section className="block">
          <h2 className="block__title">Bản đồ khám phá</h2>
          <div className="card"><div className="big-map"><BoundaryMap /></div><p className="muted small">Vị trí chi tiết các điểm đến: bấm “Chỉ đường” trên từng điểm để mở Google Maps.</p></div>
        </section>
        <section className="block">
          <h2 className="block__title">Gợi ý hành trình</h2>
          <div className="itin-grid">
            {ITINERARIES.map((it) => (
              <article className="card itin" key={it.name}>
                <h3>{it.name}</h3><p>{it.desc}</p>
                <div className="mini-stats"><div><strong>{it.duration}</strong><small>Thời lượng</small></div><div><strong>{it.stops.length} điểm</strong><small>Điểm đến</small></div></div>
                <ol className="stop-list">{it.stops.map((s) => { const d = DESTINATIONS.find((x) => x.slug === s); return d ? <li key={s}><a href={to(`/du-lich/${s}`)}>{d.name}</a></li> : null; })}</ol>
              </article>
            ))}
          </div>
        </section>
        <div className="demo-notice"><Icon name="info" size={18} /><span>Danh mục điểm đến đang được bổ sung (di tích, sinh thái, ẩm thực, làng nghề...). Cán bộ cập nhật tại <code>src/data/content.ts</code> (mục DESTINATIONS).</span></div>
      </div>
    </main>
  );
}

export function DestinationPage({ slug }: { slug: string }) {
  const d = DESTINATIONS.find((x) => x.slug === slug);
  if (!d) return <main className="subpage"><PageHero crumbs={[["Du lịch", "/du-lich"], ["Không tìm thấy"]]} title="Không tìm thấy điểm đến" /><div className="container"><EmptyState title="Điểm đến không tồn tại"><a href={to("/du-lich")}>← Về trang Du lịch</a></EmptyState></div></main>;
  return (
    <main className="subpage">
      <PageHero crumbs={[["Du lịch", "/du-lich"], [d.name]]} eyebrow={d.category.toUpperCase()} title={d.name} desc={d.summary} />
      <div className="container page-grid">
        <div className="page-main">
          <div className="detail-cover"><img src={d.image} alt="" /></div>
          <section className="card article">{d.body.map((p, i) => <p key={i}>{p}</p>)}</section>
          {d.highlights && <section className="card"><h2 className="card__title">Điểm nhấn</h2><ul className="check-list">{d.highlights.map((h) => <li key={h}><Icon name="check" size={17} /> {h}</li>)}</ul></section>}
        </div>
        <aside className="page-side">
          <section className="card">
            <h2 className="card__title">Thông tin tham quan</h2>
            <ul className="contact-list">
              <li><Icon name="pin" size={19} /><div><small>Địa chỉ</small><strong>{d.address}</strong></div></li>
              <li><Icon name="clock" size={19} /><div><small>Giờ mở cửa</small><strong className="pending">Đang cập nhật</strong></div></li>
              <li><Icon name="file" size={19} /><div><small>Giá vé</small><strong className="pending">Đang cập nhật</strong></div></li>
            </ul>
            <a className="btn btn--primary btn--block" href={mapsUrl(d.mapQuery)} target="_blank" rel="noopener noreferrer"><Icon name="route" size={18} /> Chỉ đường</a>
          </section>
          <a className="back-link" href={to("/du-lich")}><Icon name="back" size={17} /> Tất cả điểm đến</a>
        </aside>
      </div>
    </main>
  );
}
