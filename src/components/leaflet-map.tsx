'use client';

import { MapContainer, TileLayer, Polygon, Marker, Popup, Tooltip as LeafletTooltip } from 'react-leaflet';
import type { LatLngExpression, LatLngBoundsExpression } from 'leaflet';
import L from 'leaflet';
import "leaflet/dist/leaflet.css";

// Fix for default Leaflet icons
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
  });
}

// Center of Indonesia
const indonesiaCenter: LatLngExpression = [-2.5489, 118.0149];
// Bounding box for Indonesia
const indonesiaBounds: LatLngBoundsExpression = [
    [6.0769, 95.0108], // North-West
    [-11.0058, 141.0194] // South-East
];

interface LeafletMapProps {
  villages?: any[];
  showVillages?: boolean;
}

const LeafletMap = ({ villages = [], showVillages = true }: LeafletMapProps) => {
  return (
    <MapContainer 
        key="main-map"
        className="h-full w-full z-10"
        center={indonesiaCenter} 
        zoom={5}
        minZoom={5}
        maxBounds={indonesiaBounds}
        maxBoundsViscosity={1.0}
        scrollWheelZoom={true} 
        zoomControl={false}
    >
      <TileLayer
        attribution='&copy; Google Satellite'
        url="https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}"
        subdomains={['mt0','mt1','mt2','mt3']}
        maxZoom={20}
      />

      {showVillages && villages.map((village) => {
        if (!village.location) return null;
        
        const center: LatLngExpression = [village.location.lat, village.location.lng];
        const hasBoundary = village.boundary && village.boundary.length > 0;
        const polygonPath = hasBoundary ? village.boundary.map((p: any) => [p.lat, p.lng]) : [];

        return (
          <div key={village.id}>
            {hasBoundary && (
              <Polygon 
                positions={polygonPath}
                pathOptions={{ 
                  color: '#22c55e', 
                  fillColor: '#22c55e', 
                  fillOpacity: 0.3,
                  weight: 2 
                }}
              >
                <Popup>
                  <div className="p-1">
                    <h3 className="font-bold text-slate-900">{village.name}</h3>
                    <p className="text-[10px] text-slate-500 uppercase font-bold">{village.province}</p>
                    <div className="mt-2 text-xs border-t pt-2">
                      <p>Populasi: <b>{village.population?.toLocaleString()}</b> jiwa</p>
                    </div>
                  </div>
                </Popup>
              </Polygon>
            )}
            
            <Marker position={center}>
              <LeafletTooltip direction="top" offset={[0, -10]} opacity={1} permanent={false}>
                <span className="font-bold text-[10px]">{village.name}</span>
              </LeafletTooltip>
            </Marker>
          </div>
        );
      })}
    </MapContainer>
  );
};

export default LeafletMap;
