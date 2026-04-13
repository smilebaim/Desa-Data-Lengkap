'use client';

import { MapContainer, TileLayer, FeatureGroup, LayersControl } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import L from 'leaflet';
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

// Fix for default Leaflet icons in Next.js
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
  });
}

interface MapEditorProps {
  onDrawCreated: (data: { boundary: { lat: number, lng: number }[], center: { lat: number, lng: number }, area: number }) => void;
}

const MapEditor = ({ onDrawCreated }: MapEditorProps) => {
  const indonesiaCenter: [number, number] = [-2.5489, 118.0149];

  const calculateArea = (latlngs: L.LatLng[]) => {
    // Formula dasar untuk menghitung luas poligon di permukaan bola (dalam meter persegi)
    return L.GeometryUtil.geodesicArea(latlngs) / 1000000; // Konversi ke km2
  };

  const _onCreated = (e: any) => {
    const { layerType, layer } = e;
    
    if (layerType === 'polygon') {
      const latlngs = layer.getLatLngs()[0];
      const boundary = latlngs.map((ll: L.LatLng) => ({ lat: ll.lat, lng: ll.lng }));
      const center = layer.getBounds().getCenter();
      const area = calculateArea(latlngs);
      
      onDrawCreated({
        boundary,
        center: { lat: center.lat, lng: center.lng },
        area: parseFloat(area.toFixed(2))
      });
    } else if (layerType === 'marker') {
      const latlng = layer.getLatLng();
      onDrawCreated({
        boundary: [], 
        center: { lat: latlng.lat, lng: latlng.lng },
        area: 0
      });
    }
  };

  return (
    <div className="h-[500px] w-full rounded-b-xl overflow-hidden z-10 border-t border-slate-200">
      <MapContainer 
        center={indonesiaCenter} 
        zoom={5} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Satelit (Google)">
            <TileLayer
              attribution='&copy; Google Satellite'
              url="https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}"
              subdomains={['mt0','mt1','mt2','mt3']}
              maxZoom={20}
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Jalan (OpenStreetMap)">
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Terrain (Google)">
            <TileLayer
              attribution='&copy; Google Terrain'
              url="https://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}"
              subdomains={['mt0','mt1','mt2','mt3']}
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        <FeatureGroup>
          <EditControl
            position="topleft"
            onCreated={_onCreated}
            draw={{
              rectangle: false,
              circle: false,
              circlemarker: false,
              marker: {
                icon: new L.Icon.Default()
              },
              polyline: false,
              polygon: {
                allowIntersection: false,
                drawError: {
                  color: '#ef4444',
                  message: '<strong>Galat:</strong> Batas wilayah tidak boleh berpotongan!'
                },
                shapeOptions: {
                  color: '#22c55e',
                  fillOpacity: 0.3,
                  weight: 2
                },
                showArea: true
              }
            }}
            edit={{
              remove: true,
              edit: true
            }}
          />
        </FeatureGroup>
      </MapContainer>
    </div>
  );
};

export default MapEditor;