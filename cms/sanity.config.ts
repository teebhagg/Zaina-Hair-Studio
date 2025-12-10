import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./schemas";
import structure from "./structure";

// Sanity Studio requires environment variables to be prefixed with SANITY_STUDIO_
// Vite automatically loads .env files and makes SANITY_STUDIO_* vars available
const projectId = process.env.SANITY_STUDIO_PROJECT_ID || "";

if (!projectId) {
  throw new Error(
    "Missing SANITY_STUDIO_PROJECT_ID environment variable. " +
      "Please create a .env file in the cms directory with: SANITY_STUDIO_PROJECT_ID=your-project-id"
  );
}

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
  ],
  schema: {
    types: schemaTypes,
  },
});
