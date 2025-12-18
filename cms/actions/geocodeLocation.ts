import { defineAction } from "sanity";
import { set } from "sanity";

export const geocodeLocationAction = defineAction({
  name: "geocodeLocation",
  title: "Geocode Location",
  icon: () => "📍",
  action: async (props) => {
    const { getClient, schemaType, documentId } = props;
    
    // Get the current document
    const client = getClient({ apiVersion: "2024-01-01" });
    const doc = await client.getDocument(documentId);
    
    if (!doc?.location?.lat || !doc?.location?.lng) {
      return {
        message: "No location coordinates found",
      };
    }

    // Reverse geocode
    const apiKey = process.env.SANITY_STUDIO_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return {
        message: "Google Maps API key not configured",
      };
    }

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${doc.location.lat},${doc.location.lng}&key=${apiKey}`
      );
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        const addressComponents = result.address_components;

        let streetNumber = "";
        let route = "";
        let city = "";
        let state = "";
        let zipCode = "";
        let country = "";

        addressComponents.forEach((component: any) => {
          const types = component.types;
          if (types.includes("street_number")) {
            streetNumber = component.long_name;
          } else if (types.includes("route")) {
            route = component.long_name;
          } else if (
            types.includes("locality") ||
            types.includes("postal_town")
          ) {
            city = component.long_name;
          } else if (types.includes("administrative_area_level_1")) {
            state = component.short_name;
          } else if (types.includes("postal_code")) {
            zipCode = component.long_name;
          } else if (types.includes("country")) {
            country = component.long_name;
          }
        });

        const address = [streetNumber, route].filter(Boolean).join(" ");

        // Update the document
        await client
          .patch(documentId)
          .set({
            address: address || doc.address,
            city: city || doc.city,
            state: state || doc.state,
            zipCode: zipCode || doc.zipCode,
            country: country || doc.country,
          })
          .commit();

        return {
          message: "Address fields updated successfully",
        };
      }
    } catch (error) {
      return {
        message: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }

    return {
      message: "No address found for this location",
    };
  },
});



