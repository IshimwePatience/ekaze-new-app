import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeaderBreadcrumb } from "@/components/common/PageHeaderBreadcrumb";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, RefreshCw, Users, Navigation } from "lucide-react";
import { useEmployerWorkerLocations } from "@/hooks/useWorkerLocations";
import SetWorkerLocationModal from "./SetWorkerLocationModal";
import type { WorkerLocationItem } from "@/types/worker-location.types";

const GOOGLE_MAPS_API_KEY = "AIzaSyDuYDSHmJfHOwS-B-zfTxtOugiDyuE6pxA";

const EmployerWorkerMap = () => {
  const mapRef       = useRef<HTMLDivElement>(null);
  const mapInstance  = useRef<google.maps.Map | null>(null);
  const markersRef   = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  const [selectedWorker, setSelectedWorker] = useState<WorkerLocationItem | null>(null);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [locationModalWorker, setLocationModalWorker] = useState<{ id: number; name: string; current: WorkerLocationItem | null } | null>(null);

  const { data, isLoading, refetch } = useEmployerWorkerLocations();

  const workers     = data?.data?.workers || [];
  const withLocation = workers.filter(w => w.has_location !== false && w.latitude);

  // Load map
  useEffect(() => {
    if (window.google) { initMap(); return; }

    const existing = document.getElementById('google-maps-script');
    if (existing) { existing.addEventListener('load', initMap); return; }

    const script = document.createElement('script');
    script.id    = 'google-maps-script';
    script.src   = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
    script.async = true;
    script.onload = initMap;
    document.head.appendChild(script);
  }, []);

  // Plot markers when data changes
  useEffect(() => {
    if (!mapInstance.current || withLocation.length === 0) return;
    plotMarkers(withLocation);
  }, [data]);

  const initMap = () => {
    if (!mapRef.current || !window.google) return;

    mapInstance.current = new google.maps.Map(mapRef.current, {
      center: { lat: -1.9441, lng: 30.0619 },
      zoom: 12,
      mapTypeControl: false,
      streetViewControl: false,
    });

    infoWindowRef.current = new google.maps.InfoWindow();

    if (withLocation.length > 0) plotMarkers(withLocation);
  };

  const plotMarkers = (workerList: WorkerLocationItem[]) => {
    if (!mapInstance.current || !window.google) return;

    // Clear existing markers
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    workerList.forEach((worker) => {
      const marker = new google.maps.Marker({
        position: { lat: worker.latitude, lng: worker.longitude },
        map: mapInstance.current!,
        title: worker.full_name,
        icon: {
          url: worker.profile_photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(worker.full_name)}&background=6366f1&color=fff&size=40`,
          scaledSize: new google.maps.Size(40, 40),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(20, 40),
        },
      });

      marker.addListener('click', () => {
        setSelectedWorker(worker);
        infoWindowRef.current?.setContent(`
          <div style="padding:8px;min-width:180px">
            <p style="font-weight:600;font-size:13px;margin:0 0 4px">${worker.full_name}</p>
            <p style="font-size:11px;color:#666;margin:0 0 2px">${worker.address ?? 'Location set'}</p>
            <p style="font-size:10px;color:#999;margin:0">Updated ${worker.last_updated_diff}</p>
          </div>
        `);
        infoWindowRef.current?.open(mapInstance.current, marker);
      });

      markersRef.current.push(marker);
    });

    // Fit bounds
    if (workerList.length > 1) {
      const bounds = new google.maps.LatLngBounds();
      workerList.forEach(w => bounds.extend({ lat: w.latitude, lng: w.longitude }));
      mapInstance.current.fitBounds(bounds);
    } else if (workerList.length === 1) {
      mapInstance.current.setCenter({ lat: workerList[0].latitude, lng: workerList[0].longitude });
      mapInstance.current.setZoom(14);
    }
  };

  const focusWorker = (worker: WorkerLocationItem) => {
    if (!mapInstance.current) return;
    mapInstance.current.setCenter({ lat: worker.latitude, lng: worker.longitude });
    mapInstance.current.setZoom(16);
    setSelectedWorker(worker);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <PageHeaderBreadcrumb title="Worker Live Map">
        <Button size="sm" variant="outline" onClick={() => refetch()} className="h-8 text-xs gap-1.5 border-slate-300">
          <RefreshCw className="w-3 h-3" />
          Refresh
        </Button>
      </PageHeaderBreadcrumb>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card style={{ borderRadius: "10px" }} className="border-border/40">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold">{workers.length}</p>
              <p className="text-[10px] text-muted-foreground">Active Workers</p>
            </div>
          </CardContent>
        </Card>
        <Card style={{ borderRadius: "10px" }} className="border-border/40">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <MapPin className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-green-600">{withLocation.length}</p>
              <p className="text-[10px] text-muted-foreground">On Map</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Workers List */}
        <div className="lg:col-span-1 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Workers</p>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : workers.length === 0 ? (
            <Card className="border-border/40" style={{ borderRadius: "10px" }}>
              <CardContent className="p-4 text-center">
                <Users className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
                <p className="text-xs text-muted-foreground">No active workers</p>
              </CardContent>
            </Card>
          ) : (
            workers.map((worker) => (
              <Card
                key={worker.worker_id}
                style={{ borderRadius: "10px" }}
                className={`border-border/40 cursor-pointer transition-all hover:shadow-md ${selectedWorker?.worker_id === worker.worker_id ? 'border-primary/50 bg-primary/5' : ''}`}
                onClick={() => worker.latitude && focusWorker(worker)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start gap-2">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage src={worker.profile_photo || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                        {worker.full_name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">{worker.full_name}</p>
                      {worker.latitude ? (
                        <p className="text-[10px] text-muted-foreground truncate">
                          {worker.address ?? `${worker.district ?? ''} ${worker.sector ?? ''}`}
                        </p>
                      ) : (
                        <p className="text-[10px] text-orange-500">No location set</p>
                      )}
                      <p className="text-[9px] text-muted-foreground">{worker.last_updated_diff}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full mt-2 h-6 text-[10px]"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLocationModalWorker({
                        id: worker.worker_id,
                        name: worker.full_name,
                        current: worker.latitude ? worker : null,
                      });
                      setLocationModalOpen(true);
                    }}
                  >
                    <Navigation className="w-2.5 h-2.5 mr-1" />
                    {worker.latitude ? 'Update Location' : 'Set Location'}
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Map */}
        <div className="lg:col-span-3">
          <div
            ref={mapRef}
            className="w-full rounded-xl border border-border/40 bg-muted/30"
            style={{ height: 480 }}
          />
          {withLocation.length === 0 && !isLoading && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-background/90 rounded-lg p-4 text-center">
                <MapPin className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm font-medium">No workers on map yet</p>
                <p className="text-xs text-muted-foreground">Set worker locations to see them here</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Set Location Modal */}
      {locationModalWorker && (
        <SetWorkerLocationModal
          workerId={locationModalWorker.id}
          workerName={locationModalWorker.name}
          currentLocation={locationModalWorker.current}
          isOpen={locationModalOpen}
          onClose={() => { setLocationModalOpen(false); setLocationModalWorker(null); }}
        />
      )}
    </div>
  );
};

export default EmployerWorkerMap;