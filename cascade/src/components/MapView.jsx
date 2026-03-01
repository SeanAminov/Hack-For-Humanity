/**
 * MapView — Dark-themed interactive map centered on San Jose / Santa Clara.
 * Uses Leaflet with dark CartoDB tiles for a Plague-Inc aesthetic.
 */

import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon path issue with bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Center between SJSU and SCU
const MAP_CENTER = [37.3420, -121.9100];
const DEFAULT_ZOOM = 13;

// Key landmarks in the demo area
const LANDMARKS = [
  { id: 'sjsu', name: 'San Jose State University', pos: [37.3352, -121.8811], type: 'university' },
  { id: 'scu', name: 'Santa Clara University', pos: [37.3496, -121.9400], type: 'university' },
  { id: 'vmc', name: 'Valley Medical Center', pos: [37.3135, -121.9218], type: 'hospital' },
  { id: 'rmc', name: 'Regional Medical Center', pos: [37.3661, -121.9289], type: 'hospital' },
  { id: 'oconnor', name: "O'Connor Hospital", pos: [37.3080, -121.9385], type: 'hospital' },
  { id: 'sjpd', name: 'San Jose Police Dept', pos: [37.3305, -121.8857], type: 'police' },
  { id: 'sjfd1', name: 'Fire Station 1', pos: [37.3382, -121.8863], type: 'fire' },
  { id: 'sjfd7', name: 'Fire Station 7', pos: [37.3500, -121.9100], type: 'fire' },
  { id: 'convention', name: 'Convention Center', pos: [37.3302, -121.8880], type: 'poi' },
  { id: 'airport', name: 'SJC Airport', pos: [37.3639, -121.9289], type: 'poi' },
];

const ICON_MAP = {
  university: { emoji: '🏛️', color: '#60a5fa' },
  hospital: { emoji: '🏥', color: '#34d399' },
  police: { emoji: '🚔', color: '#60a5fa' },
  fire: { emoji: '🚒', color: '#f87171' },
  poi: { emoji: '📍', color: '#a78bfa' },
};

function createEmojiIcon(type) {
  const config = ICON_MAP[type] || ICON_MAP.poi;
  return L.divIcon({
    html: `<div style="font-size:18px;text-align:center;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.8))">${config.emoji}</div>`,
    className: 'emoji-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

// Component to animate map to new bounds when incidents change
function MapUpdater({ incidents }) {
  const map = useMap();
  useEffect(() => {
    if (incidents && incidents.length > 0) {
      // Don't auto-fly, let user control the map
    }
  }, [incidents, map]);
  return null;
}

export default function MapView({ incidents = [], resources = [], round = 0 }) {
  const mapRef = useRef(null);

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={MAP_CENTER}
        zoom={DEFAULT_ZOOM}
        className="w-full h-full"
        zoomControl={false}
        attributionControl={false}
        ref={mapRef}
        style={{ background: '#0a0a0f' }}
      >
        {/* Dark map tiles — CartoDB Dark Matter */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution=""
        />

        <MapUpdater incidents={incidents} />

        {/* Landmark markers */}
        {LANDMARKS.map((lm) => (
          <Marker key={lm.id} position={lm.pos} icon={createEmojiIcon(lm.type)}>
            <Popup className="dark-popup">
              <span style={{ color: '#e8e8ec', fontSize: 12 }}>{lm.name}</span>
            </Popup>
          </Marker>
        ))}

        {/* Incident zones — red/orange spreading circles */}
        {incidents.map((inc, i) => (
          <Circle
            key={`incident-${i}`}
            center={inc.pos}
            radius={inc.radius || 300}
            pathOptions={{
              color: inc.color || '#ef4444',
              fillColor: inc.color || '#ef4444',
              fillOpacity: inc.opacity || 0.15,
              weight: 1.5,
              dashArray: inc.spreading ? '5 5' : undefined,
            }}
          >
            {inc.label && (
              <Popup>
                <span style={{ color: '#e8e8ec', fontSize: 12 }}>{inc.label}</span>
              </Popup>
            )}
          </Circle>
        ))}

        {/* Resource deployment markers */}
        {resources.map((res, i) => (
          <Circle
            key={`resource-${i}`}
            center={res.pos}
            radius={res.radius || 150}
            pathOptions={{
              color: '#3b82f6',
              fillColor: '#3b82f6',
              fillOpacity: 0.12,
              weight: 1.5,
            }}
          >
            {res.label && (
              <Popup>
                <span style={{ color: '#e8e8ec', fontSize: 12 }}>{res.label}</span>
              </Popup>
            )}
          </Circle>
        ))}
      </MapContainer>

      {/* Round overlay */}
      {round > 0 && (
        <div className="absolute top-3 left-3 z-[1000] bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-white/10">
          <span className="text-[10px] uppercase tracking-widest text-ink-3">Phase {round}/5</span>
        </div>
      )}
    </div>
  );
}
