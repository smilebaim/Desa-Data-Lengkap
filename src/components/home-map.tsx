'use client';

import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { MapPin } from 'lucide-react';

// Center of Indonesia for initial view
const indonesiaCenter = { lat: -2.5489, lng: 118.0149 };
// Location from image, approximately
const villageLocation = { lat: -1.48, lng: 103.58 };

const HomeMap = () => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-800 text-white">
        <div className="text-center">
          <p>Google Maps API Key is missing.</p>
          <p className="text-sm">Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your .env file.</p>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <Map
        className="h-full w-full"
        defaultCenter={indonesiaCenter}
        defaultZoom={5}
        gestureHandling={'greedy'}
        disableDefaultUI={true}
        mapTypeId='satellite'
      >
        <AdvancedMarker position={villageLocation}>
            <MapPin className="h-8 w-8 text-cyan-400 -translate-y-4" fill="currentColor" strokeWidth={1.5} stroke="white" />
        </AdvancedMarker>
      </Map>
    </APIProvider>
  );
};

export default HomeMap;
