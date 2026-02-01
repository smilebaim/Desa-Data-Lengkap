'use client';

import { MapContainer, TileLayer } from 'react-leaflet';
import type { LatLngExpression, LatLngBoundsExpression } from 'leaflet';
import "leaflet/dist/leaflet.css"

// Center of Indonesia
const indonesiaCenter: LatLngExpression = [-2.5489, 118.0149];
// Bounding box for Indonesia
const indonesiaBounds: LatLngBoundsExpression = [
    [6.0769, 95.0108], // North-West
    [-11.0058, 141.0194] // South-East
];

const LeafletMap = () => {
  return (
    <MapContainer 
        className="h-full w-full z-10"
        center={indonesiaCenter} 
        zoom={5}
        minZoom={5}
        maxBounds={indonesiaBounds}
        maxBoundsViscosity={1.0}
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
