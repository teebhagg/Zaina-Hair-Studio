import mongoose from 'mongoose'

// Get MONGODB_URI at runtime with database name
function getMongoUri() {
  let uri = process.env.MONGODB_URI || '';
  
  // If MONGODB_DATABASE is specified, ensure it's in the URI
  const databaseName = process.env.MONGODB_DATABASE || 'zainab-adeshola-salon';
  
  if (!databaseName || !uri) {
    return uri;
  }
  
  // Check if database name is already in the URI
  // MongoDB URI format: mongodb+srv://user:pass@host/database?options
  // Extract the part after @ to check for database name
  const afterAt = uri.split('@')[1];
  if (afterAt) {
    // Check if there's a database name (something between / and ? or end of string)
    // Pattern: /database? or /database (end of string), but not just /? or / (end)
    const pathMatch = afterAt.match(/^\/([^/?]+)(\?|$)/);
    if (pathMatch && pathMatch[1] && pathMatch[1] !== '') {
      // Database name already exists in URI
      return uri;
    }
  }
  
  // Add database name before query parameters
  const queryIndex = uri.indexOf('?');
  if (queryIndex === -1) {
    // No query parameters, just append database name
    uri = uri.endsWith('/') ? `${uri}${databaseName}` : `${uri}/${databaseName}`;
  } else {
    // Insert database name before query parameters
    const beforeQuery = uri.substring(0, queryIndex);
    const afterQuery = uri.substring(queryIndex);
    // Remove trailing slash if present, then add database name
    const baseUri = beforeQuery.endsWith('/') ? beforeQuery.slice(0, -1) : beforeQuery;
    uri = `${baseUri}/${databaseName}${afterQuery}`;
  }
  
  return uri;
}

const MONGODB_URI = getMongoUri();

if (!MONGODB_URI && process.env.NODE_ENV !== 'production') {
  console.warn('Warning: MONGODB_URI is not set. Database features will not work.')
}

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  var mongoose: MongooseCache | undefined
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null }

if (!global.mongoose) {
  global.mongoose = cached
}

async function connectDB() {
  const uri = getMongoUri();
  
  if (!uri) {
    throw new Error('MONGODB_URI is not defined. Please set it in your environment variables.')
  }

  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    cached.promise = mongoose.connect(uri, opts).then((mongoose) => {
      console.log(`Connected to MongoDB database: ${mongoose.connection.db?.databaseName || 'unknown'}`);
      return mongoose
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

export default connectDB
