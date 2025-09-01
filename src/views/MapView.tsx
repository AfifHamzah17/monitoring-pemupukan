'use client';
import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { initLeafletIcons } from '@/utils/leafletIcons';

initLeafletIcons();

type Props = {
  data: any[];
  filteredData: any[];
  isModalOpen?: boolean;
};

const MapView = forwardRef(function MapView(props: Props, ref) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});

  useImperativeHandle(ref, () => ({
    setView(coords: [number, number], zoom = 13) {
      if (mapRef.current) {
        mapRef.current.setView(coords, zoom);
      }
    },
  }));

  useEffect(() => {
    if (mapRef.current) return;

    const container = document.getElementById('inner-map');
    if (!container) return;

    const map = L.map(container, {
      center: [-6.9, 106.65],
      zoom: 10,
    });
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove previous markers
    Object.values(markersRef.current).forEach((m) => {
      try {
        map.removeLayer(m);
      } catch (e) {
        // ignore
      }
    });
    markersRef.current = {};

    const toShow = Array.isArray(props.filteredData) && props.filteredData.length > 0
      ? props.filteredData
      : Array.isArray(props.data) ? props.data : [];

    // Filter only valid coords (array of length 2 with finite numbers)
    const validItems = toShow.filter((k) => {
      if (!k || !k.coords) return false;
      if (!Array.isArray(k.coords) || k.coords.length !== 2) return false;
      const [lat, lng] = k.coords;
      return Number.isFinite(lat) && Number.isFinite(lng);
    });

    // Create markers for valid items
    validItems.forEach((k: any) => {
      const key = (k.coords as [number, number]).join(',');
      try {
        const marker = L.marker(k.coords).addTo(map).bindPopup(`<b>${k.nama_kebun ?? 'Kebun'}</b><br/>${k.distrik ?? ''}`);
        markersRef.current[key] = marker;
      } catch (e) {
        console.warn('Failed to add marker for kebun', k, e);
      }
    });

    // If there are no valid coordinates, warn and keep default view
    if (validItems.length === 0) {
      console.warn('MapView: no valid coordinates found in data — map will keep default view.');
      return;
    }

    // Fit bounds / set view depending on number of valid coordinates
    const latlngs = validItems.map((t: any) => (t.coords as [number, number]));
    if (latlngs.length === 1) {
      // single location -> zoom in to it
      try {
        map.setView(latlngs[0], 13);
      } catch (e) {
        console.warn('MapView: failed to setView for single coordinate', e);
      }
    } else {
      // multiple locations -> fit bounds, guarded with try/catch
      try {
        const bounds = L.latLngBounds(latlngs);
        map.fitBounds(bounds.pad(0.2));
      } catch (e) {
        console.warn('MapView: fitBounds failed', e);
      }
    }
  }, [props.data, props.filteredData]);

  // blur when modal open (optional)
  useEffect(() => {
    const mapContainer = document.getElementById('inner-map');
    if (!mapContainer) return;
    if (props.isModalOpen) mapContainer.classList.add('blur-lg');
    else mapContainer.classList.remove('blur-lg');
  }, [props.isModalOpen]);

  return <div id="inner-map" className="absolute inset-0" />;
});

export default MapView;