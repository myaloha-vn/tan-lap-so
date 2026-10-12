import { useMemo, useState } from "react";
import { PageHero, Tabs } from "../components/Layout";
import { EmptyState, Icon, fold, to } from "../lib/core";
import { NEWS, NEWS_CATEGORIES } from "../data/content";

const date = (d: string) => d || "Đang cập nhật";

export function NewsListPage({ initialCat = "all" }: { initialCat?: string }) {
  const [cat, setCat] = useState(initialCat);
  const [q, setQ] = useState("");
  const list = useMemo(() => NEWS.filter((n) => (cat === "all" || n.category === cat) && fold(n.title + n.summary).includes(fold(q))), [cat, q]);
  return (
    <main className="subpage">
      <PageHero crumbs={[["Tin tức – Thông báo"]]} eyebrow="CẬP NHẬT MỖI NGÀY" title="Tin tức – Thông báo" desc="Thông tin chỉ đạo, điều hành, thông báo và hoạt động nổi bật của xã Tân Lập." />
      <div className="container">
        <div className="toolbar">
          <Tabs value={cat} onChange={setCat} items={[["all", "Tất cả", NEWS.length], ...NEWS_CATEGORIES.map((c) => [c, c, NEWS.filter((n) => n.category === c).length] as [string, string, number])]} />
          <form className="inline-search" onSubmit={(e) => e.preventDefault()}><Icon name="search" size={18} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm tin tức..." aria-label="Tìm tin tức" /></form>
        </div>
        {list.length ? (
          <div className="news-grid">
            {list.map((n) => (
              <a key={n.slug} className="news-card" href={to(`/tin-tuc/${n.slug}`)}>
                <div className="news-card__img"><img src={n.image} alt="" /><span>{n.category}</span>{n.sample && <i className="sample">Tin mẫu</i>}</div>
                <div><small><Icon name="calendar" size={14} /> {date(n.date)}</small><h3>{n.title}</h3><p>{n.summary}</p></div>
              </a>
            ))}
          </div>
        ) : <EmptyState icon="file" title="Chưa có tin trong mục này">Tin tức, thông báo mới sẽ được UBND xã đăng tải thường xuyên.</EmptyState>}
      </div>
    </main>
  );
}

export function NewsDetailPage({ slug }: { slug: string }) {
  const n = NEWS.find((x) => x.slug === slug);
  if (!n) return <main className="subpage"><PageHero crumbs={[["Tin tức", "/tin-tuc"], ["Không tìm thấy"]]} title="Không tìm thấy bài viết" /><div className="container"><EmptyState title="Bài viết không tồn tại hoặc đã bị gỡ"><a href={to("/tin-tuc")}>← Về Tin tức</a></EmptyState></div></main>;
  const related = NEWS.filter((x) => x.slug !== n.slug).slice(0, 4);
  const share = () => {
    const url = window.location.href;
    if (navigator.share) navigator.share({ title: n.title, url }).catch(() => {});
    else navigator.clipboard?.writeText(url);
  };
  return (
    <main className="subpage">
      <PageHero crumbs={[["Tin tức", "/tin-tuc"], [n.category]]} eyebrow={n.category.toUpperCase()} title={n.title}>
        <div className="meta-row"><span><Icon name="calendar" size={15} /> {date(n.date)}</span><button className="link-btn" onClick={share}><Icon name="external" size={15} /> Chia sẻ</button><button className="link-btn" onClick={() => window.print()}><Icon name="file" size={15} /> In bài</button></div>
      </PageHero>
      <div className="container page-grid">
        <article className="page-main">
          {n.sample && <div className="demo-notice"><Icon name="info" size={18} /><span>Đây là bài viết mẫu minh họa bố cục. Nội dung chính thức sẽ do UBND xã cập nhật.</span></div>}
          <div className="detail-cover"><img src={n.image} alt="" /></div>
          <section className="card article"><p className="lead">{n.summary}</p>{n.body.map((p, i) => <p key={i}>{p}</p>)}{n.source && <p className="news-source"><Icon name="external" size={15} /> Nguồn: <a href={n.source.url} target="_blank" rel="noopener noreferrer">{n.source.name}</a></p>}</section>
        </article>
        <aside className="page-side">
          <section className="card"><h2 className="card__title">Tin liên quan</h2>
            <ul className="related">{related.map((r) => <li key={r.slug}><a href={to(`/tin-tuc/${r.slug}`)}><img src={r.image} alt="" /><div><strong>{r.title}</strong><small>{date(r.date)}</small></div></a></li>)}</ul>
          </section>
          <a className="back-link" href={to("/tin-tuc")}><Icon name="back" size={17} /> Tất cả tin tức</a>
        </aside>
      </div>
    </main>
  );
}
