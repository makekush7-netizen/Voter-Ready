"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

// Developer: add your Google Maps API key to .env.local as NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
const MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

const BOOTHS = [
  { id:1, name:"Govt. Primary School, Vijay Nagar",    lat:22.7533, lng:75.8937, ward:"Ward 62" },
  { id:2, name:"Community Hall, Palasia",               lat:22.7222, lng:75.8683, ward:"Ward 31" },
  { id:3, name:"Municipal School, Geeta Bhawan",        lat:22.7310, lng:75.8870, ward:"Ward 45" },
  { id:4, name:"Govt. Higher Secondary, Rajwada",       lat:22.7196, lng:75.8577, ward:"Ward 18" },
  { id:5, name:"Panchayat Bhawan, Scheme No. 54",       lat:22.7400, lng:75.9050, ward:"Ward 71" },
  { id:6, name:"Community Centre, Annapurna Road",      lat:22.7050, lng:75.8750, ward:"Ward 09" },
  { id:7, name:"Primary School, Lasudia Mori",          lat:22.7620, lng:75.9200, ward:"Ward 83" },
  { id:8, name:"Govt. School, AB Road, Dewas Naka",     lat:22.7150, lng:75.8350, ward:"Ward 25" },
];

const DOCS = ["Voter ID card (EPIC)", "OR any one of: Aadhaar, Passport, Driving Licence, PAN card, Bank passbook with photo"];

declare global {
  interface Window { initMap: () => void; }
}

export default function BoothLocator() {
  const mapRef   = useRef<HTMLDivElement>(null);
  const mapObj   = useRef<google.maps.Map | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapsLoading, setMapsLoading] = useState<boolean>(true);

  const buildMap = () => {
    if (!mapRef.current || !window.google) return;
    const center = { lat: 22.7196, lng: 75.8577 };
    
    // Check if we are in dark mode to apply appropriate map styles
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    
    const darkStyles = [
        { elementType:"geometry",        stylers:[{color:"#0f172a"}] },
        { elementType:"labels.text.fill",stylers:[{color:"#94a3b8"}] },
        { elementType:"labels.text.stroke",stylers:[{color:"#0f172a"}] },
        { featureType:"road",elementType:"geometry",stylers:[{color:"#1e293b"}] },
        { featureType:"road",elementType:"geometry.stroke",stylers:[{color:"#0f172a"}] },
        { featureType:"water",elementType:"geometry",stylers:[{color:"#020617"}] },
        { featureType:"poi",elementType:"geometry",stylers:[{color:"#162032"}] },
    ];
    
    const lightStyles = [
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#e9e9e9" }, { lightness: 17 }] },
        { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#f5f5f5" }, { lightness: 20 }] },
        { featureType: "road.highway", elementType: "geometry.fill", stylers: [{ color: "#ffffff" }, { lightness: 17 }] },
        { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#ffffff" }, { lightness: 29 }, { weight: 0.2 }] },
        { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#ffffff" }, { lightness: 18 }] },
        { featureType: "road.local", elementType: "geometry", stylers: [{ color: "#ffffff" }, { lightness: 16 }] },
        { featureType: "poi", elementType: "geometry", stylers: [{ color: "#f5f5f5" }, { lightness: 21 }] },
        { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#dedede" }, { lightness: 21 }] },
        { elementType: "labels.text.stroke", stylers: [{ visibility: "on" }, { color: "#ffffff" }, { lightness: 16 }] },
        { elementType: "labels.text.fill", stylers: [{ saturation: 36 }, { color: "#333333" }, { lightness: 40 }] },
        { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
        { featureType: "transit", elementType: "geometry", stylers: [{ color: "#f2f2f2" }, { lightness: 19 }] },
        { featureType: "administrative", elementType: "geometry.fill", stylers: [{ color: "#fefefe" }, { lightness: 20 }] },
        { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#fefefe" }, { lightness: 17 }, { weight: 1.2 }] }
    ];

    mapObj.current = new google.maps.Map(mapRef.current, {
      center,
      zoom: 12,
      disableDefaultUI: false,
      styles: isDark ? darkStyles : lightStyles,
    });

    const infoWindow = new google.maps.InfoWindow();

    BOOTHS.forEach((booth) => {
      const marker = new google.maps.Marker({
        position: { lat: booth.lat, lng: booth.lng },
        map: mapObj.current!,
        title: booth.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: "#1d4ed8", // Trust blue
          fillOpacity: 0.9,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
      });

      marker.addListener("click", () => {
        const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${booth.lat},${booth.lng}`;
        infoWindow.setContent(`
          <div style="font-family:Inter,sans-serif;padding:4px 2px;min-width:220px">
            <p style="font-weight:700;font-size:14px;margin:0 0 4px;color:#111">${booth.name}</p>
            <p style="font-size:12px;color:#666;margin:0 0 4px">${booth.ward} · Indore, MP</p>
            <p style="font-size:12px;color:#444;margin:0 0 8px">⏰ 7:00 AM – 6:00 PM</p>
            <p style="font-size:11px;color:#888;margin:0 0 8px">Bring: ${DOCS[0]}</p>
            <a href="${mapsUrl}" target="_blank" style="display:inline-block;padding:6px 14px;background:#1d4ed8;color:#fff;border-radius:20px;font-size:12px;font-weight:600;text-decoration:none">Get Directions →</a>
          </div>
        `);
        infoWindow.open(mapObj.current!, marker);
      });
    });

    // Places Autocomplete
    const input = document.getElementById("booth-search-input") as HTMLInputElement;
    if (input && google.maps.places) {
      const ac = new google.maps.places.Autocomplete(input, { componentRestrictions: { country: "in" } });
      ac.addListener("place_changed", () => {
        const place = ac.getPlace();
        if (place.geometry?.location) {
          mapObj.current!.panTo(place.geometry.location);
          mapObj.current!.setZoom(14);
        }
      });
    }
  };

  useEffect(() => {
    // Ensure the callback is available on window for the Maps script
    window.initMap = buildMap;
    
    // If google is already loaded, build immediately
    if (window.google) {
      buildMap();
    }
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold" style={{ fontFamily:"var(--font-syne,Syne,sans-serif)", color:"var(--text-1)" }}>
          Booth Locator
        </h2>
        <p className="text-sm mt-1" style={{ color:"var(--text-2)" }}>
          8 sample booths in Indore, MP — click a pin for details
        </p>
      </div>

      {/* Search bar */}
      <div className="card px-4 py-3 flex items-center gap-3">
        <span className="text-lg flex-shrink-0">🔍</span>
        <input
          id="booth-search-input"
          type="text"
          placeholder="Search an address in India…"
          className="flex-1 bg-transparent text-sm outline-none"
          style={{ color:"var(--text-1)" }}
        />
      </div>

      {/* Map container */}
      {!MAPS_KEY ? (
        <div className="card p-8 text-center space-y-3">
          <p style={{ color:"var(--text-1)" }} className="font-semibold">📍 Maps Not Configured</p>
          <p style={{ color:"var(--text-2)" }} className="text-sm">
            To use the interactive booth locator, add a Google Maps API key to <code className="bg-slate-100 px-2 py-1 rounded text-xs">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> in <code className="bg-slate-100 px-2 py-1 rounded text-xs">.env.local</code>
          </p>
          <p style={{ color:"var(--text-2)" }} className="text-sm">Get one free at <a href="https://console.cloud.google.com/apis/library/maps-backend.googleapis.com" target="_blank" rel="noreferrer" className="underline">Google Cloud Console</a></p>
        </div>
      ) : mapError ? (
        <div className="card p-8 text-center space-y-3">
          <p style={{ color:"var(--text-1)" }} className="font-semibold">❌ Maps Failed to Load</p>
          <p style={{ color:"var(--text-2)" }} className="text-sm">{mapError}</p>
          <p style={{ color:"var(--text-2)" }} className="text-sm text-xs">Check browser console for details. Your API key may be invalid or rate-limited.</p>
        </div>
      ) : (
        <div ref={mapRef} style={{ width:"100%", height:"400px", borderRadius:"var(--radius)", border:"1px solid var(--border)" }} />
      )}

      {/* Booth list (always visible) */}
      <div className="card p-5 space-y-2">
        <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color:"var(--text-3)" }}>
          Sample Booths — Indore, MP
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {BOOTHS.map(b=>(
            <div key={b.id} className="flex items-start gap-3 p-3 rounded-xl transition-colors" 
              style={{ border: "1px solid var(--border)", background: "var(--surface)" }}>
              <span className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold" 
                style={{ background:"var(--blue-light)", color:"var(--blue)" }}>{b.id}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate" style={{ color:"var(--text-1)" }}>{b.name}</p>
                <p className="text-xs mt-0.5" style={{ color:"var(--text-2)" }}>{b.ward}</p>
                <a href={`https://www.google.com/maps/dir/?api=1&destination=${b.lat},${b.lng}`} target="_blank" rel="noopener noreferrer"
                  className="inline-block mt-2 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors" 
                  style={{ background:"var(--surface-2)", color:"var(--blue)", border:"1px solid var(--border-2)" }}>
                  Get Directions →
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Documents reminder */}
      <div className="card px-5 py-4">
        <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color:"var(--text-3)" }}>
          Bring to the Booth
        </p>
        {DOCS.map((d,i)=>(
          <p key={i} className="text-sm leading-relaxed" style={{ color:"var(--text-2)" }}>• {d}</p>
        ))}
      </div>

      {/* Load Maps script */}
      {MAPS_KEY && (
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${MAPS_KEY}&libraries=places&callback=initMap`}
          strategy="lazyOnload"
          onLoad={() => {
            if (window.google) buildMap();
          }}
        />
      )}
    </div>
  );
}
