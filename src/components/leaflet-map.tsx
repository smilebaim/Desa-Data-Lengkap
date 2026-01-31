'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon, LatLngExpression } from 'leaflet';
import { MapPin } from 'lucide-react';
import "leaflet/dist/leaflet.css"


// Custom marker icon to match default Leaflet look
const mapMarker = new Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    shadowSize: [41, 41]
});

// Center of Indonesia for initial view
const indonesiaCenter: LatLngExpression = [-2.5489, 118.0149];
// Location from image, approximately
const villageLocation: LatLngExpression = [-1.48, 103.58];

const LeafletMap = () => {
  return (
    <MapContainer 
        className="h-full w-full z-10"
        center={villageLocation} 
        zoom={12} 
        scrollWheelZoom={true} 
        zoomControl={false}
    >
      <TileLayer
        attribution='Leaflet | &copy; Google Satellite'
        url="https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}"
        subdomains={['mt0','mt1','mt2','mt3']}
        maxZoom={20}
      />
      <Marker position={villageLocation} icon={mapMarker}>
        <Popup>
            Desa Remau Bako Tuo
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default LeafletMap;
