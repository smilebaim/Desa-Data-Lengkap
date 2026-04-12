
'use client';

import { MapContainer, TileLayer, FeatureGroup } from 'react-leaflet';
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
  onDrawCreated: (data: { boundary: { lat: number, lng: number }[], center: { lat: number, lng: number } }) => void;
}

const MapEditor = ({ onDrawCreated }: MapEditorProps) => {
  const indonesiaCenter: [number, number] = [-2.5489, 118.0149];

  const _onCreated = (e: any) => {
    const { layerType, layer } = e;
    if (layerType === 'polygon') {
      const latlngs = layer.getLatLngs()[0];
      const boundary = latlngs.map((ll: L.LatLng) => ({ lat: ll.lat, lng: ll.lng }));
      const center = layer.getBounds().getCenter();
      
      onDrawCreated({
        boundary,
        center: { lat: center.lat, lng: center.lng }
      });
    }
  };

  return (
    <div className="h-[500px] w-full rounded-b-xl overflow-hidden z-10">
      <MapContainer 
        center={indonesiaCenter} 
        zoom={5} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; Google Satellite'
          url="https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}"
          subdomains={['mt0','mt1','mt2','mt3']}
          maxZoom={20}
        />
        <FeatureGroup>
          <EditControl
            position="topleft"
            onCreated={_onCreated}
            draw={{
              rectangle: false,
              circle: false,
              circlemarker: false,
              marker: true,
              polyline: false,
              polygon: {
                allowIntersection: false,
                drawError: {
                  color: '#e1e100',
                  message: '<strong>Galat:</strong> Batas tidak boleh berpotongan!'
                },
                shapeOptions: {
                  color: '#22c55e',
                  fillOpacity: 0.3
                }
              }
            }}
          />
        </FeatureGroup>
      </MapContainer>
    </div>
  );
};

export default MapEditor;
