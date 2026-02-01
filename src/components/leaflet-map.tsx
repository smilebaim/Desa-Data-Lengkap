'use client';

import { MapContainer, TileLayer } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import "leaflet/dist/leaflet.css"

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
    </MapContainer>
  );
};

export default LeafletMap;
