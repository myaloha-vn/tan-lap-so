import { useState } from "react";
import { PageHero, Tabs } from "../components/Layout";
import { Icon, SITE, orPending, to, type IconName } from "../lib/core";
import { BoundaryMap } from "../lib/maps";
import { INTRO_ARTICLE, ORG, OVERVIEW, ORG_SOURCE } from "../data/content";

export function AboutPage() {
  const facts: [IconName, string, string][] = [
    ["users", `Dân số (${OVERVIEW.populationYear})`, `${OVERVIEW.population} người`],
    ["area", "Diện tích tự nhiên", `${OVERVIEW.area} km²`],
    ["layers", "Mật độ dân số", `${OVERVIEW.density} người/km²`],
    ["home", "Số ấp", orPending(OVERVIEW.hamlets)],
    ["shield", "Mã đơn vị hành chính", OVERVIEW.unitCode],
    ["mail", "Mã bưu chính", OVERVIEW.postalCode],
  ];
  const fields: [IconName, string, string, string][] = [
    ["home", "Ấp số", "Thông tin từng ấp, ban điều hành, thông báo tại địa bàn.", "/ap-so"],
    ["map", "Quy hoạch", "Bản đồ ranh giới xã, kiểm tra vị trí, liên kết tra cứu quy hoạch.", "/quy-hoach"],
    ["camera", "Văn hóa – Du lịch", "Điểm đến, di tích, gợi ý hành trình khám phá Tân Lập.", "/du-lich"],
    ["heart", "An sinh xã hội", "Chính sách hỗ trợ, điều kiện, hồ sơ và nơi tiếp nhận.", "/an-sinh"],
  ];
  return (
    <main className="subpage">
      <PageHero crumbs={[["Giới thiệu"]]} eyebrow="CỔNG THÔNG TIN ĐIỆN TỬ" title="Giới thiệu xã Tân Lập" desc="Tân Lập Số công khai thông tin, kết nối chính quyền với người dân và thúc đẩy chuyển đổi số tại địa phương." />
      <div className="container page-grid">
        <div className="page-main">
          <section className="card">
            <h2 className="card__title">Thông tin chung</h2>
            <div className="fact-grid">
              {facts.map(([icon, label, value]) => <div className="fact" key={label}><span><Icon name={icon} size={20} /></span><div><small>{label}</small><strong className={value === "Đang cập nhật" ? "pending" : ""}>{value}</strong></div></div>)}
            </div>
            <div className="callout">
              <Icon name="flag" size={20} />
              <div><strong>Căn cứ thành lập:</strong> {OVERVIEW.legalBasis}. Sắp xếp toàn bộ diện tích tự nhiên, quy mô dân số của {OVERVIEW.formedFrom.join(" và ")} thành xã Tân Lập; chính quyền xã mới hoạt động từ ngày {OVERVIEW.effectiveDate}.</div>
            </div>
          </section>
          <section className="card article">
            <h2 className="card__title">Bài viết giới thiệu</h2>
            {INTRO_ARTICLE.map((s) => <div key={s.heading}><h3>{s.heading}</h3>{s.body.map((p, i) => <p key={i}>{p}</p>)}</div>)}
            <p className="source-note">Nguồn số liệu: {OVERVIEW.source}.</p>
          </section>
          <section className="card">
            <h2 className="card__title">Các lĩnh vực</h2>
            <div className="field-grid">
              {fields.map(([icon, title, desc, path]) => <a className="field-card" href={to(path)} key={title}><span><Icon name={icon} size={24} /></span><strong>{title}</strong><p>{desc}</p><em>Xem ngay <Icon name="arrow" size={16} /></em></a>)}
            </div>
          </section>
        </div>
        <aside className="page-side">
          <section className="card">
            <h2 className="card__title">Thông tin liên hệ</h2>
            <ul className="contact-list">
              <li><Icon name="building" size={19} /><div><small>Cơ quan</small><strong>{SITE.ubnd}</strong></div></li>
              <li><Icon name="pin" size={19} /><div><small>Địa chỉ</small><strong>{SITE.address}</strong></div></li>
              <li><Icon name="phone" size={19} /><div><small>Điện thoại</small><strong>{orPending(SITE.phone)}</strong></div></li>
              <li><Icon name="mail" size={19} /><div><small>Email</small><strong>{orPending(SITE.email)}</strong></div></li>
              <li><Icon name="clock" size={19} /><div><small>Thời gian làm việc</small><strong>{SITE.hours}</strong></div></li>
            </ul>
            <a className="btn btn--ghost btn--block" href={to("/bo-may-to-chuc")}><Icon name="users" size={18} /> Xem bộ máy tổ chức</a>
          </section>
          <section className="card">
            <h2 className="card__title">Địa giới hành chính</h2>
            <div className="side-map"><BoundaryMap /></div>
            <p className="muted small">Giáp: {OVERVIEW.neighbors.join(", ")}.</p>
          </section>
        </aside>
      </div>
    </main>
  );
}

export function OrgPage() {
  const keys = Object.keys(ORG) as (keyof typeof ORG)[];
  const [tab, setTab] = useState<string>(keys[0]);
  const block = ORG[tab];
  const initial = (name: string, title: string) => (name ? name.trim().split(" ").pop()![0] : title.replace(/^(Phó |Trưởng |Chủ |Chánh |Bí |Giám )/, "")[0]).toUpperCase();
  const missing = Object.values(ORG).every((b) => b.groups.every((g) => g.people.every((p) => !p.name)));
  return (
    <main className="subpage">
      <PageHero crumbs={[["Giới thiệu", "/gioi-thieu"], ["Bộ máy tổ chức"]]} eyebrow="HỆ THỐNG CHÍNH TRỊ" title="Bộ máy tổ chức" desc="Cơ cấu tổ chức các khối Đảng, HĐND, UBND, Mặt trận Tổ quốc và đoàn thể xã Tân Lập." />
      <div className="container">
        <Tabs value={tab} onChange={setTab} items={keys.map((k) => [k, ORG[k].label] as [string, string])} />
        <p className="tab-desc">{block.desc}</p>
        {!missing && <div className="demo-notice"><Icon name="info" size={18} /><span>{ORG_SOURCE}</span></div>}
        {missing && <div className="demo-notice"><Icon name="info" size={18} /><span>Danh sách lãnh đạo đang được UBND xã cập nhật. Cán bộ quản trị điền họ tên tại file <code>src/data/content.ts</code> (mục ORG).</span></div>}
        {block.groups.map((g) => (
          <section className="org-group" key={g.group}>
            <h2>{g.group}</h2>
            <div className="person-grid">
              {g.people.map((p, i) => (
                <article className="person-card" key={i}>
                  <span className="person-card__avatar">{initial(p.name, p.title)}</span>
                  <div>
                    <strong className={p.name ? "" : "pending"}>{p.name || "Đang cập nhật"}</strong>
                    <small>{p.title}</small>
                    {p.phone && <a href={`tel:${p.phone}`}><Icon name="phone" size={14} /> {p.phone}</a>}
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
