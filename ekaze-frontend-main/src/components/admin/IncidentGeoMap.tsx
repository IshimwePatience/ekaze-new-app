import { useEffect, useRef, useMemo, useState } from "react";
import { AlertTriangle, ZoomIn, ZoomOut, RotateCcw, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const GOOGLE_MAPS_API_KEY = "AIzaSyDuYDSHmJfHOwS-B-zfTxtOugiDyuE6pxA";

const RWANDA_CENTER = { lat: -1.9403, lng: 29.8739 };

const PROVINCE_COLORS: Record<string, string> = {
  "kigali city":       "#2478b8",
  "kigali":            "#2478b8",
  "northern province": "#7c3aed",
  "southern province": "#16a34a",
  "eastern province":  "#ea6d0a",
  "western province":  "#be185d",
};

const SECTOR_PALETTE = [
  "#2478b8",
  "#0284c7",
  "#0d9488",
  "#16a34a",
  "#ea580c",
  "#8b5cf6",
  "#d97706",
  "#e11d48",
  "#0891b2",
  "#4f46e5",
  "#059669",
  "#ca8a04",
];

function getProvinceColor(province?: string): string {
  if (!province) return "#6b7280";
  return PROVINCE_COLORS[province.toLowerCase()] ?? "#6b7280";
}

function getSectorColor(sector?: string): string {
  if (!sector) return "#2478b8";
  let hash = 0;
  for (let i = 0; i < sector.length; i++) {
    hash = sector.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % SECTOR_PALETTE.length;
  return SECTOR_PALETTE[index];
}

function normalizeProvince(province?: string): string {
  if (!province) return "Unknown";
  return province
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

// Matches the real API incident shape from IncidentManagement
interface GeoIncident {
  id: number;
  incident_number: string;
  incident_type: string;
  status: string;
  incident_location?: string;
  province?: string;
  district?: string;
  sector?: string;
  worker?: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    user?: { name?: string; phone?: string; national_id?: string; profile_photo?: string | null } | null;
  } | null;
  employer?: {
    user?: { name?: string; phone?: string; profile_photo?: string | null } | null;
  } | null;
  reporter?: {
    name?: string;
    phone?: string;
    profile_photo?: string | null;
  } | null;
  geo?: {
    latitude: number;
    longitude: number;
    source: string;
    label: string;
    province?: string;
    district?: string;
    sector?: string;
  } | null;
}

const getMediaUrl = (path?: string | null): string => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }
  const baseUrl = "http://localhost:5000";
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

const getInitials = (name?: string): string => {
  if (!name || name === "—") return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

interface IncidentGeoMapProps {
  incidents: GeoIncident[];
}

const DISTRICT_COORDS: Record<string, { lat: number; lng: number; province: string }> = {
  // Kigali City
  gasabo: { lat: -1.9167, lng: 30.1167, province: "Kigali City" },
  kicukiro: { lat: -1.9833, lng: 30.1000, province: "Kigali City" },
  nyarugenge: { lat: -1.9536, lng: 30.0606, province: "Kigali City" },

  // Northern Province
  burera: { lat: -1.4667, lng: 29.8333, province: "Northern Province" },
  gakenke: { lat: -1.7000, lng: 29.7833, province: "Northern Province" },
  gicumbi: { lat: -1.6167, lng: 30.1167, province: "Northern Province" },
  musanze: { lat: -1.4998, lng: 29.6350, province: "Northern Province" },
  rulindo: { lat: -1.7333, lng: 30.0000, province: "Northern Province" },

  // Southern Province
  gisagara: { lat: -2.6167, lng: 29.8333, province: "Southern Province" },
  huye: { lat: -2.5967, lng: 29.7394, province: "Southern Province" },
  kamonyi: { lat: -1.9967, lng: 29.9706, province: "Southern Province" },
  muhanga: { lat: -2.0833, lng: 29.7500, province: "Southern Province" },
  nyamagabe: { lat: -2.4667, lng: 29.4667, province: "Southern Province" },
  nyanza: { lat: -2.3500, lng: 29.7500, province: "Southern Province" },
  nyaruguru: { lat: -2.7000, lng: 29.5333, province: "Southern Province" },
  ruhango: { lat: -2.2167, lng: 29.7833, province: "Southern Province" },

  // Eastern Province
  bugesera: { lat: -2.2167, lng: 30.2500, province: "Eastern Province" },
  gatsibo: { lat: -1.6000, lng: 30.4500, province: "Eastern Province" },
  kayonza: { lat: -1.9333, lng: 30.5667, province: "Eastern Province" },
  kirehe: { lat: -2.2667, lng: 30.6500, province: "Eastern Province" },
  ngoma: { lat: -2.1833, lng: 30.5333, province: "Eastern Province" },
  nyagatare: { lat: -1.3000, lng: 30.3333, province: "Eastern Province" },
  rwamagana: { lat: -1.9500, lng: 30.4333, province: "Eastern Province" },

  // Western Province
  karongi: { lat: -2.1500, lng: 29.3500, province: "Western Province" },
  ngororero: { lat: -1.8667, lng: 29.6167, province: "Western Province" },
  nyabihu: { lat: -1.6500, lng: 29.5000, province: "Western Province" },
  nyamasheke: { lat: -2.3833, lng: 29.1333, province: "Western Province" },
  rubavu: { lat: -1.6761, lng: 29.2667, province: "Western Province" },
  rusizi: { lat: -2.4833, lng: 28.9000, province: "Western Province" },
  rutsiro: { lat: -1.9333, lng: 29.3167, province: "Western Province" },
};

const PROVINCE_COORDS: Record<string, { lat: number; lng: number }> = {
  "kigali city": { lat: -1.9441, lng: 30.0619 },
  "kigali": { lat: -1.9441, lng: 30.0619 },
  "northern province": { lat: -1.5500, lng: 29.8000 },
  "northern": { lat: -1.5500, lng: 29.8000 },
  "southern province": { lat: -2.3000, lng: 29.7000 },
  "southern": { lat: -2.3000, lng: 29.7000 },
  "eastern province": { lat: -1.9500, lng: 30.4300 },
  "eastern": { lat: -1.9500, lng: 30.4300 },
  "western province": { lat: -2.1000, lng: 29.3000 },
  "western": { lat: -2.1000, lng: 29.3000 },
};

const SECTOR_COORDS: Record<string, { lat: number; lng: number }> = {
  // Gasabo sectors
  remera: { lat: -1.9610, lng: 30.1127 },
  kimironko: { lat: -1.9482, lng: 30.1265 },
  kacyiru: { lat: -1.9324, lng: 30.0827 },
  gisozi: { lat: -1.9211, lng: 30.0682 },
  kinyinya: { lat: -1.9123, lng: 30.0984 },
  ndera: { lat: -1.9567, lng: 30.1742 },
  rusororo: { lat: -1.9654, lng: 30.2081 },
  bumbogo: { lat: -1.8974, lng: 30.1652 },
  gikomero: { lat: -1.8654, lng: 30.1983 },
  jabana: { lat: -1.8741, lng: 30.0512 },
  jali: { lat: -1.8512, lng: 30.0211 },
  nduba: { lat: -1.8421, lng: 30.0912 },
  rutunga: { lat: -1.8021, lng: 30.2215 },
  gatsata: { lat: -1.9312, lng: 30.0521 },
  kimihurura: { lat: -1.9542, lng: 30.0841 },

  // Kicukiro sectors
  kanombe: { lat: -1.9833, lng: 30.1333 },
  kicukiro: { lat: -1.9833, lng: 30.1000 },
  niboye: { lat: -1.9721, lng: 30.0912 },
  gikondo: { lat: -1.9654, lng: 30.0782 },
  gatenga: { lat: -1.9812, lng: 30.0845 },
  kagarama: { lat: -1.9892, lng: 30.1054 },

  // Nyarugenge sectors
  nyarugenge: { lat: -1.9536, lng: 30.0606 },
  nyamirambo: { lat: -1.9821, lng: 30.0512 },
  kigali: { lat: -1.9441, lng: 30.0619 },
  muhima: { lat: -1.9421, lng: 30.0582 },
  kimisagara: { lat: -1.9562, lng: 30.0432 },
  rwezamenyo: { lat: -1.9682, lng: 30.0541 },
};

function resolveIncidentGeo(incident: GeoIncident, supervisorDistrict?: string | null) {
  if (incident.geo?.latitude && incident.geo?.longitude) {
    return incident.geo;
  }
  const textToSearch = `${incident.sector || ""} ${incident.district || ""} ${incident.province || ""} ${incident.incident_location || ""}`.toLowerCase();
  
  // 1. Try matching sector first for accurate local plotting
  for (const [secName, coords] of Object.entries(SECTOR_COORDS)) {
    if (textToSearch.includes(secName)) {
      const offsetLat = (((Number(incident.id) || 1) * 17) % 100 - 50) * 0.0002;
      const offsetLng = (((Number(incident.id) || 1) * 31) % 100 - 50) * 0.0002;
      const cleanSec = secName.charAt(0).toUpperCase() + secName.slice(1);
      return {
        latitude: coords.lat + offsetLat,
        longitude: coords.lng + offsetLng,
        source: "Sector Resolved",
        label: incident.incident_location || `${cleanSec} Sector, ${incident.district || supervisorDistrict || "Gasabo"}`,
        district: incident.district || supervisorDistrict || "Gasabo",
        sector: cleanSec,
      };
    }
  }

  // 2. Try matching district
  for (const [distName, info] of Object.entries(DISTRICT_COORDS)) {
    if (textToSearch.includes(distName)) {
      const offsetLat = (((Number(incident.id) || 1) * 17) % 100 - 50) * 0.0003;
      const offsetLng = (((Number(incident.id) || 1) * 31) % 100 - 50) * 0.0003;
      return {
        latitude: info.lat + offsetLat,
        longitude: info.lng + offsetLng,
        source: "District Resolved",
        label: incident.incident_location || `${distName.charAt(0).toUpperCase() + distName.slice(1)} District`,
        district: distName.charAt(0).toUpperCase() + distName.slice(1),
        sector: incident.sector || undefined,
      };
    }
  }

  // 3. Fallback for supervisor district
  if (supervisorDistrict && DISTRICT_COORDS[supervisorDistrict.toLowerCase()]) {
    const distInfo = DISTRICT_COORDS[supervisorDistrict.toLowerCase()];
    const offsetLat = (((Number(incident.id) || 1) * 23) % 100 - 50) * 0.0004;
    const offsetLng = (((Number(incident.id) || 1) * 41) % 100 - 50) * 0.0004;
    return {
      latitude: distInfo.lat + offsetLat,
      longitude: distInfo.lng + offsetLng,
      source: "District Fallback",
      label: incident.incident_location || `${supervisorDistrict} District`,
      district: supervisorDistrict,
      sector: incident.sector || undefined,
    };
  }

  // 4. Default for admin
  const offsetLat = (((Number(incident.id) || 1) * 23) % 100 - 50) * 0.0004;
  const offsetLng = (((Number(incident.id) || 1) * 41) % 100 - 50) * 0.0004;
  return {
    latitude: RWANDA_CENTER.lat + offsetLat,
    longitude: RWANDA_CENTER.lng + offsetLng,
    source: "Rwanda Resolved",
    label: incident.incident_location || "Rwanda",
  };
}

export default function IncidentGeoMap({ incidents }: IncidentGeoMapProps) {
  const mapRef     = useRef<HTMLDivElement>(null);
  const mapObj     = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<any[]>([]);

  const { user } = useAuth();
  const isSupervisor = user?.role?.toLowerCase() === "supervisor";
  const supervisorDistrict = user?.district || (isSupervisor ? "Gasabo" : null);

  const [mapReady, setMapReady]       = useState(false);
  const [expanded, setExpanded]       = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const mapCenter = useMemo(() => {
    if (isSupervisor && supervisorDistrict && DISTRICT_COORDS[supervisorDistrict.toLowerCase()]) {
      const d = DISTRICT_COORDS[supervisorDistrict.toLowerCase()];
      return { lat: d.lat, lng: d.lng };
    }
    return RWANDA_CENTER;
  }, [isSupervisor, supervisorDistrict]);

  const defaultZoom = isSupervisor ? 12 : 9;

  const mappedIncidents = useMemo(() => {
    return incidents.map((inc) => ({
      ...inc,
      geo: resolveIncidentGeo(inc, supervisorDistrict),
    }));
  }, [incidents, supervisorDistrict]);

  const mappable = useMemo(
    () => mappedIncidents.filter((i) => i.geo?.latitude && i.geo?.longitude),
    [mappedIncidents]
  );

  const breakdownStats = useMemo(() => {
    const map: Record<string, { count: number; color: string; label: string }> = {};
    mappable.forEach((inc) => {
      if (isSupervisor) {
        const sector = inc.sector || inc.geo?.sector || `${supervisorDistrict} Area`;
        const cleanSector = sector.charAt(0).toUpperCase() + sector.slice(1);
        const color = getSectorColor(cleanSector);
        if (!map[cleanSector]) map[cleanSector] = { count: 0, color, label: cleanSector };
        map[cleanSector].count += 1;
      } else {
        const raw   = inc.geo?.province ?? "Unknown";
        const label = normalizeProvince(raw);
        const color = getProvinceColor(raw);
        if (!map[label]) map[label] = { count: 0, color, label };
        map[label].count += 1;
      }
    });
    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [mappable, isSupervisor, supervisorDistrict]);

  const totalMappable = mappable.length;

  useEffect(() => {
    if (!mapRef.current) return;

    const initMap = () => {
      mapObj.current = new window.google.maps.Map(mapRef.current!, {
        center:            mapCenter,
        zoom:              defaultZoom,
        minZoom:           2,
        mapTypeControl:    false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl:       false,
        styles: [
          { featureType: "poi",       elementType: "labels",       stylers: [{ visibility: "off" }] },
          { featureType: "transit",   elementType: "all",          stylers: [{ visibility: "off" }] },
          { featureType: "road",      elementType: "labels",       stylers: [{ visibility: "off" }] },
          { featureType: "water",     elementType: "geometry",     stylers: [{ color: "#bfdbfe" }] },
          { featureType: "landscape", elementType: "geometry",     stylers: [{ color: "#f1f5f9" }] },
          { featureType: "road.highway",  elementType: "geometry", stylers: [{ color: "#e2e8f0" }] },
          { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#e8edf4" }] },
          { featureType: "administrative.country", elementType: "geometry.stroke",
            stylers: [{ color: "#1e3a8a" }, { weight: 3 }] },
          { featureType: "administrative.locality", elementType: "labels.text.fill",
            stylers: [{ color: "#475569" }] },
          { featureType: "administrative.locality", elementType: "labels.text.stroke",
            stylers: [{ color: "#f8fafc" }, { weight: 3 }] },
        ],
      });

      // Custom HTML Marker using OverlayView to render reporter profile picture as the pin
      class ReporterAvatarOverlay extends window.google.maps.OverlayView {
        private pos: google.maps.LatLng;
        private container: HTMLDivElement;

        constructor(pos: google.maps.LatLng, html: string, map: google.maps.Map, onClick: () => void) {
          super();
          this.pos = pos;
          this.container = document.createElement("div");
          this.container.style.position = "absolute";
          this.container.style.cursor = "pointer";
          this.container.style.zIndex = "10";
          this.container.innerHTML = html;
          this.container.addEventListener("click", (e) => {
            e.stopPropagation();
            onClick();
          });
          this.setMap(map);
        }

        onAdd() {
          const panes = this.getPanes();
          panes?.overlayMouseTarget.appendChild(this.container);
        }

        draw() {
          const projection = this.getProjection();
          if (!projection) return;
          const point = projection.fromLatLngToDivPixel(this.pos);
          if (point) {
            this.container.style.left = `${point.x - 20}px`;
            this.container.style.top = `${point.y - 48}px`;
          }
        }

        onRemove() {
          if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
          }
        }
      }

      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];

      const infoWindow = new window.google.maps.InfoWindow();

      mappable.forEach((incident) => {
        const sectorName   = incident.sector || incident.geo?.sector || (isSupervisor ? `${supervisorDistrict} Sector` : "");
        const color        = isSupervisor ? getSectorColor(sectorName || "Sector") : getProvinceColor(incident.geo?.province);
        const badgeLabel   = isSupervisor ? (sectorName || `${supervisorDistrict} District`) : normalizeProvince(incident.geo?.province);
        const workerName   = incident.worker?.user?.name
          || [incident.worker?.first_name, incident.worker?.last_name].filter(Boolean).join(" ")
          || "Worker";
        const workerPhone  = incident.worker?.user?.phone || incident.worker?.phone || null;
        const workerPhoto  = incident.worker?.user?.profile_photo || null;
        const workerPhotoUrl = getMediaUrl(workerPhoto);
        const workerInitials = getInitials(workerName);

        const reporterName = incident.employer?.user?.name || incident.reporter?.name || "—";
        const reporterPhone = incident.employer?.user?.phone || incident.reporter?.phone || null;
        const isReporterWorker =
          incident.reporter?.id &&
          incident.worker?.user?.id &&
          String(incident.reporter.id) === String(incident.worker.user.id);
        const reporterPhoto = incident.employer?.user
          ? incident.employer.user.profile_photo
          : isReporterWorker
          ? null
          : incident.reporter?.profile_photo || null;
        const reporterPhotoUrl = getMediaUrl(reporterPhoto);
        const reporterInitials = getInitials(reporterName);

        const pos = new window.google.maps.LatLng(incident.geo!.latitude, incident.geo!.longitude);

        // Marker HTML featuring reporter's profile picture in a sleek pin badge
        const markerHtml = `
          <div style="display:flex;flex-direction:column;align-items:center;transition:transform 0.2s ease;filter:drop-shadow(0 3px 6px rgba(0,0,0,0.35));" onmouseover="this.style.transform='scale(1.15)';" onmouseout="this.style.transform='scale(1)';">
            <div style="width:40px;height:40px;border-radius:50%;border:3px solid ${color};background:#ffffff;overflow:hidden;display:flex;align-items:center;justify-content:center;box-sizing:border-box;">
              ${
                reporterPhotoUrl
                  ? `<img src="${reporterPhotoUrl}" alt="${reporterName}" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" /><div style="display:none;width:100%;height:100%;align-items:center;justify-content:center;background:${color}22;color:${color};font-weight:700;font-size:12px;font-family:sans-serif;">${reporterInitials}</div>`
                  : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:${color}22;color:${color};font-weight:700;font-size:12px;font-family:sans-serif;">${reporterInitials}</div>`
              }
            </div>
            <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:7px solid ${color};margin-top:-1px;"></div>
          </div>
        `;

        const openInfo = () => {
          infoWindow.setPosition(pos);
          infoWindow.setContent(`
            <div style="font-family:system-ui,sans-serif;padding:6px 2px;min-width:240px">
              <div style="font-weight:700;font-size:12px;color:#0f172a;margin-bottom:6px;padding-bottom:5px;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center">
                <span>${incident.incident_number}</span>
                <span style="background:${color}18;color:${color};font-size:9px;font-weight:700;padding:2px 6px;border-radius:99px">${badgeLabel}</span>
              </div>
              <div style="display:grid;gap:6px">
                <div style="display:flex;justify-content:space-between;align-items:center">
                  <span style="color:#64748b;font-size:10px">Type</span>
                  <span style="font-weight:600;color:#1e293b;font-size:10px">${incident.incident_type.replace(/_/g, " ")}</span>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center">
                  <span style="color:#64748b;font-size:10px">Status</span>
                  <span style="font-weight:600;color:#1e293b;font-size:10px">${incident.status.replace(/_/g, " ")}</span>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:flex-start">
                  <span style="color:#64748b;font-size:10px">Worker</span>
                  <div style="display:flex;align-items:center;gap:6px">
                    <div style="width:22px;height:22px;border-radius:50%;background:#e2e8f0;overflow:hidden;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:#334155;">
                      ${workerPhotoUrl ? `<img src="${workerPhotoUrl}" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" /><span style="display:none">${workerInitials}</span>` : workerInitials}
                    </div>
                    <div style="text-align:right">
                      <div style="font-weight:600;color:#1e293b;font-size:10px">${workerName}</div>
                      ${workerPhone ? `<div style="font-size:9px;color:#2563eb;font-weight:600">📞 ${workerPhone}</div>` : ""}
                    </div>
                  </div>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:flex-start">
                  <span style="color:#64748b;font-size:10px">Reported By</span>
                  <div style="display:flex;align-items:center;gap:6px">
                    <div style="width:22px;height:22px;border-radius:50%;background:#e2e8f0;overflow:hidden;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:#334155;">
                      ${reporterPhotoUrl ? `<img src="${reporterPhotoUrl}" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" /><span style="display:none">${reporterInitials}</span>` : reporterInitials}
                    </div>
                    <div style="text-align:right">
                      <div style="font-weight:600;color:#1e293b;font-size:10px">${reporterName}</div>
                      ${reporterPhone ? `<div style="font-size:9px;color:#2563eb;font-weight:600">📞 ${reporterPhone}</div>` : ""}
                    </div>
                  </div>
                </div>
                ${(incident.sector || incident.geo?.sector) ? `
                <div style="display:flex;justify-content:space-between;align-items:center">
                  <span style="color:#64748b;font-size:10px">Sector</span>
                  <span style="font-weight:600;color:#1e293b;font-size:10px">${incident.sector || incident.geo?.sector}</span>
                </div>` : ""}
                ${(supervisorDistrict || incident.geo?.district) ? `
                <div style="display:flex;justify-content:space-between;align-items:center">
                  <span style="color:#64748b;font-size:10px">District</span>
                  <span style="font-weight:600;color:#1e293b;font-size:10px">${supervisorDistrict || incident.geo?.district}</span>
                </div>` : ""}
                <div style="display:flex;justify-content:space-between;align-items:center;margin-top:2px;padding-top:4px;border-top:1px solid #f1f5f9">
                  <span style="color:#64748b;font-size:10px">📍</span>
                  <span style="font-weight:600;color:#1e293b;font-size:10px">${incident.geo!.label}</span>
                </div>
              </div>
            </div>
          `);
          infoWindow.open(mapObj.current);
        };

        const overlay = new ReporterAvatarOverlay(pos, markerHtml, mapObj.current!, openInfo);
        markersRef.current.push(overlay);
      });

      setMapReady(true);
    };

    if (window.google?.maps) { initMap(); return; }

    const existing = document.getElementById("gmaps-script");
    if (existing) { existing.addEventListener("load", initMap); return; }

    const script  = document.createElement("script");
    script.id     = "gmaps-script";
    script.src    = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
    script.async  = true;
    script.defer  = true;
    script.onload = initMap;
    document.head.appendChild(script);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mappable.length, mapCenter, defaultZoom, isSupervisor, supervisorDistrict]);

  useEffect(() => {
    if (!mapObj.current || !window.google?.maps?.event) return;
    setTimeout(() => {
      window.google.maps.event.trigger(mapObj.current!, "resize");
      mapObj.current!.setCenter(mapCenter);
    }, 450);
  }, [expanded, mapCenter]);

  const zoomIn    = () => mapObj.current?.setZoom((mapObj.current?.getZoom() ?? defaultZoom) + 1);
  const zoomOut   = () => mapObj.current?.setZoom((mapObj.current?.getZoom() ?? defaultZoom) - 1);
  const resetView = () => { mapObj.current?.setCenter(mapCenter); mapObj.current?.setZoom(defaultZoom); };

  const MAP_H  = expanded ? "480px" : "360px";
  const SIDE_H = expanded ? "480px" : "360px";

  return (
    <div className="space-y-2.5">

      {/* Map toolbar */}
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">
            <span className="font-semibold text-foreground">{totalMappable}</span>/{incidents.length} plotted
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setExpanded((v) => !v)}
            className="h-6 px-2 text-[10px] gap-1"
          >
            <Maximize2 className="w-2.5 h-2.5" />
            {expanded ? "Collapse" : "Expand"}
          </Button>
        </div>
      </div>

      {/* Map + side panel */}
      <div className="flex gap-3 items-stretch">

        {/* Map — no border */}
        <div
          className="flex-1 relative overflow-hidden rounded-[10px]"
          style={{ height: MAP_H, transition: "height 0.45s ease" }}
        >
          <div ref={mapRef} style={{ width: "100%", height: "100%" }} />

          {/* Zoom controls */}
          <div className="absolute right-2 top-2 flex flex-col gap-1 z-10">
            {[
              { icon: <ZoomIn className="w-3 h-3" />,        action: zoomIn    },
              { icon: <ZoomOut className="w-3 h-3" />,       action: zoomOut   },
              { icon: <RotateCcw className="w-2.5 h-2.5" />, action: resetView },
            ].map((btn, i) => (
              <Button
                key={i}
                size="sm"
                variant="secondary"
                onClick={btn.action}
                className="h-7 w-7 p-0 shadow rounded-lg border border-border/40 bg-background/90 backdrop-blur-sm"
              >
                {btn.icon}
              </Button>
            ))}
          </div>
        </div>

        {/* Stats panel — no border */}
        {mapReady && (
          <div
            className="w-40 flex-shrink-0 rounded-[10px] bg-muted/30 p-3 flex flex-col"
            style={{ height: SIDE_H, transition: "height 0.45s ease" }}
          >
            <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-2.5">
              {isSupervisor ? "Sector Breakdown" : "Province Breakdown"}
            </p>

            <div className="flex-1 flex flex-col justify-between overflow-hidden">
              <div className="space-y-2.5">
                {breakdownStats.length > 0 ? breakdownStats.map(({ label, color, count }) => {
                  const pct = totalMappable > 0 ? Math.round((count / totalMappable) * 100) : 0;
                  return (
                    <div
                      key={label}
                      className="space-y-1 cursor-default"
                      onMouseEnter={() => setHoveredItem(label)}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: color }} />
                          <span
                            className="text-[10px] font-medium leading-none truncate"
                            style={{ color: hoveredItem === label ? color : undefined, maxWidth: 72 }}
                            title={label}
                          >
                            {label.replace(/ Sector$/i, "")}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-foreground">{count}</span>
                      </div>
                      <div className="w-full h-1 bg-muted/60 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width:      `${pct}%`,
                            background: color,
                            opacity:    hoveredItem === label ? 1 : 0.6,
                          }}
                        />
                      </div>
                      <span className="text-[9px] text-muted-foreground">{pct}%</span>
                    </div>
                  );
                }) : (
                  <p className="text-[10px] text-muted-foreground">No mapped incidents</p>
                )}
              </div>

              <div className="pt-2 mt-2 border-t border-border/40 space-y-0.5">
                <div className="flex justify-between">
                  <span className="text-[9px] text-muted-foreground">Mapped</span>
                  <span className="text-[10px] font-bold text-foreground">{totalMappable}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[9px] text-muted-foreground">Total</span>
                  <span className="text-[10px] font-bold text-foreground">{incidents.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[9px] text-muted-foreground">No coords</span>
                  <span className="text-[10px] font-bold text-muted-foreground">
                    {incidents.length - totalMappable}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* No geo warning */}
      {totalMappable === 0 && (
        <div className="flex items-center gap-2 p-2.5 bg-orange-50 dark:bg-orange-950/20
                        rounded-lg border border-orange-200 dark:border-orange-800">
          <AlertTriangle className="w-3.5 h-3.5 text-orange-600 flex-shrink-0" />
          <p className="text-[11px] text-orange-700 dark:text-orange-400">
            {isSupervisor
              ? `No district incidents have location coordinates. Make sure sector is set when creating incidents in ${supervisorDistrict || "the"} district.`
              : "No incidents have location coordinates. Make sure province, district, or sector is set when creating incidents."}
          </p>
        </div>
      )}
    </div>
  );
}