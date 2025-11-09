import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import esterPhoto from 'figma:asset/979ef55846c1aa971e8d16a4daf15d3d9ec33cf2.png';

export interface SafeZone {
  id: string;
  name: string;
  center: [number, number]; // [lat, lng]
  radius: number; // meters
  color?: string;
}

interface MapProps {
  center: [number, number];
  zoom?: number;
  className?: string;
  onClick?: (lat: number, lng: number) => void;
  safeZones?: SafeZone[];
  previewSafeZone?: { center: [number, number]; radius: number } | null;
}

export interface MapRef {
  recenter: () => void;
  getCenter: () => [number, number]; // Returns current map center as [lat, lng]
  flyTo: (center: [number, number], zoom?: number) => void; // Animate to new location
}

// Maptiler API Key
const MAPTILER_API_KEY = 'NBG4jfeqgblK0EpbS7Jp';

const getMapStyle = () => {
  if (MAPTILER_API_KEY && MAPTILER_API_KEY !== 'YOUR_MAPTILER_API_KEY') {
    return `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_API_KEY}`;
  } else {
    return {
      version: 8,
      sources: {
        'carto-light': {
          type: 'raster',
          tiles: [
            'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
            'https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
            'https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
          ],
          tileSize: 256,
          attribution: '© OpenStreetMap contributors © CARTO',
        },
      },
      layers: [
        {
          id: 'carto-light-layer',
          type: 'raster',
          source: 'carto-light',
          minzoom: 0,
          maxzoom: 22,
        },
      ],
    };
  }
};

// Helper: Create GeoJSON circle from center point and radius in meters
function createGeoJSONCircle(center: [number, number], radiusInMeters: number, points: number = 64) {
  const coords = {
    latitude: center[0],
    longitude: center[1],
  };

  const km = radiusInMeters / 1000;
  const ret = [];
  const distanceX = km / (111.32 * Math.cos((coords.latitude * Math.PI) / 180));
  const distanceY = km / 110.574;

  for (let i = 0; i < points; i++) {
    const theta = (i / points) * (2 * Math.PI);
    const x = distanceX * Math.cos(theta);
    const y = distanceY * Math.sin(theta);
    ret.push([coords.longitude + x, coords.latitude + y]);
  }
  ret.push(ret[0]);

  return {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [ret],
    },
  };
}

export const Map = forwardRef<MapRef, MapProps>(
  ({ center, zoom = 15, className = '', onClick, safeZones = [], previewSafeZone }, ref) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<maplibregl.Map | null>(null);

    useEffect(() => {
      if (map.current || !mapContainer.current) return;

      const getColor = (varName: string) => {
        const value = getComputedStyle(document.documentElement)
          .getPropertyValue(varName)
          .trim();
        return value;
      };

      const primaryColor = getColor('--primary');

      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: getMapStyle(),
        center: [center[1], center[0]],
        zoom: zoom,
        attributionControl: false,
      });

      map.current.on('styleimagemissing', (e) => {
        const id = e.id;
        if (!map.current?.hasImage(id)) {
          const size = 64;
          const data = new Uint8Array(size * size * 4);
          map.current?.addImage(id, {
            width: size,
            height: size,
            data: data,
          });
        }
      });

      map.current.on('load', () => {
        if (!map.current) return;

        if (onClick) {
          map.current.on('click', (e) => {
            const { lng, lat } = e.lngLat;
            onClick(lat, lng);
          });
        }

        // Add Ester's marker with photo
        const esterMarker = document.createElement('div');
        esterMarker.style.width = '51px';
        esterMarker.style.height = '51px';
        esterMarker.style.borderRadius = '50%';
        esterMarker.style.border = '3px solid white';
        esterMarker.style.boxShadow = '0 4px 12px rgba(0,0,0,0.25)';
        esterMarker.style.overflow = 'hidden';
        esterMarker.style.backgroundImage = `url(${esterPhoto})`;
        esterMarker.style.backgroundSize = 'cover';
        esterMarker.style.backgroundPosition = 'center';
        esterMarker.style.cursor = 'pointer';

        new maplibregl.Marker({ element: esterMarker })
          .setLngLat([center[1], center[0]])
          .addTo(map.current!);
      });

      return () => {
        map.current?.remove();
        map.current = null;
      };
    }, []);

    // Update safe zones when they change
    useEffect(() => {
      if (!map.current || !map.current.loaded()) return;

      const getColor = (varName: string) => {
        const value = getComputedStyle(document.documentElement)
          .getPropertyValue(varName)
          .trim();
        return value;
      };

      const chart2Color = getColor('--chart-2');

      // Remove old safe zone layers
      const layers = map.current.getStyle().layers;
      layers?.forEach((layer) => {
        if (layer.id.startsWith('safe-zone-fill-') || layer.id.startsWith('safe-zone-outline-')) {
          map.current?.removeLayer(layer.id);
        }
      });

      // Remove old safe zone sources
      const sources = Object.keys(map.current.getStyle().sources || {});
      sources.forEach((sourceId) => {
        if (sourceId.startsWith('safe-zone-')) {
          map.current?.removeSource(sourceId);
        }
      });

      // Add new safe zones
      safeZones.forEach((zone) => {
        const circleGeoJSON = createGeoJSONCircle(zone.center, zone.radius);

        map.current?.addSource(`safe-zone-${zone.id}`, {
          type: 'geojson',
          data: circleGeoJSON as any,
        });

        // Fill layer
        map.current?.addLayer({
          id: `safe-zone-fill-${zone.id}`,
          type: 'fill',
          source: `safe-zone-${zone.id}`,
          paint: {
            'fill-color': zone.color || chart2Color,
            'fill-opacity': 0.2,
          },
        });

        // Outline layer
        map.current?.addLayer({
          id: `safe-zone-outline-${zone.id}`,
          type: 'line',
          source: `safe-zone-${zone.id}`,
          paint: {
            'line-color': zone.color || chart2Color,
            'line-width': 2,
            'line-opacity': 0.8,
          },
        });
      });
    }, [safeZones]);

    // Update preview safe zone
    useEffect(() => {
      if (!map.current || !map.current.loaded()) return;

      const getColor = (varName: string) => {
        const value = getComputedStyle(document.documentElement)
          .getPropertyValue(varName)
          .trim();
        return value;
      };

      const primaryColor = getColor('--primary');

      if (previewSafeZone) {
        // Preview exists - update or create
        const circleGeoJSON = createGeoJSONCircle(previewSafeZone.center, previewSafeZone.radius);
        
        const source = map.current.getSource('preview-safe-zone') as maplibregl.GeoJSONSource;
        
        if (source) {
          // Source already exists, just update the data (smooth, no flicker)
          source.setData(circleGeoJSON as any);
        } else {
          // Source doesn't exist yet, create everything
          map.current.addSource('preview-safe-zone', {
            type: 'geojson',
            data: circleGeoJSON as any,
          });

          // Fill layer
          map.current.addLayer({
            id: 'preview-safe-zone-fill',
            type: 'fill',
            source: 'preview-safe-zone',
            paint: {
              'fill-color': primaryColor,
              'fill-opacity': 0.15,
            },
          });

          // Outline layer
          map.current.addLayer({
            id: 'preview-safe-zone-outline',
            type: 'line',
            source: 'preview-safe-zone',
            paint: {
              'line-color': primaryColor,
              'line-width': 3,
              'line-opacity': 0.9,
              'line-dasharray': [2, 2],
            },
          });
        }
      } else {
        // Preview is null - remove everything
        try {
          if (map.current.getLayer('preview-safe-zone-fill')) {
            map.current.removeLayer('preview-safe-zone-fill');
          }
        } catch (e) {
          // Layer might not exist
        }
        
        try {
          if (map.current.getLayer('preview-safe-zone-outline')) {
            map.current.removeLayer('preview-safe-zone-outline');
          }
        } catch (e) {
          // Layer might not exist
        }
        
        try {
          if (map.current.getSource('preview-safe-zone')) {
            map.current.removeSource('preview-safe-zone');
          }
        } catch (e) {
          // Source might not exist
        }
      }

      // Cleanup function - only remove when component unmounts or preview becomes null
      return () => {
        if (!previewSafeZone) {
          try {
            if (map.current?.getLayer('preview-safe-zone-fill')) {
              map.current.removeLayer('preview-safe-zone-fill');
            }
          } catch (e) {}
          
          try {
            if (map.current?.getLayer('preview-safe-zone-outline')) {
              map.current.removeLayer('preview-safe-zone-outline');
            }
          } catch (e) {}
          
          try {
            if (map.current?.getSource('preview-safe-zone')) {
              map.current.removeSource('preview-safe-zone');
            }
          } catch (e) {}
        }
      };
    }, [previewSafeZone]);

    useImperativeHandle(
      ref,
      () => ({
        recenter: () => {
          if (map.current && map.current.loaded()) {
            map.current.flyTo({
              center: [center[1], center[0]],
              zoom: zoom,
              duration: 1000,
              essential: true,
            });
          }
        },
        getCenter: () => {
          if (map.current && map.current.loaded()) {
            const mapCenter = map.current.getCenter();
            return [mapCenter.lat, mapCenter.lng];
          }
          return center;
        },
        flyTo: (newCenter: [number, number], newZoom?: number) => {
          console.log('🎯 flyTo called with:', 'lat:', newCenter[0], 'lng:', newCenter[1], 'zoom:', newZoom);
          console.log('📌 map.current exists?', !!map.current);
          
          if (map.current) {
            console.log('🚀 Executing flyTo animation...');
            map.current.flyTo({
              center: [newCenter[1], newCenter[0]], // [lng, lat]
              zoom: newZoom || 16,
              duration: 1500,
              essential: true,
            });
            console.log('✨ flyTo executed!');
          } else {
            console.log('❌ Cannot flyTo - map not ready');
          }
        },
      }),
      [center, zoom]
    );

    return <div ref={mapContainer} className={className} style={{ willChange: 'contents' }} />;
  }
);

Map.displayName = 'Map';