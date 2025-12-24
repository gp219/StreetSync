'use client';
import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '@/app/lib/axios';
import { createWebSocketClient } from '@/app/lib/socket';

// --- ICONS ---
const markerIcon = new L.Icon({
  iconUrl: '/alert_marker.png',
  iconSize: [40, 41],
  iconAnchor: [12, 41],
});

const reportingIcon = new L.Icon({
  iconUrl: '/report_marker.png',
  iconSize: [30, 41],
  iconAnchor: [12, 41],
});

// Custom Pulsing Blue Dot for User Location
const userLocationIcon = new L.DivIcon({
  className: 'user-location-marker',
  html: `<div style="
    background-color: #3b82f6; 
    width: 14px; 
    height: 14px; 
    border-radius: 50%; 
    border: 2px solid white; 
    box-shadow: 0 0 8px rgba(59, 130, 246, 0.8);
  "></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

function MapEvents({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function MapView() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [categories, setCategories] = useState<Record<string, string[]>>({});
  const [userPos, setUserPos] = useState<[number, number]>([12.97, 77.59]);

  const [tempMarker, setTempMarker] = useState<{ lat: number, lng: number } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const reportBtnRef = useRef<HTMLButtonElement>(null);

  const fetchData = async (lat: number, lng: number) => {
    try {
      const [alertsRes, categoriesRes] = await Promise.all([
        api.get(`/api/alerts/nearby?lat=${lat}&lng=${lng}`),
        api.get(`/api/alerts/categories`)
      ]);
      console.log(alertsRes,categoriesRes);
      
      setAlerts(alertsRes.data);
      setCategories(categoriesRes.data);
    } catch (err) {
      console.error("Initialization error", err);
    }
  };
  // 1. Initial Data Fetch & WebSocket Setup
  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      setUserPos([latitude, longitude]);
      fetchData(latitude, longitude);
    });

    const client = createWebSocketClient((newAlert) => {
      setAlerts((prev) => {
        const exists = prev.find(a => a.id === newAlert.id);
        if (exists) return prev.map(a => a.id === newAlert.id ? newAlert : a);
        return [...prev, newAlert];
      });
    });
    client.activate();

    return () => { client.deactivate(); };
  }, []);

  // 2. LIVE TRACKER: Watch position continuously
  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setUserPos([pos.coords.latitude, pos.coords.longitude]);
      },
      (err) => console.error("GPS Watch Error:", err),
      {
        enableHighAccuracy: true,
      }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // 3. Prevent Map Clicks on Button
  useEffect(() => {
    if (reportBtnRef.current) {
      L.DomEvent.disableClickPropagation(reportBtnRef.current);
    }
  }, [categories]);


  const handleReportSubmit = async (category: string, subCategory: string) => {
    if (!tempMarker) return;
    try {
      await api.post('/api/alerts/report', {
        category,
        subCategory,
        lat: tempMarker.lat,
        lng: tempMarker.lng,
        userId: "user_"
      });
      setTempMarker(null);
      setShowModal(false);
      alert("Report submitted!");
    } catch (err) {
      alert("Error submitting report" + err);
    }
  };

  const handleQuickReport = () => {
    setTempMarker({ lat: userPos[0], lng: userPos[1] });
    setShowModal(true);
  };

  return (
    <div className="h-full w-full relative">
      <button
          ref={reportBtnRef}
          onClick={handleQuickReport}
          className="absolute top-24 right-3 z-1000 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full shadow-2xl transition-all transform hover:scale-105"
        >
          + Report Hazard
      </button>

      {/* 4. Live GPS Display Overlay */}
      <div className="absolute top-3 right-3 z-1000 bg-black/60 backdrop-blur-md text-white p-3 rounded-lg border border-white/20 pointer-events-none">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
          <span className="text-[10px] font-bold uppercase tracking-tighter">Live Tracker</span>
        </div>
        <div className="text-[10px] font-mono opacity-80">
          LAT: {userPos[0].toFixed(6)}<br />
          LNG: {userPos[1].toFixed(6)}
        </div>
      </div>

      <MapContainer center={userPos} zoom={13} className="h-full w-full">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <MapEvents onMapClick={(lat, lng) => {
          setTempMarker({ lat, lng });
          setShowModal(true);
        }} />

        {/* --- LIVE USER TRACKER (Blue Dot) --- */}
        <Marker position={userPos} icon={userLocationIcon} />
        {/* Accuracy Circle */}
        <Circle
          center={userPos}
          radius={40}
          pathOptions={{ color: '#3b82f6', weight: 1, fillOpacity: 0.1 }}
        />

        {/* Existing Alerts */}
        {alerts.map((alert) => (
          <Marker
            key={alert.id}
            position={[alert.location.coordinates[1], alert.location.coordinates[0]]}
            icon={markerIcon}
          >
            <Popup>
              <div className="p-1">
                <b className="text-blue-600">{alert.category}</b>
                <p className="text-sm">{alert.subCategory}</p>
                <p className="text-xs text-gray-500">Votes: {alert.verificationCount}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {tempMarker && (
          <Marker position={[tempMarker.lat, tempMarker.lng]} icon={reportingIcon} />
        )}
      </MapContainer>

      {/* Reporting Modal */}
      {showModal && tempMarker && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-2000 bg-white p-6 rounded-xl shadow-2xl w-80 text-black border border-gray-200">
          <h2 className="text-lg font-bold mb-4">What is the issue here?</h2>
          <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
            {Object.entries(categories).map(([mainCat, subCats]) => (
              <div key={mainCat} className="space-y-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{mainCat.replace('_', ' ')}</p>
                {subCats.map(sub => (
                  <button
                    key={sub}
                    onClick={() => handleReportSubmit(mainCat, sub)}
                    className="w-full text-left p-2 text-sm hover:bg-blue-50 border border-gray-100 rounded transition-colors"
                  >
                    {sub.replace('_', ' ')}
                  </button>
                ))}
              </div>
            ))}
          </div>
          <button
            onClick={() => { setShowModal(false); setTempMarker(null); }}
            className="w-full mt-4 text-xs text-gray-500 hover:text-red-500 underline"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}