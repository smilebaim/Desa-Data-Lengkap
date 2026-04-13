
'use client';

import { MapContainer, TileLayer, FeatureGroup, LayersControl } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import L from 'leaflet';
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
  });
}

interface MapEditorProps {
  onDrawCreated: (payload: { 
    type: string, 
    geometry: any, 
    properties: { area?: number, length?: number, radius?: number } 
  }) => void;
}

const MapEditor = ({ onDrawCreated }: MapEditorProps) => {
  const indonesiaCenter: [number, number] = [-2.5489, 118.0149];

  const _onCreated = (e: any) => {
    const { layerType, layer } = e;
    
    let payload: any = { type: layerType, properties: {} };

    if (layerType === 'polygon') {
      const latlngs = layer.getLatLngs()[0];
      payload.geometry = latlngs.map((ll: L.LatLng) => ({ lat: ll.lat, lng: ll.lng }));
      payload.properties.area = parseFloat((L.GeometryUtil.geodesicArea(latlngs) / 1000000).toFixed(2));
    } else if (layerType === 'marker') {
      const ll = layer.getLatLng();
      payload.geometry = { lat: ll.lat, lng: ll.lng };
    } else if (layerType === 'polyline') {
      const latlngs = layer.getLatLngs();
      payload.geometry = latlngs.map((ll: L.LatLng) => ({ lat: ll.lat, lng: ll.lng }));
    } else if (layerType === 'circle') {
      const ll = layer.getLatLng();
      payload.geometry = { lat: ll.lat, lng: ll.lng };
      payload.properties.radius = layer.getRadius();
    } else if (layerType === 'rectangle') {
      const latlngs = layer.getLatLngs()[0];
      payload.geometry = latlngs.map((ll: L.LatLng) => ({ lat: ll.lat, lng: ll.lng }));
    }

    onDrawCreated(payload);
  };

  return (
    <div className="h-[500px] w-full rounded-b-xl overflow-hidden z-10 border-t border-slate-200">
      <MapContainer 
        center={indonesiaCenter} 
        zoom={5} 
        style={{ height: '100%', width: '100%' }}
      >
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Satelit (Google)">
            <TileLayer
              attribution='&copy; Google Satellite'
              url="https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}"
              subdomains={['mt0','mt1','mt2','mt3']}
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Street Map">
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        <FeatureGroup>
          <EditControl
            position="topleft"
            onCreated={_onCreated}
            draw={{
              polyline: {
                shapeOptions: { color: '#3b82f6', weight: 4 }
              },
              polygon: {
                allowIntersection: false,
                shapeOptions: { color: '#22c55e', fillOpacity: 0.3 }
              },
              circle: {
                shapeOptions: { color: '#f59e0b' }
              },
              rectangle: {
                shapeOptions: { color: '#8b5cf6' }
              },
              marker: true,
              circlemarker: false
            }}
          />
        </FeatureGroup>
      </MapContainer>
    </div>
  );
};

export default MapEditor;
