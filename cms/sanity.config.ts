import { googleMapsInput } from "@sanity/google-maps-input";
import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./schemas";
import structure from "./structure";

// Sanity Studio requires environment variables to be prefixed with SANITY_STUDIO_
// Vite automatically loads .env files and makes SANITY_STUDIO_* vars available
const projectId = process.env.SANITY_STUDIO_PROJECT_ID || "";
const googleMapsApiKey = process.env.SANITY_STUDIO_GOOGLE_MAPS_API_KEY || "";

if (!projectId) {
  throw new Error(
    "Missing SANITY_STUDIO_PROJECT_ID environment variable. " +
      "Please create a .env file in the cms directory with: SANITY_STUDIO_PROJECT_ID=your-project-id"
  );
}

if (!googleMapsApiKey) {
  console.warn(
    "⚠️  Warning: SANITY_STUDIO_GOOGLE_MAPS_API_KEY is not set. " +
      "The Google Maps location picker will not work. " +
      "Please add it to your .env file in the cms directory."
  );
}

console.log("Env loaded successfully");

export default defineConfig({
  name: "default",
  title: "Salon CMS",
  projectId,
  dataset: process.env.SANITY_STUDIO_DATASET || "production",
  basePath: "/studio",
  plugins: [
    structureTool({
      structure,
    }),
    visionTool(),
    googleMapsInput({
      apiKey: googleMapsApiKey,
      defaultZoom: 15,
      defaultLocation: {
        lat: 40.7589,
        lng: -73.9851,
      },
    }),
  ],
  schema: {
    types: schemaTypes,
  },
  document: {
    actions: (prev, context) => {
      // Filter out the default "Delete" action to prevent accidental deletion
      // The "Discard changes" action is still available for removing drafts
      return prev.filter((action: any) => {
        // Remove the delete action
        return action.action !== "delete";
      });
    },
  },
});
