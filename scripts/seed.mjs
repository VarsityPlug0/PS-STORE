// Seed PostgreSQL with existing JSON data
// Run AFTER migrate.mjs: node scripts/seed.mjs
import pg from "pg";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

const { Pool } = pg;
const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
config({ path: join(root, ".env.local") });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

// Seed products
const productsFile = join(root, "data", "products.json");
if (existsSync(productsFile)) {
  const products = JSON.parse(readFileSync(productsFile, "utf-8"));
  const { rows } = await pool.query("SELECT count(*) FROM products");
  if (Number(rows[0].count) === 0) {
    for (const p of products) {
      await pool.query(
        `INSERT INTO products (id, name, description, price, image, category, stock, specs)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         ON CONFLICT (id) DO NOTHING`,
        [p.id, p.name, p.description, p.price, p.image, p.category, p.stock, JSON.stringify(p.specs ?? [])]
      );
    }
    console.log(`Seeded ${products.length} products`);
  } else {
    console.log(`Products already seeded — skipping`);
  }
}

// Seed orders
const ordersFile = join(root, "data", "orders.json");
if (existsSync(ordersFile)) {
  const orders = JSON.parse(readFileSync(ordersFile, "utf-8"));
  if (orders.length > 0) {
    const { rows } = await pool.query("SELECT count(*) FROM orders");
    if (Number(rows[0].count) === 0) {
      for (const o of orders) {
        await pool.query(
          `INSERT INTO orders
            (id, customer, items, total, status, payment_method, payment_status,
             tracking_number, tracking_carrier, stripe_session_id, admin_notes, messages, created_at, updated_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
           ON CONFLICT (id) DO NOTHING`,
          [
            o.id,
            JSON.stringify(o.customer),
            JSON.stringify(o.items),
            o.total,
            o.status,
            o.paymentMethod,
            o.paymentStatus,
            o.trackingNumber ?? null,
            o.trackingCarrier ?? null,
            o.stripeSessionId ?? null,
            o.adminNotes ?? null,
            JSON.stringify(o.messages ?? []),
            o.createdAt,
            o.updatedAt,
          ]
        );
      }
      console.log(`Seeded ${orders.length} orders`);
    } else {
      console.log(`Orders already seeded — skipping`);
    }
  }
}

console.log("Done!");
await pool.end();
