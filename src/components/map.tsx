'use client';

import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import type { Village } from '@/lib/types';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mountain } from 'lucide-react';

interface MapProps {
  villages: Village[];
}

// Center of Indonesia
const defaultCenter = { lat: -2.5489, lng: 118.0149 };

export function VillageMap({ villages }: MapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-lg border border-dashed bg-muted">
        <div className="text-center text-muted-foreground">
          <p>Google Maps API Key is missing.</p>
          <p className="text-sm">Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your .env.local file.</p>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <Map
        defaultCenter={defaultCenter}
        defaultZoom={5}
        mapId="desa_data_connest_map"
        className="w-full h-full rounded-lg"
        gestureHandling={'greedy'}
        disableDefaultUI={true}
      >
        {villages.map((village) => (
          <AdvancedMarker
            key={village.id}
            position={{ lat: village.lat, lng: village.lng }}
            title={village.name}
          >
            <div className="group relative">
                <Mountain className="h-6 w-6 text-primary transition-transform group-hover:scale-125" />
            </div>
          </AdvancedMarker>
        ))}
      </Map>
    </APIProvider>
  );
}
