import { useMemo, useState } from "react";
import { PageHero, Tabs } from "../components/Layout";
import { EmptyState, Icon, SITE, fold, orPending, to } from "../lib/core";
import { DVC_LINKS, DVC_STEPS, OVERVIEW, PROCEDURES } from "../data/content";

export function ServicesPage({ initialQ = "" }: { initialQ?: string }) {
  const fields = Array.from(new Set(PROCEDURES.map((p) => p.field)));
  const [field, setField] = useState("all");
  const [q, setQ] = useState(initialQ);
  const list = useMemo(() => PROCEDURES.filter((p) => (field === "all" || p.field === field) && fold(p.name).includes(fold(q))), [field, q]);
  return (
    <main className="subpage">
      <PageHero crumbs={[["Dịch vụ công"]]} eyebrow="HÀNH CHÍNH CÔNG" title="Dịch vụ công trực tuyến" desc="Nộp hồ sơ, tra cứu thủ tục và theo dõi kết quả giải quyết hồ sơ qua Cổng Dịch vụ công quốc gia." />
      <div className="container">
        <div className="kpi-row kpi-row--dvc">
          <div className="kpi"><strong>{OVERVIEW.digital.procedures}</strong><small>Thủ tục trực tuyến</small></div>
          <div className="kpi"><strong>{OVERVIEW.digital.dossiers}</strong><small>Hồ sơ đã tiếp nhận</small></div>
          <div className="kpi"><strong>{OVERVIEW.digital.onlineRate}</strong><small>Nộp trực tuyến</small></div>
          <div className="kpi"><strong>{OVERVIEW.digital.satisfaction}</strong><small>Mức độ hài lòng</small></div>
        </div>
        <p className="muted small kpi-note">Số liệu theo báo cáo của UBND xã, tháng {OVERVIEW.digital.asOf}.</p>
        <div className="dvc-grid">
          {DVC_LINKS.map((l) => <a key={l.url} className="dvc-card" href={l.url} target="_blank" rel="noopener noreferrer"><span><Icon name={l.icon} size={26} /></span><div><strong>{l.title}</strong><small>{l.desc}</small></div><Icon name="external" size={18} /></a>)}
        </div>
        <section className="block">
          <h2 className="block__title">Các bước nộp hồ sơ trực tuyến</h2>
          <ol className="steps">{DVC_STEPS.map((s, i) => <li key={s.title}><span>{i + 1}</span><div><strong>{s.title}</strong><p>{s.desc}</p></div></li>)}</ol>
        </section>
        <section className="block">
          <h2 className="block__title">Thủ tục thường dùng tại xã</h2>
          <div className="toolbar">
            <Tabs value={field} onChange={setField} items={[["all", "Tất cả", PROCEDURES.length], ...fields.map((f) => [f, f, PROCEDURES.filter((p) => p.field === f).length] as [string, string, number])]} />
            <form className="inline-search" onSubmit={(e) => e.preventDefault()}><Icon name="search" size={18} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm thủ tục..." aria-label="Tìm thủ tục" /></form>
          </div>
          {list.length ? (
            <div className="table-card">
              <table className="table">
                <thead><tr><th>Tên thủ tục</th><th>Lĩnh vực</th><th>Trực tuyến</th><th></th></tr></thead>
                <tbody>{list.map((p) => (
                  <tr key={p.name}>
                    <td><strong>{p.name}</strong>{p.note && <small>{p.note}</small>}</td>
                    <td><span className="tag">{p.field}</span></td>
                    <td>{p.online ? <span className="tag tag--ok">Có</span> : <span className="tag tag--muted">Nộp trực tiếp</span>}</td>
                    <td><a className="link" href={`https://dichvucong.gov.vn/tra-cuu-thu-tuc/danh-sach`} target="_blank" rel="noopener noreferrer">Tra cứu <Icon name="external" size={14} /></a></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          ) : <EmptyState icon="search" title="Không tìm thấy thủ tục">Thử từ khóa khác hoặc tra cứu đầy đủ trên Cổng Dịch vụ công quốc gia.</EmptyState>}
        </section>
        <section className="card office-card">
          <div><h2 className="card__title">Trung tâm Phục vụ hành chính công xã Tân Lập</h2>
            <p><Icon name="pin" size={17} /> {SITE.address}</p><p><Icon name="clock" size={17} /> {SITE.hours}</p><p><Icon name="phone" size={17} /> {orPending(SITE.phone)}</p></div>
          <a className="btn btn--primary" href={to("/phan-anh?linhvuc=" + encodeURIComponent("Thủ tục hành chính"))}><Icon name="chat" size={18} /> Hỏi đáp thủ tục</a>
        </section>
      </div>
    </main>
  );
}
