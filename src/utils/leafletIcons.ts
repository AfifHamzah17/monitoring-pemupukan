// src/utils/leafletIcons.ts
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';


export function initLeafletIcons() {
// Merge opsi agar Leaflet menggunakan asset yang di-bundle oleh Next
L.Icon.Default.mergeOptions({
iconRetinaUrl: (markerIcon2x as unknown) as string,
iconUrl: (markerIcon as unknown) as string,
shadowUrl: (markerShadow as unknown) as string,
});
}