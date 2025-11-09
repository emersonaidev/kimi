import maplibregl from 'maplibre-gl';
import type { GPSLocation, SafeZone } from '@/types/app.types';

export const PORTUGAL_CENTER: [number, number] = [-9.1393, 38.7223];

export function initializeMap(container: HTMLDivElement): maplibregl.Map {
  const map = new maplibregl.Map({
    container,
    style: {
      version: 8,
      sources: {
        osm: {
          type: 'raster',
          tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution: '© OpenStreetMap contributors',
        },
      },
      layers: [
        {
          id: 'osm',
          type: 'raster',
          source: 'osm',
          minzoom: 0,
          maxzoom: 19,
        },
      ],
    },
    center: PORTUGAL_CENTER,
    zoom: 12,
  });

  map.addControl(new maplibregl.NavigationControl(), 'top-right');
  map.addControl(new maplibregl.FullscreenControl(), 'top-right');

  return map;
}

export function addCurrentLocationMarker(
  map: maplibregl.Map,
  location: GPSLocation
): maplibregl.Marker {
  const el = document.createElement('div');
  el.style.width = '32px';
  el.style.height = '32px';
  el.style.borderRadius = '50%';
  el.style.backgroundColor = 'var(--primary)';
  el.style.border = '3px solid white';
  el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
  el.style.cursor = 'pointer';

  const marker = new maplibregl.Marker({ element: el })
    .setLngLat([location.longitude, location.latitude])
    .setPopup(
      new maplibregl.Popup({ offset: 25 }).setHTML(
        '<div style="padding: 8px;">' +
          '<p style="font-weight: 600; margin: 0 0 4px 0;">Localização Atual</p>' +
          '<p style="margin: 0; font-size: 13px; color: #666;">Bateria: ' +
          (location.battery_level ?? 'N/A') +
          '%</p>' +
          '<p style="margin: 0; font-size: 13px; color: #666;">' +
          new Date(location.recorded_at).toLocaleString('pt-PT') +
          '</p>' +
          '</div>'
      )
    )
    .addTo(map);

  return marker;
}

export function updateMarkerPosition(
  marker: maplibregl.Marker,
  location: GPSLocation
) {
  marker.setLngLat([location.longitude, location.latitude]);
}

export function drawTrailLine(
  map: maplibregl.Map,
  locations: GPSLocation[]
): void {
  if (locations.length === 0) return;

  const coordinates = locations.map((loc) => [loc.longitude, loc.latitude]);

  const geojson: GeoJSON.Feature<GeoJSON.LineString> = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates,
    },
  };

  if (map.getSource('trail')) {
    (map.getSource('trail') as maplibregl.GeoJSONSource).setData(geojson);
  } else {
    map.addSource('trail', {
      type: 'geojson',
      data: geojson,
    });

    map.addLayer({
      id: 'trail-line',
      type: 'line',
      source: 'trail',
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': 'var(--primary)',
        'line-width': 3,
        'line-opacity': 0.7,
      },
    });
  }
}

export function drawSafeZones(map: maplibregl.Map, safeZones: SafeZone[]): void {
  const features: GeoJSON.Feature<GeoJSON.Point>[] = safeZones.map((zone) => ({
    type: 'Feature',
    properties: {
      name: zone.name,
      radius: zone.radius,
      isActive: zone.is_active,
    },
    geometry: {
      type: 'Point',
      coordinates: [zone.longitude, zone.latitude],
    },
  }));

  const geojson: GeoJSON.FeatureCollection<GeoJSON.Point> = {
    type: 'FeatureCollection',
    features,
  };

  if (map.getSource('safe-zones')) {
    (map.getSource('safe-zones') as maplibregl.GeoJSONSource).setData(geojson);
  } else {
    map.addSource('safe-zones', {
      type: 'geojson',
      data: geojson,
    });

    map.addLayer({
      id: 'safe-zones-circles',
      type: 'circle',
      source: 'safe-zones',
      paint: {
        'circle-radius': {
          type: 'identity',
          property: 'radius',
        },
        'circle-color': [
          'case',
          ['get', 'isActive'],
          'rgba(0, 136, 255, 0.2)',
          'rgba(120, 120, 128, 0.16)',
        ],
        'circle-stroke-width': 2,
        'circle-stroke-color': [
          'case',
          ['get', 'isActive'],
          'var(--primary)',
          'var(--muted-foreground)',
        ],
      },
    });
  }

  safeZones.forEach((zone) => {
    new maplibregl.Popup({ closeButton: false, closeOnClick: false })
      .setLngLat([zone.longitude, zone.latitude])
      .setHTML(
        '<div style="padding: 4px 8px; font-size: 12px; font-weight: 600;">' +
          zone.name +
          '</div>'
      )
      .addTo(map);
  });
}

export function fitMapToLocations(
  map: maplibregl.Map,
  locations: GPSLocation[]
): void {
  if (locations.length === 0) return;

  const bounds = new maplibregl.LngLatBounds();
  locations.forEach((loc) => {
    bounds.extend([loc.longitude, loc.latitude]);
  });

  map.fitBounds(bounds, {
    padding: 50,
    maxZoom: 15,
  });
}
