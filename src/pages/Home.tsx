import { useState } from "react";
import { Icon, SectionHeading, go, orPending, photos, to, type IconName } from "../lib/core";
import { DigitalMap } from "../lib/maps";
import { DESTINATIONS, NEWS, OVERVIEW } from "../data/content";

function Hero() {
  const [q, setQ] = useState("");
  const search = () => go(`/tim-kiem?q=${encodeURIComponent(q.trim())}`);
  return (
    <section className="hero">
      <div className="container hero__inner">
        <div className="hero__content">
          <span className="welcome">Chào mừng bạn đến với</span>
          <h1>TÂN LẬP <em>SỐ</em></h1>
          <p>Cổng thông tin số gần gũi, minh bạch và tiện ích — kết nối chính quyền với người dân, đồng hành xây dựng Tân Lập văn minh, hiện đại.</p>
          <form className="hero-search" onSubmit={(e) => { e.preventDefault(); search(); }}>
            <Icon name="search" size={21} />
            <input aria-label="Tìm kiếm thông tin" placeholder="Tìm thủ tục, địa điểm, tin tức..." value={q} onChange={(e) => setQ(e.target.value)} />
            <button type="submit">Tìm kiếm</button>
          </form>
          <div className="hero-shortcuts">
            {([["file","Dịch vụ công","/dich-vu-cong"],["map","Bản đồ số","/quy-hoach"],["megaphone","Phản ánh","/phan-anh"],["phone","Liên hệ","/lien-he"]] as [IconName,string,string][]).map(([icon, label, path]) => (
              <a href={to(path)} key={label}><span><Icon name={icon} size={21} /></span>{label}</a>
            ))}
          </div>
        </div>
        <div className="hero__map"><DigitalMap /></div>
      </div>
    </section>
  );
}

const stats: [IconName, string, string][] = [
  ["users", `Dân số (${OVERVIEW.populationYear})`, `${OVERVIEW.population} người`], ["area", "Diện tích", `${OVERVIEW.area} km²`], ["layers", "Mật độ dân số", `${OVERVIEW.density} người/km²`],
  ["building", "Hợp nhất từ", `${OVERVIEW.formedFrom.length} xã`], ["shield", "Mã ĐVHC", OVERVIEW.unitCode], ["file", "Mã bưu chính", OVERVIEW.postalCode],
  ["home", "Hộ dân", orPending(OVERVIEW.households)], ["school", "Trường học", orPending(OVERVIEW.schools)], ["health", "Cơ sở y tế", orPending(OVERVIEW.clinics)],
];

function Stats() {
  return (
    <section className="stats-section">
      <div className="container">
        <SectionHeading eyebrow="TỔNG QUAN" title="Tân Lập qua những con số" action="Xem giới thiệu" href={to("/gioi-thieu")} />
        <div className="stats-grid">
          {stats.map(([icon, label, value], i) => <div className={`stat-card ${value === "Đang cập nhật" ? "stat-card--pending" : ""}`} key={label}><span className={`stat-icon stat-icon--${i % 4}`}><Icon name={icon} /></span><strong>{value}</strong><small>{label}</small></div>)}
        </div>
      </div>
    </section>
  );
}

const utilities: [string, IconName, string, string][] = [
  ["Giới thiệu", "building", "Lịch sử, bộ máy, địa giới", "/gioi-thieu"], ["Ấp số", "home", "Thông tin từng ấp", "/ap-so"], ["Quy hoạch", "map", "Bản đồ, tra cứu vị trí", "/quy-hoach"],
  ["Du lịch", "camera", "Điểm đến, văn hóa, ẩm thực", "/du-lich"], ["An sinh", "heart", "Chính sách, hỗ trợ người dân", "/an-sinh"], ["Dịch vụ công", "file", "Thủ tục hành chính trực tuyến", "/dich-vu-cong"], ["Phản ánh", "megaphone", "Gửi phản ánh, kiến nghị", "/phan-anh"],
];

function Utilities() {
  return (
    <section className="section utilities">
      <div className="container">
        <SectionHeading eyebrow="DÀNH CHO NGƯỜI DÂN" title="Tiện ích nhanh" action="Câu hỏi thường gặp" href={to("/ho-tro/cau-hoi-thuong-gap")} />
        <div className="utility-grid">
          {utilities.map(([title, icon, desc, path], i) => <a className={`utility-card utility-card--c${i % 7}`} href={to(path)} key={title}>
            <span className="utility-card__icon"><Icon name={icon} size={34} /></span>
            <strong>{title}</strong>
            <small>{desc}</small>
            <span className="utility-card__arrow"><Icon name="arrow" size={17} /></span>
          </a>)}
        </div>
      </div>
    </section>
  );
}

const genericPlaces: [string, string, string, string, string][] = [
  ["Không gian văn hóa địa phương", "Nét đẹp truyền thống, lễ hội và tín ngưỡng được gìn giữ qua nhiều thế hệ.", photos.temple, "/du-lich", "Văn hóa – tín ngưỡng"],
  ["Nhịp sống Tân Lập", "Khám phá những góc quê bình dị, gần gũi và đầy sức sống.", photos.street, "/du-lich", "Đời sống"],
  ["Thiên nhiên – sinh thái", "Không gian xanh của rừng, ruộng vườn và đời sống nông thôn.", photos.park, "/du-lich", "Sinh thái"],
  ["Trải nghiệm bản địa", "Chạm vào vẻ đẹp con người, ẩm thực và cuộc sống Tân Lập.", photos.culture, "/du-lich", "Trải nghiệm"],
];

function Explore() {
  const items: [string, string, string, string, string][] = [
    ...DESTINATIONS.map((d) => [d.name, d.summary, d.image, `/du-lich/${d.slug}`, d.category] as [string, string, string, string, string]),
    ...genericPlaces,
  ].slice(0, 5);
  return (
    <section className="section explore">
      <div className="container">
        <SectionHeading eyebrow="ĐI ĐÂU · XEM GÌ" title="Khám phá Tân Lập" action="Tất cả điểm đến" href={to("/du-lich")} />
        <div className="places-grid places-grid--h">
          {items.map(([title, desc, image, path, tag], i) => <article className="place-h" key={title}>
            <a href={to(path)} className="place-h__img"><img src={image} alt={title} /><span>0{i + 1}</span></a>
            <div className="place-h__body">
              <small className="place-h__tag"><Icon name="pin" size={14} /> {tag}</small>
              <h3><a href={to(path)}>{title}</a></h3>
              <p>{desc}</p>
              <a className="place-h__more" href={to(path)}>Khám phá <Icon name="arrow" size={17} /></a>
            </div>
          </article>)}
        </div>
      </div>
    </section>
  );
}

function News() {
  const featured = NEWS.find((n) => n.featured) || NEWS[0];
  const others = NEWS.filter((n) => n !== featured).slice(0, 4);
  const date = (d: string) => d || "Ngày đăng đang cập nhật";
  return (
    <section className="section news">
      <div className="container">
        <SectionHeading eyebrow="CẬP NHẬT MỖI NGÀY" title="Tin tức – Thông báo" action="Xem tất cả tin" href={to("/tin-tuc")} />
        <div className="news-layout">
          <article className="featured-news">
            <a href={to(`/tin-tuc/${featured.slug}`)} className="featured-news__image"><img src={featured.image} alt="" /><span>TIN NỔI BẬT</span></a>
            <div className="featured-news__body"><div className="date"><Icon name="calendar" size={16} /> {date(featured.date)}</div><h3>{featured.title}</h3><p>{featured.summary}</p><a href={to(`/tin-tuc/${featured.slug}`)}>Đọc bài viết <Icon name="arrow" size={18} /></a></div>
          </article>
          <div className="news-list">
            {others.map((n) => <article className="news-item" key={n.slug}><img src={n.image} alt="" /><div><span><Icon name="calendar" size={14} /> {date(n.date)} · {n.category}</span><h3>{n.title}</h3><a href={to(`/tin-tuc/${n.slug}`)}>Xem chi tiết <Icon name="chevron" size={14} /></a></div></article>)}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return <main><Hero /><Stats /><Utilities /><Explore /><News /></main>;
}
