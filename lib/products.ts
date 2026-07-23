import { getDb } from "./db";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  specs: string[];
}

export async function getProducts(): Promise<Product[]> {
  const db = await getDb();
  return db.collection<Product>("products").find({}, { projection: { _id: 0 } }).toArray();
}

export async function getProduct(id: string): Promise<Product | null> {
  const db = await getDb();
  return db.collection<Product>("products").findOne({ id }, { projection: { _id: 0 } }) ?? null;
}

export async function createProduct(product: Omit<Product, "id">): Promise<Product> {
  const db = await getDb();
  const newProduct: Product = {
    ...product,
    id: product.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") +
      "-" + Date.now().toString(36),
  };
  await db.collection<Product>("products").insertOne(newProduct as Product & { _id?: unknown });
  return newProduct;
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  const db = await getDb();
  const result = await db
    .collection<Product>("products")
    .findOneAndUpdate(
      { id },
      { $set: updates },
      { returnDocument: "after", projection: { _id: 0 } }
    );
  return result ?? null;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const db = await getDb();
  const result = await db.collection<Product>("products").deleteOne({ id });
  return result.deletedCount > 0;
}
