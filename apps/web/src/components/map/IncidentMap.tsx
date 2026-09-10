import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Alert } from '../../services/api';

interface Props {
  alerts: Alert[];
  selectedAlert: Alert | null;
  onSelectAlert: (alert: Alert) => void;
  className?: string;
}

export const IncidentMap: React.FC<Props> = ({
  alerts,
  selectedAlert,
  onSelectAlert,
  className = 'h-[500px]'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Default center on India (Delhi NCR / Bangalore coords)
    const initialLat = selectedAlert?.latitude || 28.6139;
    const initialLng = selectedAlert?.longitude || 77.2090;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 13,
      zoomControl: true
    });

    // CartoDB Positron / OSM clean medical tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    // 1. Add static trauma centres / hospital markers for realism
    const hospitalIcon = L.divIcon({
      className: 'custom-hospital-marker',
      html: `<div style="background-color: #0284C7; color: white; width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; box-shadow: 0 4px 6px rgba(0,0,0,0.2); border: 2px solid white;">H</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    const hospitals = [
      { name: 'AIIMS Apex Trauma Center', lat: 28.5672, lng: 77.2100 },
      { name: 'Safdarjung Emergency Hospital', lat: 28.5701, lng: 77.2078 },
      { name: 'Apollo Emergency Trauma Wing', lat: 28.5360, lng: 77.2830 }
    ];

    hospitals.forEach(h => {
      L.marker([h.lat, h.lng], { icon: hospitalIcon })
        .bindPopup(`<strong>${h.name}</strong><br/><span style="font-size: 11px; color: #0284C7;">Designated Golden Hour Emergency Facility</span>`)
        .addTo(layer);
    });

    // 2. Add Incident Markers
    alerts.forEach(alert => {
      if (alert.latitude === null || alert.longitude === null) return;

      const isSelected = selectedAlert?.id === alert.id;
      const isUrgent = alert.status === 'pending' || alert.status === 'acknowledged';

      const markerColor = alert.status === 'resolved' 
        ? '#10B981' 
        : alert.status === 'responding' 
        ? '#6366F1' 
        : '#E11D48';

      const pulseHtml = isUrgent ? `
        <div style="position: absolute; width: 44px; height: 44px; left: -10px; top: -10px; border-radius: 50%; background: ${markerColor}; opacity: 0.4; animation: sonarWave 1.8s infinite ease-out;"></div>
      ` : '';

      const markerHtml = `
        <div style="position: relative; width: 24px; height: 24px; cursor: pointer;">
          ${pulseHtml}
          <div style="background-color: ${markerColor}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
            <div style="width: 6px; height: 6px; background-color: white; border-radius: 50%;"></div>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-incident-marker',
        html: markerHtml,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([alert.latitude, alert.longitude], { icon: customIcon })
        .addTo(layer);

      marker.on('click', () => {
        onSelectAlert(alert);
      });

      const popupContent = `
        <div style="font-family: sans-serif; min-width: 180px; padding: 2px;">
          <div style="font-size: 11px; text-transform: uppercase; font-weight: bold; color: ${markerColor}; margin-bottom: 2px;">
            ${alert.detectionType === 'demo_simulated' ? '⚠️ DEMO EVENT' : '🚨 CRASH INCIDENT'}
          </div>
          <div style="font-weight: bold; font-size: 14px; color: #0F172A;">${alert.riderName}</div>
          <div style="font-size: 12px; color: #475569; margin: 4px 0;">
            Blood: <strong>${alert.medicalSummary?.bloodGroup || 'O+'}</strong> | Tag: <strong>${alert.tagId}</strong>
          </div>
          <div style="font-size: 11px; color: #64748B;">
            Status: <span style="font-weight: 600; text-transform: capitalize;">${alert.status}</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      if (isSelected) {
        marker.openPopup();
      }
    });

    // Fly to selected alert location
    if (selectedAlert && selectedAlert.latitude && selectedAlert.longitude) {
      map.flyTo([selectedAlert.latitude, selectedAlert.longitude], 14, {
        duration: 0.8
      });
    }
  }, [alerts, selectedAlert]);

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden shadow-inner border border-slate-200 ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-20 glass-panel p-2.5 rounded-xl text-xs space-y-1.5 shadow-md">
        <div className="font-semibold text-slate-800 text-[11px]">Map Telemetry</div>
        <div className="flex items-center gap-2 text-slate-600">
          <span className="w-3 h-3 rounded-full bg-rose-500 shrink-0 inline-block border border-white" />
          <span>Active Incident (Pending)</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <span className="w-3 h-3 rounded-full bg-indigo-500 shrink-0 inline-block border border-white" />
          <span>EMS Unit Responding</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0 inline-block border border-white" />
          <span>Resolved Site</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <span className="w-3 h-3 rounded bg-sky-600 text-white text-[9px] font-bold flex items-center justify-center shrink-0">H</span>
          <span>Trauma Center Facility</span>
        </div>
      </div>
    </div>
  );
};
