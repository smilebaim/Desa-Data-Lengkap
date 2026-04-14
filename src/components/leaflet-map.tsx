
'use client';

import { MapContainer, TileLayer, Polygon, Marker, Popup, Tooltip as LeafletTooltip, Polyline, Circle, LayersControl, FeatureGroup } from 'react-leaflet';
import type { LatLngExpression, LatLngBoundsExpression } from 'leaflet';
import L from 'leaflet';
import "leaflet/dist/leaflet.css";
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { useMemo } from 'react';
import * as LucideIcons from 'lucide-react';
import { HelpCircle, ArrowRight, BarChart3, Users, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, 
  ResponsiveContainer, Cell, PieChart, Pie, LineChart, Line, AreaChart, Area
} from 'recharts';

const CHART_COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
  });
}

const DynamicIcon = ({ name, className }: { name: string, className?: string }) => {
  const IconComponent = (LucideIcons as any)[name];
  if (!IconComponent) return <HelpCircle className={className || "h-4 w-4"} />;
  return <IconComponent className={className || "h-4 w-4"} />;
};

const MiniChart = ({ config, data }: { config: any, data: any[] }) => {
  if (!config || !data.length) return null;
  const metric = config.metric || 'population';
  const type = config.chartType || 'bar';

  return (
    <div className="h-32 w-full mt-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
      <ResponsiveContainer width="100%" height="100%">
        {type === 'bar' ? (
          <BarChart data={data}>
            <Bar dataKey={metric} radius={[2, 2, 0, 0]}>
              {data.map((_, index) => <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
            </Bar>
          </BarChart>
        ) : type === 'pie' ? (
          <PieChart>
            <Pie data={data} dataKey={metric} nameKey="name" cx="50%" cy="50%" outerRadius={25}>
              {data.map((_, index) => <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
            </Pie>
          </PieChart>
        ) : (
          <LineChart data={data}>
            <Line type="monotone" dataKey={metric} stroke="#22c55e" strokeWidth={2} dot={false} />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

const LeafletMap = ({ villages = [], showVillages = true }: LeafletMapProps) => {
  const db = useFirestore();
  const { data: features } = useCollection(query(collection(db, 'features'), orderBy('name', 'asc')));
  const { data: visualizers } = useCollection(query(collection(db, 'visualizers')));

  const statsData = useMemo(() => {
    if (!villages) return [];
    return villages.map(v => ({
      name: v.name,
      population: v.population || 0,
      area: v.area || 0,
      density: v.area > 0 ? parseFloat(((v.population || 0) / v.area).toFixed(2)) : 0
    }));
  }, [villages]);

  const categories = useMemo(() => {
    const groups: Record<string, any[]> = {};
    features?.forEach(f => {
      if (!groups[f.category]) groups[f.category] = [];
      groups[f.category].push(f);
    });
    return groups;
  }, [features]);

  const renderContentWithCharts = (content: string) => {
    if (!content) return null;
    const parts = content.split(/(\[CHART:[a-zA-Z0-9_-]+\])/g);
    return parts.map((part, index) => {
      const match = part.match(/\[CHART:([a-zA-Z0-9_-]+)\]/);
      if (match) {
        const chartId = match[1];
        const config = visualizers?.find(v => v.id === chartId);
        return config ? <MiniChart key={index} config={config} data={statsData} /> : null;
      }
      return <span key={index}>{part}</span>;
    });
  };

  const renderFeature = (f: any) => {
    const popupContent = (
      <div className="p-1 min-w-[200px] max-w-[250px]">
        <div className="flex items-center gap-2 font-bold text-slate-900">
          <DynamicIcon name={f.icon || 'MapPin'} className="h-4 w-4 text-primary" />
          {f.name}
        </div>
        <div className="text-[9px] text-slate-400 uppercase font-black mt-1 mb-2 tracking-wider">
          {f.category?.replace('_', ' ') || 'ASET SPASIAL'}
        </div>
        <div className="text-[11px] text-slate-600 leading-relaxed">
          {renderContentWithCharts(f.description)}
        </div>
      </div>
    );

    const pos: LatLngExpression = [f.geometry.lat, f.geometry.lng];
    if (f.type === 'marker') return <Marker key={f.id} position={pos}><Popup>{popupContent}</Popup></Marker>;
    if (f.type === 'polyline') return <Polyline key={f.id} positions={f.geometry.map((p: any) => [p.lat, p.lng])} pathOptions={{ color: '#3b82f6', weight: 4 }}><Popup>{popupContent}</Popup></Polyline>;
    if (f.type === 'circle') return <Circle key={f.id} center={pos} radius={f.properties?.radius || 100} pathOptions={{ color: '#f59e0b', fillOpacity: 0.2 }}><Popup>{popupContent}</Popup></Circle>;
    if (f.type === 'polygon' || f.type === 'rectangle') return <Polygon key={f.id} positions={f.geometry.map((p: any) => [p.lat, p.lng])} pathOptions={{ color: '#8b5cf6', fillOpacity: 0.2 }}><Popup>{popupContent}</Popup></Polygon>;
    return null;
  };

  return (
    <MapContainer className="h-full w-full z-10" center={[-2.5489, 118.0149]} zoom={5} minZoom={5} zoomControl={false}>
      <TileLayer attribution='&copy; Google' url="https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}" subdomains={['mt0','mt1','mt2','mt3']} />
      <LayersControl position="topright">
        {showVillages && (
          <LayersControl.Overlay checked name="Batas Desa">
            <FeatureGroup>
              {villages.map((village) => (
                <div key={village.id}>
                  {village.boundary && (
                    <Polygon positions={village.boundary.map((p: any) => [p.lat, p.lng])} pathOptions={{ color: '#22c55e', fillOpacity: 0.3 }}>
                      <Popup>
                        <div className="p-1 min-w-[200px]">
                          <h3 className="font-bold text-slate-900">{village.name}</h3>
                          <p className="text-[10px] text-primary font-bold uppercase">{village.province}</p>
                          <Link href={`/village/${village.id}`} className="block mt-4">
                            <Button size="sm" className="w-full text-[10px] h-8 bg-primary">PROFIL DESA</Button>
                          </Link>
                        </div>
                      </Popup>
                    </Polygon>
                  )}
                  <Marker position={[village.location.lat, village.location.lng]}>
                    <LeafletTooltip direction="top"><span className="font-bold text-[10px]">{village.name}</span></LeafletTooltip>
                  </Marker>
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
