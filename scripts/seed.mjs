// Seed MongoDB with existing JSON data
// Run: node scripts/seed.mjs
import { MongoClient } from "mongodb";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

// Load .env.local
config({ path: join(root, ".env.local") });

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is not set in .env.local");
  process.exit(1);
}

const client = new MongoClient(uri);

async function seed() {
  await client.connect();
  const db = client.db("ps-store");

  // Seed products
  const productsFile = join(root, "data", "products.json");
  if (existsSync(productsFile)) {
    const products = JSON.parse(readFileSync(productsFile, "utf-8"));
    const col = db.collection("products");
    const existing = await col.countDocuments();
    if (existing === 0) {
      await col.insertMany(products);
      console.log(`Seeded ${products.length} products`);
    } else {
      console.log(`Products already seeded (${existing} docs) — skipping`);
    }
  }

  // Seed orders
  const ordersFile = join(root, "data", "orders.json");
  if (existsSync(ordersFile)) {
    const orders = JSON.parse(readFileSync(ordersFile, "utf-8"));
    if (orders.length > 0) {
      const col = db.collection("orders");
      const existing = await col.countDocuments();
      if (existing === 0) {
        await col.insertMany(orders);
        console.log(`Seeded ${orders.length} orders`);
      } else {
        console.log(`Orders already seeded (${existing} docs) — skipping`);
      }
    }
  }

  // Create indexes for fast lookups
  await db.collection("products").createIndex({ id: 1 }, { unique: true });
  await db.collection("orders").createIndex({ id: 1 }, { unique: true });
  await db.collection("orders").createIndex({ "customer.email": 1 });
  await db.collection("orders").createIndex({ createdAt: -1 });
  console.log("Indexes created");

  await client.close();
  console.log("Done!");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
