import { useEffect, useRef, useState } from "react";
import boundary from "../data/tan-lap-boundary.json";
import { Icon } from "./core";
import { POIS, POI_CATEGORIES, type Poi, type PoiCat } from "../data/content";

/* ===================== Bản đồ số: ranh giới thật xã Tân Lập =====================
   Ranh giới lấy từ OpenStreetMap (relation 15801674), lưu ở src/data/tan-lap-boundary.json.
   Thư viện bản đồ Leaflet 1.9.4 đặt sẵn trong public/vendor/leaflet (không phụ thuộc CDN). */
const LEAFLET_VER = "1.9.4";
let leafletPromise: Promise<any> | null = null;
export function loadLeaflet(): Promise<any> {
  const w = window as any;
  if (w.L) return Promise.resolve(w.L);
  if (leafletPromise) return leafletPromise;
  leafletPromise = new Promise((resolve, reject) => {
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = `${import.meta.env.BASE_URL}vendor/leaflet/leaflet.css?v=${LEAFLET_VER}`;
    document.head.appendChild(css);
    const js = document.createElement("script");
    js.src = `${import.meta.env.BASE_URL}vendor/leaflet/leaflet.js?v=${LEAFLET_VER}`;
    js.onload = () => resolve(w.L);
    js.onerror = reject;
    document.head.appendChild(js);
  });
  return leafletPromise;
}

export const MAP_LAYERS = {
  map: { url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", attr: "Bản đồ &copy; Esri; ranh giới &copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a>" },
  satellite: { url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", attr: "Ảnh vệ tinh &copy; Esri; ranh giới &copy; OpenStreetMap" },
};

export const BOUNDARY_RING: [number, number][] = (boundary as any).geometry.coordinates[0].map(([x, y]: number[]) => [y, x]);
export const CENTER: [number, number] = [11.6778, 106.04];

/** Điểm (lat, lng) có nằm trong ranh giới xã không (thuật toán ray casting). */
export function insideCommune(lat: number, lng: number) {
  let inside = false;
  const r = BOUNDARY_RING;
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
    const [yi, xi] = r[i], [yj, xj] = r[j];
    if ((yi > lat) !== (yj > lat) && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

type Props = {
  className?: string;
  layer?: "map" | "satellite";
  marker?: [number, number] | null;
  pickMode?: boolean;
  onPick?: (lat: number, lng: number) => void;
  showLabel?: boolean;
  popupHtml?: string;
  pois?: Poi[];
  focusPoi?: string | null;
};

/** Bản đồ Leaflet hiển thị ranh giới xã; tùy chọn chọn vị trí bằng cách bấm lên bản đồ. */
export function BoundaryMap({ className = "", layer = "map", marker = null, pickMode = false, onPick, showLabel = true, popupHtml, pois, focusPoi = null }: Props) {
  const poiLayerRef = useRef<any>(null);
  const poiMarkersRef = useRef<Record<string, any>>({});
  const boxRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const tileRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const pickRef = useRef({ pickMode, onPick });
  pickRef.current = { pickMode, onPick };
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadLeaflet().then((L) => {
      if (cancelled || !boxRef.current || mapRef.current) return;
      const map = L.map(boxRef.current, { zoomControl: false, scrollWheelZoom: false });
      map.attributionControl.setPrefix('<a href="https://leafletjs.com" target="_blank" rel="noopener">Leaflet</a>');
      mapRef.current = map;
      L.control.zoom({ position: "topright", zoomInTitle: "Phóng to", zoomOutTitle: "Thu nhỏ" }).addTo(map);
      tileRef.current = L.tileLayer(MAP_LAYERS[layer].url, { attribution: MAP_LAYERS[layer].attr, maxZoom: 19 }).addTo(map);
      const area = L.polygon(BOUNDARY_RING, { color: "#1747b5", weight: 3, fillColor: "#3b82f6", fillOpacity: 0.22 }).addTo(map);
      if (showLabel) area.bindTooltip("Xã Tân Lập", { permanent: true, direction: "center", className: "map-name-label" });
      if (popupHtml) area.bindPopup(popupHtml);
      map.on("click", (e: any) => { const p = pickRef.current; if (p.pickMode && p.onPick) p.onPick(e.latlng.lat, e.latlng.lng); });
      area.on("click", (e: any) => { const p = pickRef.current; if (p.pickMode && p.onPick) { L.DomEvent.stopPropagation(e); p.onPick(e.latlng.lat, e.latlng.lng); } });
      const fit = () => { map.invalidateSize(); if (!markerRef.current) map.fitBounds(area.getBounds(), { padding: [16, 16] }); };
      fit();
      setTimeout(fit, 200);
      const ro = new ResizeObserver(() => map.invalidateSize());
      ro.observe(boxRef.current);
      map._ro = ro;
      map._area = area;
    }).catch(() => setFailed(true));
    return () => { cancelled = true; if (mapRef.current) { mapRef.current._ro?.disconnect(); mapRef.current.remove(); mapRef.current = null; markerRef.current = null; } };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const L = (window as any).L;
    if (!L || !mapRef.current || !tileRef.current) return;
    mapRef.current.removeLayer(tileRef.current);
    tileRef.current = L.tileLayer(MAP_LAYERS[layer].url, { attribution: MAP_LAYERS[layer].attr, maxZoom: 19 }).addTo(mapRef.current);
    tileRef.current.bringToBack();
  }, [layer]);

  useEffect(() => {
    let tries = 0;
    const apply = () => {
      const L = (window as any).L;
      const map = mapRef.current;
      if (!L || !map) { if (tries++ < 40) setTimeout(apply, 150); return; }
      if (markerRef.current) { map.removeLayer(markerRef.current); markerRef.current = null; }
      if (marker) {
        markerRef.current = L.circleMarker(marker, { radius: 9, color: "#fff", weight: 3, fillColor: "#f26a12", fillOpacity: 1 }).addTo(map);
        map.setView(marker, Math.max(map.getZoom(), 13));
      } else if (map._area) {
        map.fitBounds(map._area.getBounds(), { padding: [16, 16] });
      }
    };
    apply();
  }, [marker?.[0], marker?.[1]]);

  useEffect(() => {
    let tries = 0;
    const apply = () => {
      const L = (window as any).L;
      const map = mapRef.current;
      if (!L || !map) { if (tries++ < 40) setTimeout(apply, 150); return; }
      if (poiLayerRef.current) { map.removeLayer(poiLayerRef.current); poiLayerRef.current = null; poiMarkersRef.current = {}; }
      if (!pois) return;
      const group = L.layerGroup();
      for (const p of pois) {
        if (p.lat == null || p.lng == null) continue;
        const c = POI_CATEGORIES.find((x) => x.id === p.cat)!;
        const icon = L.divIcon({ className: "poi-pin", html: `<span style="--c:${c.color}"><i></i></span>`, iconSize: [30, 38], iconAnchor: [15, 36], popupAnchor: [0, -32] });
        const m = L.marker([p.lat, p.lng], { icon, title: p.name, riseOnHover: true })
          .bindPopup(`<div class="poi-pop"><small style="color:${c.color}">${c.label}</small><strong>${p.name}</strong><span>${p.desc}</span>${p.source ? `<em>Vị trí: ${p.source === "OSM" ? "OpenStreetMap" : p.source}</em>` : ""}</div>`);
        m.addTo(group);
        poiMarkersRef.current[p.id] = m;
      }
      group.addTo(map);
      poiLayerRef.current = group;
    };
    apply();
  }, [pois]);

  useEffect(() => {
    const map = mapRef.current;
    const m = focusPoi ? poiMarkersRef.current[focusPoi.split("|")[0]] : null;
    if (map && m) { map.setView(m.getLatLng(), Math.max(map.getZoom(), 14)); m.openPopup(); }
  }, [focusPoi]);

  return (
    <div className={`boundary-map ${pickMode ? "boundary-map--pick" : ""} ${className}`}>
      <div ref={boxRef} className="map-leaflet" />
      {failed && <div className="map-error">Không tải được bản đồ. Vui lòng kiểm tra kết nối mạng.</div>}
    </div>
  );
}

/** Thẻ bản đồ số ở trang chủ. */
export function DigitalMap() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [layer, setLayer] = useState<"map" | "satellite">("map");
  const { active, toggle, shown } = usePoiFilter();
  const toggleFull = () => {
    const el = cardRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen(); else el.requestFullscreen?.();
  };
  return (
    <div className="map-card" ref={cardRef}>
      <div className="map-card__head">
        <div><span>BẢN ĐỒ SỐ</span><strong>Xã Tân Lập</strong></div>
        <div className="map-card__tools">
          <LayerSwitch layer={layer} setLayer={setLayer} />
          <button className="map-full" aria-label="Xem toàn màn hình" onClick={toggleFull}><Icon name="area" size={19} /></button>
        </div>
      </div>
      <PoiFilter active={active} toggle={toggle} compact />
      <div className="map-canvas">
        <BoundaryMap layer={layer} pois={shown} popupHtml="<strong>Xã Tân Lập, tỉnh Tây Ninh</strong><br/>Diện tích: 257,61 km²<br/>Dân số (2025): 16.810 người<br/>Trụ sở UBND: Tổ 14, ấp Tân Hòa" />
        <div className="map-legend"><strong>Chú giải</strong><span><i className="legend-line"></i>Ranh giới xã</span><span>Diện tích 257,61 km²</span></div>
      </div>
      <div className="map-card__footer"><span><Icon name="layers" size={16} /> Dữ liệu ranh giới: OpenStreetMap</span><a href="#/quy-hoach?tab=dia-diem">Xem bản đồ đầy đủ <Icon name="arrow" size={17} /></a></div>
    </div>
  );
}

export function LayerSwitch({ layer, setLayer }: { layer: "map" | "satellite"; setLayer: (l: "map" | "satellite") => void }) {
  return (
    <div className="map-switch" role="group" aria-label="Chọn lớp bản đồ">
      <button className={layer === "map" ? "active" : ""} onClick={() => setLayer("map")}>Bản đồ</button>
      <button className={layer === "satellite" ? "active" : ""} onClick={() => setLayer("satellite")}>Vệ tinh</button>
    </div>
  );
}

/** Chip lọc theo nhóm địa điểm. */
export function PoiFilter({ active, toggle, compact = false }: { active: PoiCat[]; toggle: (c: PoiCat) => void; compact?: boolean }) {
  return (
    <div className={`poi-filter ${compact ? "poi-filter--compact" : ""}`} role="group" aria-label="Lọc địa điểm trên bản đồ">
      {POI_CATEGORIES.map((c) => {
        const n = POIS.filter((p) => p.cat === c.id).length;
        const on = active.includes(c.id);
        return (
          <button key={c.id} className={on ? "on" : ""} style={{ ["--c" as any]: c.color }} aria-pressed={on} onClick={() => toggle(c.id)}>
            <i /><span>{c.label}</span><b>{n}</b>
          </button>
        );
      })}
    </div>
  );
}

export function usePoiFilter(initial: PoiCat[] = POI_CATEGORIES.map((c) => c.id)) {
  const [active, setActive] = useState<PoiCat[]>(initial);
  const toggle = (c: PoiCat) => setActive((a) => (a.includes(c) ? a.filter((x) => x !== c) : [...a, c]));
  const shown = POIS.filter((p) => active.includes(p.cat));
  return { active, toggle, shown, setActive };
}

const gmaps = (p: Poi) => p.lat != null ? `https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.name + ", Tân Lập, Tây Ninh")}`;

/** Bản đồ + bộ lọc + danh sách địa điểm công cộng. */
export function PoiExplorer() {
  const { active, toggle, shown, setActive } = usePoiFilter();
  const [layer, setLayer] = useState<"map" | "satellite">("map");
  const [focus, setFocus] = useState<string | null>(null);
  const pinned = shown.filter((p) => p.lat != null).length;
  return (
    <div className="poi-explorer">
      <div className="poi-explorer__bar">
        <PoiFilter active={active} toggle={toggle} />
        <div className="poi-explorer__tools">
          <button className="link-btn" onClick={() => setActive(active.length === POI_CATEGORIES.length ? [] : POI_CATEGORIES.map((c) => c.id))}>{active.length === POI_CATEGORIES.length ? "Bỏ chọn tất cả" : "Chọn tất cả"}</button>
          <LayerSwitch layer={layer} setLayer={setLayer} />
        </div>
      </div>
      <div className="poi-explorer__body">
        <div className="big-map"><BoundaryMap layer={layer} pois={shown} focusPoi={focus} /></div>
        <aside className="poi-list">
          <div className="poi-list__head"><strong>{shown.length} địa điểm</strong><small>{pinned} điểm có vị trí trên bản đồ</small></div>
          <ul>
            {shown.map((p) => {
              const c = POI_CATEGORIES.find((x) => x.id === p.cat)!;
              return (
                <li key={p.id} style={{ ["--c" as any]: c.color }}>
                  <span className="poi-list__ico"><Icon name={c.icon} size={17} /></span>
                  <div>
                    <strong>{p.name}</strong>
                    <small>{p.desc}</small>
                    <div className="poi-list__act">
                      {p.lat != null ? <button className="link-btn" onClick={() => setFocus(p.id + "|" + Date.now())}><Icon name="pin" size={14} /> Xem trên bản đồ</button> : <span className="poi-list__pending">Chưa có vị trí</span>}
                      <a href={gmaps(p)} target="_blank" rel="noopener noreferrer"><Icon name="route" size={14} /> Chỉ đường</a>
                    </div>
                  </div>
                </li>
              );
            })}
            {!shown.length && <li className="poi-list__empty">Chọn ít nhất một nhóm để xem địa điểm.</li>}
          </ul>
        </aside>
      </div>
      <p className="muted small">Vị trí ghim lấy từ OpenStreetMap. Các địa điểm “Chưa có vị trí” đang chờ UBND xã cung cấp toạ độ; bấm “Chỉ đường” để tìm trên Google Maps.</p>
    </div>
  );
}
