import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections from growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  // We've ensured 'cached' is defined above, but TS needs a hint or a re-check
  const currentCache = cached!;

  if (currentCache.conn) {
    return currentCache.conn;
  }

  if (!currentCache.promise) {
    const opts = {
      bufferCommands: false,
    };

    currentCache.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      console.log("Connected to database");
      return mongooseInstance;
    });
  }

  try {
    currentCache.conn = await currentCache.promise;
  } catch (e) {
    currentCache.promise = null;
    console.error("Failed to connect to database:", e);
    throw e;
  }

  return currentCache.conn;
}

export default connectToDatabase;
