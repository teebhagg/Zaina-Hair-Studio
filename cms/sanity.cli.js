const { defineCliConfig } = require('sanity/cli')
const { config } = require('dotenv')
const { resolve } = require('path')

// Load environment variables from .env file
config({ path: resolve(process.cwd(), '.env') })

// Get project ID from environment variable
const projectId = process.env.SANITY_STUDIO_PROJECT_ID

if (!projectId) {
  throw new Error(
    'Missing SANITY_STUDIO_PROJECT_ID environment variable. ' +
    'Please create a .env file in the cms directory with: SANITY_STUDIO_PROJECT_ID=your-project-id'
  )
}

module.exports = defineCliConfig({
  api: {
    projectId: projectId,
    dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  },
  studioHost: 'zaina-hairstudio',
})

