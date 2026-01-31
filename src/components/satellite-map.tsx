'use client';

import { APIProvider, Map } from '@vis.gl/react-google-maps';

// Location from image, approximately
const villageLocation = { lat: -1.48, lng: 103.58 };

const SatelliteMap = () => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (typeof window === 'undefined') {
    return <div className="h-full w-full bg-gray-800" />;
  }

  if (!apiKey) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-800">
        <div className="text-center text-white p-4 rounded-md bg-black/50">
          <p className="font-bold text-lg">Google Maps API Key is missing.</p>
          <p className="text-sm">Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your .env file.</p>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <Map
        center={villageLocation}
        zoom={12}
        mapId="desa_satellite_map"
        className="w-full h-full z-10"
        gestureHandling={'greedy'}
        disableDefaultUI={true}
        mapTypeId="satellite"
      >
      </Map>
    </APIProvider>
  );
};

export default SatelliteMap;
