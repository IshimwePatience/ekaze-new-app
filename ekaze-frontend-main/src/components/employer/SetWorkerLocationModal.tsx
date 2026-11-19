import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MapPin, Loader2, Navigation, X } from "lucide-react";
import { useSetWorkerLocation, useRemoveWorkerLocation } from "@/hooks/useWorkerLocations";
import type { WorkerLocationItem } from "@/types/worker-location.types";

interface SetWorkerLocationModalProps {
  workerId: number | null;
  workerName: string;
  currentLocation: WorkerLocationItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const GOOGLE_MAPS_API_KEY = "AIzaSyDuYDSHmJfHOwS-B-zfTxtOugiDyuE6pxA";

const SetWorkerLocationModal = ({
  workerId,
  workerName,
  currentLocation,
  isOpen,
  onClose,
}: SetWorkerLocationModalProps) => {
  const [address, setAddress]     = useState("");
  const [district, setDistrict]   = useState("");
  const [sector, setSector]       = useState("");
  const [lat, setLat]             = useState<number | null>(null);
  const [lng, setLng]             = useState<number | null>(null);
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  const mapRef     = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markerRef   = useRef<google.maps.Marker | null>(null);

  const setLocation    = useSetWorkerLocation();
  const removeLocation = useRemoveWorkerLocation();

  // Load Google Maps
  useEffect(() => {
    if (!isOpen) return;
    if (window.google) { initMap(); return; }

    const existing = document.getElementById('google-maps-script');
    if (existing) { existing.addEventListener('load', initMap); return; }

    const script = document.createElement('script');
    script.id  = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.onload = () => { setMapLoaded(true); initMap(); };
    document.head.appendChild(script);
  }, [isOpen]);

  useEffect(() => {
    if (mapLoaded) initMap();
  }, [mapLoaded]);

  const initMap = () => {
    if (!mapRef.current || !window.google) return;

const defaultCenter = currentLocation
  ? { lat: Number(currentLocation.latitude), lng: Number(currentLocation.longitude) }
  : { lat: -1.9441, lng: 30.0619 };

    const map = new google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: currentLocation ? 15 : 12,
      mapTypeControl: false,
      streetViewControl: false,
    });

    mapInstance.current = map;

    // Place marker if current location exists
if (currentLocation) {
  placeMarker(Number(currentLocation.latitude), Number(currentLocation.longitude));
}

    // Click to place marker
    map.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      const newLat = e.latLng.lat();
      const newLng = e.latLng.lng();
      placeMarker(newLat, newLng);
      reverseGeocode(newLat, newLng);
    });
  };

  const placeMarker = (latitude: number, longitude: number) => {
    if (!mapInstance.current) return;

    if (markerRef.current) markerRef.current.setMap(null);

    markerRef.current = new google.maps.Marker({
      position: { lat: latitude, lng: longitude },
      map: mapInstance.current,
      draggable: true,
      title: workerName,
    });

    markerRef.current.addListener('dragend', (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      const newLat = e.latLng.lat();
      const newLng = e.latLng.lng();
      setLat(newLat);
      setLng(newLng);
      reverseGeocode(newLat, newLng);
    });

    setLat(latitude);
    setLng(longitude);
  };

  const reverseGeocode = (latitude: number, longitude: number) => {
    if (!window.google) return;
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
      if (status === 'OK' && results?.[0]) {
        const result = results[0];
        setAddress(result.formatted_address);

        // Extract district/sector from address components
        result.address_components.forEach((component) => {
          if (component.types.includes('administrative_area_level_2')) {
            setDistrict(component.long_name);
          }
          if (component.types.includes('administrative_area_level_3')) {
            setSector(component.long_name);
          }
        });
      }
    });
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) return;
    setIsGeolocating(true);
    console.log('🔍 geolocation called, mapInstance:', !!mapInstance.current);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        placeMarker(latitude, longitude);
        reverseGeocode(latitude, longitude);
        mapInstance.current?.setCenter({ lat: latitude, lng: longitude });
        mapInstance.current?.setZoom(15);
        setIsGeolocating(false);
      },
      () => setIsGeolocating(false)
    );
  };

  const handleAddressSearch = () => {
    if (!window.google || !address.trim()) return;
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results?.[0]) {
        const loc = results[0].geometry.location;
        placeMarker(loc.lat(), loc.lng());
        mapInstance.current?.setCenter({ lat: loc.lat(), lng: loc.lng() });
        mapInstance.current?.setZoom(15);
      }
    });
  };

  const handleSave = async () => {
    if (!workerId || lat === null || lng === null) return;
    await setLocation.mutateAsync({
      workerId,
      data: { latitude: lat, longitude: lng, address, district, sector },
    });
    onClose();
  };

  const handleRemove = async () => {
    if (!workerId) return;
    await removeLocation.mutateAsync(workerId);
    onClose();
  };

  const handleClose = () => {
    setAddress(""); setDistrict(""); setSector("");
    setLat(null); setLng(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl p-0" style={{ borderRadius: "12px" }}>
        <DialogHeader className="p-5 border-b">
          <DialogTitle className="text-sm flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            Set Location — {workerName}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Click on the map to pin the worker's location, or use your current location.
          </DialogDescription>
        </DialogHeader>

        <div className="p-5 space-y-4">
          {/* Current location badge */}
          {currentLocation && (
            <div className="flex items-center gap-2 p-2.5 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200">
              <MapPin className="w-3.5 h-3.5 text-green-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-green-700 font-medium">Current location</p>
                <p className="text-[10px] text-green-600 truncate">
                    {currentLocation.address 
                        ? `${currentLocation.address} — ${currentLocation.last_updated_diff}`
                        : `📍 ${Number(currentLocation.latitude).toFixed(4)}, ${Number(currentLocation.longitude).toFixed(4)} — ${currentLocation.last_updated_diff}`
                    }
                    </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleRemove}
                disabled={removeLocation.isPending}
                className="h-6 px-2 text-[10px] text-red-600 hover:bg-red-50"
              >
                <X className="w-3 h-3 mr-1" />
                Remove
              </Button>
            </div>
          )}

          {/* Address search */}
          <div className="flex gap-2">
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddressSearch()}
              placeholder="Type an address and press Enter..."
              className="h-9 text-xs flex-1"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={handleUseMyLocation}
              disabled={isGeolocating}
              className="h-9 text-xs shrink-0"
            >
              {isGeolocating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <><Navigation className="w-3.5 h-3.5 mr-1" />My Location</>
              )}
            </Button>
          </div>

          {/* Map */}
          <div
            ref={mapRef}
            className="w-full h-64 rounded-lg border border-border/40 bg-muted/30"
            style={{ minHeight: 256 }}
          />

          {/* District / Sector fields */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">District</Label>
              <Input value={district} onChange={(e) => setDistrict(e.target.value)} className="h-9 text-xs" placeholder="e.g. Gasabo" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Sector</Label>
              <Input value={sector} onChange={(e) => setSector(e.target.value)} className="h-9 text-xs" placeholder="e.g. Kimironko" />
            </div>
          </div>

          {/* Coordinates display */}
            {lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng) && (
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <Badge variant="outline" className="text-[10px] font-mono">
                {Number(lat).toFixed(6)}, {Number(lng).toFixed(6)}
                </Badge>
                <span>Pin placed ✓</span>
            </div>
            )}
        </div>

        <DialogFooter className="px-5 pb-5 gap-2">
          <Button variant="outline" size="sm" onClick={handleClose} className="h-9 text-xs">Cancel</Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={setLocation.isPending || lat === null || lng === null}
            className="h-9 text-xs"
          >
            {setLocation.isPending ? (
              <><Loader2 className="mr-1.5 h-3 w-3 animate-spin" />Saving...</>
            ) : "Save Location"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SetWorkerLocationModal;