'use client';

import { useEffect, useRef, useState } from 'react';
import { StravaActivity } from '@/types/strava';

interface RunMapViewProps {
  activities: StravaActivity[];
}

export function RunMapView({ activities }: RunMapViewProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !mapContainerRef.current) return;

    // Dynamically import Leaflet only on the client side
    import('leaflet').then((L) => {
      // Dynamically add Leaflet CSS
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
        link.crossOrigin = '';
        document.head.appendChild(link);
      }

      // Fix Leaflet default icon path issue with bundlers
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      // Filter activities that have location data
      const activitiesWithLocation = activities.filter(
        activity => activity.start_latlng && activity.start_latlng.length === 2
      );

      if (activitiesWithLocation.length === 0) return;

      // Initialize map if not already created
      if (!mapRef.current && mapContainerRef.current) {
        mapRef.current = L.map(mapContainerRef.current, {
          zoomControl: true,
          scrollWheelZoom: true,
        });

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(mapRef.current);
      }

      const map = mapRef.current;
      if (!map) return;

      // Clear existing markers
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      map.eachLayer((layer: any) => {
        if (layer instanceof L.Marker) {
          map.removeLayer(layer);
        }
      });

      // Create custom icon
      const runIcon = L.divIcon({
        className: 'custom-run-marker',
        html: '<div style="background-color: rgb(59, 130, 246); width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });

      // Add markers for each run
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const markers: any[] = [];
      activitiesWithLocation.forEach((activity) => {
        const [lat, lng] = activity.start_latlng;

        const marker = L.marker([lat, lng], { icon: runIcon })
          .bindPopup(`
            <div style="min-width: 150px;">
              <strong>${activity.name || 'Run'}</strong><br/>
              <small>${new Date(activity.start_date).toLocaleDateString()}</small><br/>
              ${(activity.distance / 1609.34).toFixed(2)} mi<br/>
              ${Math.floor(activity.moving_time / 60)} min
            </div>
          `)
          .addTo(map);

        markers.push(marker);
      });

      // Fit map to show all markers
      if (markers.length > 0) {
        const group = L.featureGroup(markers);
        map.fitBounds(group.getBounds(), { padding: [20, 20] });
      }
    });

    // Cleanup function
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [activities, isClient]);

  // Check if any activities have location data
  const hasLocationData = activities.some(
    activity => activity.start_latlng && activity.start_latlng.length === 2
  );

  if (!hasLocationData) {
    return (
      <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <div className="mb-2">No location data available</div>
          <div className="text-xs">Activities need GPS data to show on map</div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mapContainerRef}
      className="h-64 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
      style={{ zIndex: 0 }}
    />
  );
}
