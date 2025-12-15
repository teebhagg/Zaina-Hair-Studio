/**
 * Reverse geocode coordinates to get formatted address
 * Uses Google Maps Geocoding API
 * 
 * Note: Requires GOOGLE_MAPS_API_KEY environment variable to be set
 */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<string | null> {
  try {
    // Try multiple possible environment variable names
    const apiKey = 
      process.env.GOOGLE_MAPS_API_KEY || 
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
      process.env.GOOGLE_API_KEY;
      
    if (!apiKey) {
      console.warn("Google Maps API key not configured. Set GOOGLE_MAPS_API_KEY in your .env file.");
      return null;
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
    );
    
    if (!response.ok) {
      console.error("Geocoding API error:", response.status, response.statusText);
      return null;
    }
    
    const data = await response.json();

    if (data.status === "OK" && data.results && data.results.length > 0) {
      // Return the formatted address from the first result
      return data.results[0].formatted_address;
    }

    if (data.status === "ZERO_RESULTS") {
      console.warn("No results found for coordinates:", lat, lng);
      return null;
    }

    console.error("Geocoding API error:", data.status, data.error_message);
    return null;
  } catch (error) {
    console.error("Error reverse geocoding:", error);
    return null;
  }
}

