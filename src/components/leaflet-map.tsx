
'use client';

import { MapContainer, TileLayer, Polygon, Marker, Popup, Tooltip as LeafletTooltip, Polyline, Circle, LayersControl, FeatureGroup } from 'react-leaflet';
import type { LatLngExpression, LatLngBoundsExpression } from 'leaflet';
import L from 'leaflet';
import "leaflet/dist/leaflet.css";
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { useMemo } from 'react';
import * as LucideIcons from 'lucide-react';
import { HelpCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
  });
}

const DynamicIcon = ({ name }: { name: string }) => {
  const IconComponent = (LucideIcons as any)[name];
  if (!IconComponent) return <HelpCircle className="h-4 w-4" />;
  return <IconComponent className="h-4 w-4" />;
};

const indonesiaCenter: LatLngExpression = [-2.5489, 118.0149];
const indonesiaBounds: LatLngBoundsExpression = [
    [6.0769, 95.0108],
    [-11.0058, 141.0194]
];

interface LeafletMapProps {
  villages?: any[];
  showVillages?: boolean;
}

const LeafletMap = ({ villages = [], showVillages = true }: LeafletMapProps) => {
  const db = useFirestore();
  
  const featureQuery = useMemo(() => {
    if (!db) return null;
    return query(collection(db, 'features'), orderBy('name', 'asc'));
  }, [db]);
  
  const { data: features } = useCollection(featureQuery);

  const categories = useMemo(() => {
    const groups: Record<string, any[]> = {};
    features?.forEach(f => {
      if (!groups[f.category]) groups[f.category] = [];
      groups[f.category].push(f);
    });
    return groups;
  }, [features]);

  const renderFeature = (f: any) => {
    if (f.type === 'marker') {
      return (
        <Marker key={f.id} position={[f.geometry.lat, f.geometry.lng]}>
          <Popup>
            <div className="p-1 min-w-[150px]">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <DynamicIcon name={f.icon || 'MapPin'} />
                {f.name}
              </div>
              <div className="text-[10px] text-slate-500 uppercase font-black mt-1 mb-2">
                {f.category?.replace('_', ' ') || 'ASET'}
              </div>
              {f.description && <p className="text-[11px] text-slate-600 mb-2">{f.description}</p>}
            </div>
          </Popup>
        </Marker>
      );
    }
    if (f.type === 'polyline') {
      return (
        <Polyline 
          key={f.id} 
          positions={f.geometry.map((p: any) => [p.lat, p.lng])}
          pathOptions={{ color: '#3b82f6', weight: 4 }}
        >
          <Popup className="font-bold">{f.name}</Popup>
        </Polyline>
      );
    }
    if (f.type === 'circle') {
      return (
        <Circle 
          key={f.id} 
          center={[f.geometry.lat, f.geometry.lng]}
          radius={f.properties?.radius || 100}
          pathOptions={{ color: '#f59e0b', fillColor: '#f59e0b', fillOpacity: 0.2 }}
        >
          <Popup>
            <div className="font-bold">{f.name}</div>
            <div className="text-xs">Radius: {Math.round(f.properties?.radius || 0)}m</div>
          </Popup>
        </Circle>
      );
    }
    if (f.type === 'polygon' || f.type === 'rectangle') {
       return (
        <Polygon 
          key={f.id} 
          positions={f.geometry.map((p: any) => [p.lat, p.lng])}
          pathOptions={{ color: '#8b5cf6', fillOpacity: 0.2 }}
        >
          <Popup>
            <div className="font-bold">{f.name}</div>
            <div className="text-xs">Luas: {f.properties?.area || 0} km²</div>
          </Popup>
        </Polygon>
      );
    }
    return null;
  };

  return (
    <MapContainer 
        key="main-map"
        className="h-full w-full z-10"
        center={indonesiaCenter} 
        zoom={5}
        minZoom={5}
        maxBounds={indonesiaBounds}
        maxBoundsViscosity={1.0}
        zoomControl={false}
    >
      <TileLayer
        attribution='&copy; Google Satellite'
        url="https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}"
        subdomains={['mt0','mt1','mt2','mt3']}
      />

      <LayersControl position="topright">
        {showVillages && (
          <LayersControl.Overlay checked name="Batas Desa">
            <FeatureGroup>
              {villages.map((village) => {
                if (!village.location) return null;
                const center: LatLngExpression = [village.location.lat, village.location.lng];
                const hasBoundary = village.boundary && village.boundary.length > 0;
                const polygonPath = hasBoundary ? village.boundary.map((p: any) => [p.lat, p.lng]) : [];

                return (
                  <div key={village.id}>
                    {hasBoundary && (
                      <Polygon 
                        positions={polygonPath}
                        pathOptions={{ color: '#22c55e', fillOpacity: 0.3, weight: 2 }}
                      >
                        <Popup>
                          <div className="p-1 min-w-[200px]">
                            <h3 className="font-bold text-slate-900 text-lg">{village.name}</h3>
                            <p className="text-[10px] text-primary font-bold uppercase tracking-widest">{village.province}</p>
                            <div className="mt-3 text-xs border-t pt-3 space-y-2">
                              <div className="flex justify-between">
                                <span className="text-slate-500">Populasi:</span>
                                <b className="text-slate-900">{village.population?.toLocaleString() || 0} jiwa</b>
                              </div>
                              {village.tagline && (
                                <p className="italic text-slate-500 text-[11px]">"{village.tagline}"</p>
                              )}
                              <Link href={`/village/${village.id}`} className="block mt-2">
                                <Button size="sm" className="w-full h-8 text-[10px] font-bold bg-primary hover:bg-primary/90">
                                  LIHAT PROFIL DESA <ArrowRight className="ml-2 h-3 w-3" />
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </Popup>
                      </Polygon>
                    )}
                    <Marker position={center}>
                      <LeafletTooltip direction="top" offset={[0, -10]} opacity={1}>
                        <span className="font-bold text-[10px]">{village.name}</span>
                      </LeafletTooltip>
                    </Marker>
                  </div>
                );
              })}
            </FeatureGroup>
          </LayersControl.Overlay>
        )}

        {Object.entries(categories).map(([catKey, catFeatures]) => (
          <LayersControl.Overlay checked key={catKey} name={catKey.replace('_', ' ').toUpperCase()}>
            <FeatureGroup>
              {catFeatures.map(f => renderFeature(f))}
            </FeatureGroup>
          </LayersControl.Overlay>
        ))}
      </LayersControl>
    </MapContainer>
  );
};

export default LeafletMap;
