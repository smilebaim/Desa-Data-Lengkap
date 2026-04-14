
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
    <div className="h-40 w-full mt-3 bg-slate-50 p-3 rounded-xl border border-slate-100 shadow-inner">
      <p className="text-[8px] font-black uppercase text-slate-400 mb-2 tracking-widest">{config.title}</p>
      <ResponsiveContainer width="100%" height="100%">
        {type === 'bar' ? (
          <BarChart data={data}>
            <Bar dataKey={metric} radius={[2, 2, 0, 0]}>
              {data.map((_, index) => <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
            </Bar>
          </BarChart>
        ) : type === 'pie' ? (
          <PieChart>
            <Pie data={data} dataKey={metric} nameKey="name" cx="50%" cy="50%" outerRadius={30}>
              {data.map((_, index) => <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
            </Pie>
          </PieChart>
        ) : type === 'area' ? (
          <AreaChart data={data}>
            <Area type="monotone" dataKey={metric} stroke="#22c55e" fill="#22c55e" fillOpacity={0.2} />
          </AreaChart>
        ) : (
          <LineChart data={data}>
            <Line type="monotone" dataKey={metric} stroke="#22c55e" strokeWidth={2} dot={false} />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

interface LeafletMapProps {
  villages?: any[];
  showVillages?: boolean;
}

const LeafletMap = ({ villages = [], showVillages = true }: LeafletMapProps) => {
  const db = useFirestore();
  
  // Memoize data requirements
  const featuresQuery = useMemo(() => query(collection(db, 'features'), orderBy('name', 'asc')), [db]);
  const { data: features } = useCollection(featuresQuery);

  const visualizersQuery = useMemo(() => query(collection(db, 'visualizers')), [db]);
  const { data: visualizers } = useCollection(visualizersQuery);

  // Define Indonesia Bounds: [SouthWest, NorthEast]
  const indonesiaBounds: LatLngBoundsExpression = [
    [-11.0, 95.0], // Sabang/Rote area
    [6.0, 141.0]   // Merauke/Natuna area
  ];

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
      const cat = f.category || 'LAINNYA';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(f);
    });
    return groups;
  }, [features]);

  // Detector and renderer for content with [CHART:ID] support
  const renderTextWithCharts = (content: string) => {
    if (!content) return null;
    const regex = /(\[CHART:[a-zA-Z0-9_-]+\])/g;
    const parts = content.split(regex);
    
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
      <div className="p-1 min-w-[220px] max-w-[280px]">
        <div className="flex items-center gap-2 font-bold text-slate-900 border-b pb-2 mb-2">
          <div className="h-7 w-7 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
            <DynamicIcon name={f.icon || 'MapPin'} className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs leading-none">{f.name}</p>
            <p className="text-[8px] text-slate-400 font-black uppercase mt-1 tracking-widest">{f.category?.replace('_', ' ')}</p>
          </div>
        </div>
        <div className="text-[11px] text-slate-600 leading-relaxed whitespace-pre-line">
          {renderTextWithCharts(f.description)}
        </div>
        {f.showStats && (
           <div className="mt-4 pt-3 border-t border-dashed border-slate-200">
             <div className="flex items-center gap-2 mb-2 text-[9px] font-bold text-primary">
               <BarChart3 className="h-3 w-3" /> RINGKASAN DATA JARINGAN
             </div>
             <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 p-2 rounded-lg border">
                  <p className="text-[7px] font-black text-slate-400 uppercase mb-0.5">Populasi</p>
                  <p className="text-[10px] font-bold text-slate-700">{statsData.reduce((a,b) => a + b.population, 0).toLocaleString()} Jiwa</p>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg border">
                  <p className="text-[7px] font-black text-slate-400 uppercase mb-0.5">Wilayah</p>
                  <p className="text-[10px] font-bold text-slate-700">{statsData.reduce((a,b) => a + b.area, 0).toFixed(1)} km²</p>
                </div>
             </div>
           </div>
        )}
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
