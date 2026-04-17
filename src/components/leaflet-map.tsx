
'use client';

import { MapContainer, TileLayer, Polygon, Marker, Tooltip as LeafletTooltip, Polyline, Circle, LayersControl, FeatureGroup } from 'react-leaflet';
import type { LatLngExpression, LatLngBoundsExpression } from 'leaflet';
import L from 'leaflet';
import "leaflet/dist/leaflet.css";
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { useMemo } from 'react';
import * as LucideIcons from 'lucide-react';
import { HelpCircle } from 'lucide-react';

if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
  });
}

interface LeafletMapProps {
  villages?: any[];
  showVillages?: boolean;
  onSelectVillage?: (id: string) => void;
  onSelectFeature?: (id: string) => void;
}

const LeafletMap = ({ villages = [], showVillages = true, onSelectVillage, onSelectFeature }: LeafletMapProps) => {
  const db = useFirestore();
  
  const featuresQuery = useMemo(() => query(collection(db, 'features'), orderBy('name', 'asc')), [db]);
  const { data: features } = useCollection(featuresQuery);

  const indonesiaBounds: LatLngBoundsExpression = [
    [-11.0, 94.0],
    [6.5, 141.5]
  ];

  const categories = useMemo(() => {
    const groups: Record<string, any[]> = {};
    features?.forEach(f => {
      const cat = f.category || 'LAINNYA';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(f);
    });
    return groups;
  }, [features]);

  const renderFeature = (f: any) => {
    if (!f.geometry) return null;
    const pos: LatLngExpression = [f.geometry.lat || 0, f.geometry.lng || 0];
    const eventHandlers = {
      click: () => onSelectFeature?.(f.id),
    };

    try {
      if (f.type === 'marker') return <Marker key={f.id} position={pos} eventHandlers={eventHandlers}><LeafletTooltip direction="top"><span className="font-bold text-[9px] uppercase">{f.name}</span></LeafletTooltip></Marker>;
      if (f.type === 'polyline') return <Polyline key={f.id} positions={f.geometry.map((p: any) => [p.lat, p.lng])} pathOptions={{ color: '#3b82f6', weight: 4 }} eventHandlers={eventHandlers} />;
      if (f.type === 'circle') return <Circle key={f.id} center={pos} radius={f.properties?.radius || 100} pathOptions={{ color: '#f59e0b', fillOpacity: 0.2 }} eventHandlers={eventHandlers} />;
      if (f.type === 'polygon' || f.type === 'rectangle') return <Polygon key={f.id} positions={f.geometry.map((p: any) => [p.lat, p.lng])} pathOptions={{ color: '#8b5cf6', fillOpacity: 0.2 }} eventHandlers={eventHandlers} />;
    } catch (e) {
      return null;
    }
    return null;
  };

  return (
    <MapContainer 
      className="h-full w-full z-10" 
      center={[-2.5489, 118.0149]} 
      zoom={5} 
      minZoom={5} 
      maxZoom={18}
      maxBounds={indonesiaBounds}
      maxBoundsViscosity={1.0}
      zoomControl={false}
    >
      <TileLayer 
        attribution='&copy; Google' 
        url="https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}" 
        subdomains={['mt0','mt1','mt2','mt3']} 
      />
      <LayersControl position="topright">
        {showVillages && (
          <LayersControl.Overlay checked name="Batas Administratif">
            <FeatureGroup>
              {(villages || []).map((village) => (
                <div key={village.id}>
                  {village.boundary && (
                    <Polygon 
                      positions={village.boundary.map((p: any) => [p.lat, p.lng])} 
                      pathOptions={{ color: '#22c55e', fillOpacity: 0.3 }}
                      eventHandlers={{ click: () => onSelectVillage?.(village.id) }}
                    />
                  )}
                  {village.location && (
                    <Marker 
                      position={[village.location.lat, village.location.lng]}
                      eventHandlers={{ click: () => onSelectVillage?.(village.id) }}
                    >
                      <LeafletTooltip direction="top"><span className="font-bold text-[10px] uppercase tracking-wider">{village.name}</span></LeafletTooltip>
                    </Marker>
                  )}
                </div>
              ))}
            </FeatureGroup>
          </LayersControl.Overlay>
        )}
        {Object.entries(categories).map(([catKey, catFeatures]) => (
          <LayersControl.Overlay checked key={catKey} name={catKey.replace('_', ' ').toUpperCase()}>
            <FeatureGroup>{catFeatures.map(f => renderFeature(f))}</FeatureGroup>
          </LayersControl.Overlay>
        ))}
      </LayersControl>
    </MapContainer>
  );
};

export default LeafletMap;
