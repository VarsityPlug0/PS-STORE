import { MongoClient, Db } from "mongodb";

// Cache connection across hot reloads in dev, reuse pool in prod
const g = global as typeof globalThis & { _mongo?: { client: MongoClient; db: Db } };

export async function getDb(): Promise<Db> {
  if (g._mongo) return g._mongo.db;

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI environment variable is not set");

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db("ps-store");
  g._mongo = { client, db };
  return db;
}
