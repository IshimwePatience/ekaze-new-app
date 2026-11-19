import { useEffect, useRef, useMemo, useState } from "react";
import { AlertTriangle, ZoomIn, ZoomOut, RotateCcw, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const GOOGLE_MAPS_API_KEY = "AIzaSyDuYDSHmJfHOwS-B-zfTxtOugiDyuE6pxA";

const RWANDA_CENTER = { lat: -1.9403, lng: 29.8739 };

const PROVINCE_COLORS: Record<string, string> = {
  "kigali city":        "#2563eb",
  "northern province":  "#7c3aed",
  "southern province":  "#16a34a",
  "eastern province":   "#ea6d0a",
  "western province":   "#be185d",
};

const DEFAULT_COLOR = "#6b7280";

function getProvinceColor(province?: string): string {
  if (!province) return DEFAULT_COLOR;
  return PROVINCE_COLORS[province.toLowerCase()] ?? DEFAULT_COLOR;
}

function normalizeProvince(province?: string): string {
  if (!province) return "Unknown";
  return province
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

interface GeoIncident {
  id: string | number;
  incident_number: string;
  type: string;
  status: string;
  severity: string;
  location: string;
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

interface IncidentGeoMapProps {
  incidents: GeoIncident[];
}

export default function IncidentGeoMap({ incidents }: IncidentGeoMapProps) {
  const mapRef     = useRef<HTMLDivElement>(null);
  const mapObj     = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  const [mapReady, setMapReady]               = useState(false);
  const [expanded, setExpanded]               = useState(false);
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null);

  const mappable = useMemo(
    () => incidents.filter((i) => i.geo?.latitude && i.geo?.longitude),
    [incidents]
  );

  // Build province stats dynamically from real geo data
  const provinceStats = useMemo(() => {
    const map: Record<string, { count: number; color: string; label: string }> = {};
    mappable.forEach((inc) => {
      const raw   = inc.geo?.province ?? "Unknown";
      const label = normalizeProvince(raw);
      const color = getProvinceColor(raw);
      if (!map[label]) map[label] = { count: 0, color, label };
      map[label].count += 1;
    });
    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [mappable]);

  const totalMappable = mappable.length;

  // ── Map init ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return;

    const initMap = () => {
      mapObj.current = new window.google.maps.Map(mapRef.current!, {
        center:            RWANDA_CENTER,
        zoom:              9,
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

      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];

      const infoWindow = new window.google.maps.InfoWindow();

      mappable.forEach((incident) => {
        const color        = getProvinceColor(incident.geo?.province);
        const provinceName = normalizeProvince(incident.geo?.province);

        const marker = new window.google.maps.Marker({
          position: { lat: incident.geo!.latitude, lng: incident.geo!.longitude },
          map:      mapObj.current!,
          title:    incident.incident_number,
          zIndex:   10,
          icon: {
            path:         window.google.maps.SymbolPath.CIRCLE,
            scale:        8,
            fillColor:    color,
            fillOpacity:  0.95,
            strokeColor:  "#ffffff",
            strokeWeight: 2,
          },
        });

        marker.addListener("click", () => {
          infoWindow.setContent(`
            <div style="font-family:system-ui,sans-serif;padding:4px 2px;min-width:190px">
              <div style="font-weight:700;font-size:12px;color:#0f172a;margin-bottom:6px;
                          padding-bottom:5px;border-bottom:1px solid #e2e8f0">
                ${incident.incident_number}
              </div>
              <div style="display:grid;gap:4px">
                <div style="display:flex;justify-content:space-between;align-items:center">
                  <span style="color:#64748b;font-size:10px">Type</span>
                  <span style="font-weight:600;color:#1e293b;font-size:10px">
                    ${incident.type.replace(/_/g, " ")}
                  </span>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center">
                  <span style="color:#64748b;font-size:10px">Status</span>
                  <span style="font-weight:600;color:#1e293b;font-size:10px">
                    ${incident.status.replace(/_/g, " ")}
                  </span>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center">
                  <span style="color:#64748b;font-size:10px">Province</span>
                  <span style="background:${color}22;color:${color};font-size:10px;
                    font-weight:600;padding:1px 7px;border-radius:99px">
                    ${provinceName}
                  </span>
                </div>
                ${incident.geo?.district ? `
                <div style="display:flex;justify-content:space-between;align-items:center">
                  <span style="color:#64748b;font-size:10px">District</span>
                  <span style="font-weight:600;color:#1e293b;font-size:10px">${incident.geo.district}</span>
                </div>` : ""}
                <div style="display:flex;justify-content:space-between;align-items:center;
                            margin-top:2px;padding-top:4px;border-top:1px solid #f1f5f9">
                  <span style="color:#64748b;font-size:10px">📍 Location</span>
                  <span style="font-weight:600;color:#1e293b;font-size:10px">
                    ${incident.geo!.label}
                  </span>
                </div>
              </div>
            </div>
          `);
          infoWindow.open(mapObj.current, marker);
        });

        markersRef.current.push(marker);
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
  }, [mappable.length]);

  // Resize on expand/collapse
  useEffect(() => {
    if (!mapObj.current || !window.google?.maps?.event) return;
    setTimeout(() => {
      window.google.maps.event.trigger(mapObj.current!, "resize");
      mapObj.current!.setCenter(RWANDA_CENTER);
    }, 450);
  }, [expanded]);

  const zoomIn    = () => mapObj.current?.setZoom((mapObj.current?.getZoom() ?? 9) + 1);
  const zoomOut   = () => mapObj.current?.setZoom((mapObj.current?.getZoom() ?? 9) - 1);
  const resetView = () => { mapObj.current?.setCenter(RWANDA_CENTER); mapObj.current?.setZoom(9); };

  const MAP_H  = expanded ? "480px" : "340px";
  const SIDE_H = expanded ? "480px" : "340px";

  return (
    <div className="space-y-2.5">

      {/* Map toolbar */}
      <div className="flex items-center justify-end">
        <div className="ml-auto flex items-center gap-2">
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

      {/* ── Map + side panel ────────────────────────────────────────── */}
      <div className="flex gap-3 items-stretch">

        {/* Map — borderless */}
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

        {/* Side stats panel — borderless */}
        {mapReady && (
          <div
            className="w-40 flex-shrink-0 rounded-[10px] bg-muted/30 p-3 flex flex-col"
            style={{ height: SIDE_H, transition: "height 0.45s ease" }}
          >
            <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-2.5">
              Province Breakdown
            </p>

            <div className="flex-1 flex flex-col justify-between overflow-hidden">
              <div className="space-y-2.5">
                {provinceStats.length > 0 ? provinceStats.map(({ label, color, count }) => {
                  const pct = totalMappable > 0 ? Math.round((count / totalMappable) * 100) : 0;
                  return (
                    <div
                      key={label}
                      className="space-y-1 cursor-default"
                      onMouseEnter={() => setHoveredProvince(label)}
                      onMouseLeave={() => setHoveredProvince(null)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: color }} />
                          <span
                            className="text-[10px] font-medium leading-none truncate"
                            style={{
                              color:    hoveredProvince === label ? color : undefined,
                              maxWidth: 72,
                            }}
                          >
                            {label.split(" ")[0]}
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
                            opacity:    hoveredProvince === label ? 1 : 0.6,
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

              {/* Footer totals */}
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

      {/* ── No geo warning ──────────────────────────────────────────── */}
      {totalMappable === 0 && (
        <div className="flex items-center gap-2 p-2.5 bg-orange-50 dark:bg-orange-950/20
                        rounded-lg border border-orange-200 dark:border-orange-800">
          <AlertTriangle className="w-3.5 h-3.5 text-orange-600 flex-shrink-0" />
          <p className="text-[11px] text-orange-700 dark:text-orange-400">
            No incidents have location coordinates. Make sure province, district, or sector
            is set when creating incidents.
          </p>
        </div>
      )}
    </div>
  );
}