
'use client';

import { MapContainer, TileLayer, Polygon, Marker, Tooltip as LeafletTooltip, Polyline, Circle, FeatureGroup } from 'react-leaflet';
import type { LatLngExpression, LatLngBoundsExpression } from 'leaflet';
import L from 'leaflet';
import "leaflet/dist/leaflet.css";
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { useMemo, Fragment, useEffect, useState } from 'react';

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
  activeCategories?: string[];
  onSelectVillage?: (id: string) => void;
  onSelectFeature?: (id: string) => void;
}

const LeafletMap = ({ 
  villages = [], 
  showVillages = true, 
  activeCategories = [],
  onSelectVillage, 
  onSelectFeature 
}: LeafletMapProps) => {
  const db = useFirestore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const featuresQuery = useMemo(() => query(collection(db, 'features'), orderBy('name', 'asc')), [db]);
  const { data: features } = useCollection(featuresQuery);

  const indonesiaBounds: LatLngBoundsExpression = [[-11.0, 94.0], [6.5, 141.5]];

  const filteredFeatures = useMemo(() => {
    if (!features) return [];
    return features.filter(f => activeCategories.includes(f.category || ''));
  }, [features, activeCategories]);

  const renderFeature = (f: any) => {
    if (!f.geometry) return null;
    const pos: LatLngExpression = [f.geometry.lat || 0, f.geometry.lng || 0];
    const eventHandlers = { click: () => onSelectFeature?.(f.id) };

    try {
      if (f.type === 'marker') {
        return (
          <Marker key={f.id} position={pos} eventHandlers={eventHandlers}>
            <LeafletTooltip direction="top"><span className="font-bold text-[9px] uppercase">{f.name}</span></LeafletTooltip>
          </Marker>
        );
      }
      if (f.type === 'polyline' && Array.isArray(f.geometry)) {
        return (
          <Polyline key={f.id} positions={f.geometry.map((p: any) => [p.lat, p.lng])} pathOptions={{ color: '#3b82f6', weight: 4 }} eventHandlers={eventHandlers} />
        );
      }
      if (f.type === 'circle') {
        return (
          <Circle key={f.id} center={pos} radius={f.properties?.radius || 100} pathOptions={{ color: '#f59e0b', fillOpacity: 0.2 }} eventHandlers={eventHandlers} />
        );
      }
      if ((f.type === 'polygon' || f.type === 'rectangle') && Array.isArray(f.geometry)) {
        return (
          <Polygon key={f.id} positions={f.geometry.map((p: any) => [p.lat, p.lng])} pathOptions={{ color: '#8b5cf6', fillOpacity: 0.2 }} eventHandlers={eventHandlers} />
        );
      }
    } catch (e) {
      return null;
    }
    return null;
  };

  if (!isMounted) return null;

  return (
    <div className="h-full w-full">
      <MapContainer 
        key="main-map-container"
        className="h-full w-full z-10" 
        center={[-2.5489, 118.0149]} 
        zoom={5} 
        minZoom={5} 
        maxBounds={indonesiaBounds} 
        zoomControl={false}
        scrollWheelZoom={true}
      >
        <TileLayer 
          attribution='&copy; Google Satellite'
          url="https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}" 
          subdomains={['mt0','mt1','mt2','mt3']} 
        />
        
        {showVillages && (
          <FeatureGroup>
            {(villages || []).map((v) => (
              <Fragment key={`v-${v.id}`}>
                {v.boundary && Array.isArray(v.boundary) && (
                  <Polygon 
                    positions={v.boundary.map((p: any) => [p.lat, p.lng])} 
                    pathOptions={{ color: '#22c55e', fillOpacity: 0.3, weight: 2 }} 
                    eventHandlers={{ click: () => onSelectVillage?.(v.id) }} 
                  />
                )}
                {v.location && (
                  <Marker position={[v.location.lat, v.location.lng]} eventHandlers={{ click: () => onSelectVillage?.(v.id) }}>
                    <LeafletTooltip direction="top"><span className="font-bold text-[10px] uppercase">{v.name}</span></LeafletTooltip>
                  </Marker>
                )}
              </Fragment>
            ))}
          </FeatureGroup>
        )}

        <FeatureGroup>
          {filteredFeatures.map(f => (
            <Fragment key={`f-${f.id}`}>
              {renderFeature(f)}
            </Fragment>
          ))}
        </FeatureGroup>
      </MapContainer>
    </div>
  );
};

export default LeafletMap;
