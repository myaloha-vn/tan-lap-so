import { useEffect } from "react";
import "./pages.css";
import { photos, useRoute } from "./lib/core";
import { ChatBot, Footer, SubNav, TopBar } from "./components/Layout";
import Home from "./pages/Home";
import { AboutPage, OrgPage } from "./pages/About";
import { HamletDetailPage, HamletsPage } from "./pages/Hamlets";
import { PlanningPage } from "./pages/Planning";
import { DestinationPage, TourismPage } from "./pages/Tourism";
import { PolicyPage, WelfareOverviewPage, WelfarePage } from "./pages/Welfare";
import { ServicesPage } from "./pages/Services";
import { FeedbackPage } from "./pages/Feedback";
import { NewsDetailPage, NewsListPage } from "./pages/NewsPages";
import { ContactPage, NotFoundPage, SearchPage, SupportPage } from "./pages/Misc";

const TITLES: Record<string, string> = {
  "gioi-thieu": "Giới thiệu", "bo-may-to-chuc": "Bộ máy tổ chức", "ap-so": "Ấp số", "quy-hoach": "Quy hoạch", "du-lich": "Du lịch",
  "an-sinh": "An sinh xã hội", "dich-vu-cong": "Dịch vụ công", "phan-anh": "Phản ánh kiến nghị", "tin-tuc": "Tin tức", "lien-he": "Liên hệ",
  "ho-tro": "Hỗ trợ", "tim-kiem": "Tìm kiếm",
};

export default function App() {
  const { path, parts, query } = useRoute();
  const [a, b, c] = parts;

  useEffect(() => {
    document.title = a ? `${TITLES[a] || "Tân Lập Số"} — Tân Lập Số` : "Tân Lập Số — Cổng thông tin xã Tân Lập";
  }, [a]);

  let page;
  switch (a) {
    case undefined: page = <Home />; break;
    case "gioi-thieu": page = <AboutPage />; break;
    case "bo-may-to-chuc": page = <OrgPage />; break;
    case "ap-so": page = b ? <HamletDetailPage slug={b} /> : <HamletsPage />; break;
    case "quy-hoach": page = <PlanningPage />; break;
    case "du-lich": page = b ? <DestinationPage slug={b} /> : <TourismPage />; break;
    case "an-sinh": page = b === "tong-quan" ? <WelfareOverviewPage /> : b === "chinh-sach" && c ? <PolicyPage slug={c} /> : <WelfarePage key={query.get("q") || ""} initialQ={query.get("q") || ""} />; break;
    case "dich-vu-cong": page = <ServicesPage key={query.get("q") || ""} initialQ={query.get("q") || ""} />; break;
    case "phan-anh": page = <FeedbackPage hamlet={query.get("ap") || ""} field={query.get("linhvuc") || ""} />; break;
    case "tin-tuc": page = b ? <NewsDetailPage slug={b} /> : <NewsListPage initialCat={query.get("loai") || "all"} />; break;
    case "lien-he": page = <ContactPage />; break;
    case "ho-tro": page = <SupportPage slug={b || "huong-dan"} />; break;
    case "tim-kiem": page = <SearchPage key={query.get("q") || ""} q={query.get("q") || ""} />; break;
    default: page = <NotFoundPage />;
  }

  return (
    <>
      <div className="page-bg" aria-hidden="true" style={{ backgroundImage: `url(${photos.hero})` }} />
      <TopBar />
      {path !== "/" && <SubNav current={path} />}
      {page}
      <Footer />
      <ChatBot />
    </>
  );
}
