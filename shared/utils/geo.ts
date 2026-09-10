/**
 * Formats coordinates for display
 */
export function formatCoordinates(lat: number | null, lng: number | null): string {
  if (lat === null || lng === null || isNaN(lat) || isNaN(lng)) {
    return 'Location unavailable';
  }
  return `${lat.toFixed(5)}°, ${lng.toFixed(5)}°`;
}

/**
 * Generates an OpenStreetMap or Google Maps search URL from coordinates
 */
export function getMapUrl(lat: number | null, lng: number | null): string | null {
  if (lat === null || lng === null || isNaN(lat) || isNaN(lng)) {
    return null;
  }
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

/**
 * Calculates Haversine distance in kilometers between two lat/lng pairs
 */
export function calculateDistanceKm(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
}
