import { getPool } from "./db";

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function row(r: any): Product {
  return {
    id: r.id,
    name: r.name,
    description: r.description,
    price: Number(r.price),
    image: r.image,
    category: r.category,
    stock: r.stock,
    specs: r.specs ?? [],
  };
}

export async function getProducts(): Promise<Product[]> {
  const { rows } = await getPool().query("SELECT * FROM products ORDER BY category, name");
  return rows.map(row);
}

export async function getProduct(id: string): Promise<Product | null> {
  const { rows } = await getPool().query("SELECT * FROM products WHERE id = $1", [id]);
  return rows[0] ? row(rows[0]) : null;
}

export async function createProduct(product: Omit<Product, "id">): Promise<Product> {
  const id =
    product.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") +
    "-" +
    Date.now().toString(36);

  await getPool().query(
    `INSERT INTO products (id, name, description, price, image, category, stock, specs)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [id, product.name, product.description, product.price, product.image, product.category, product.stock, JSON.stringify(product.specs)]
  );

  return { ...product, id };
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
  const sets: string[] = [];
  const vals: unknown[] = [];
  let n = 1;

  for (const [k, v] of Object.entries(updates)) {
    if (k === "id") continue;
    sets.push(`${k} = $${n++}`);
    vals.push(k === "specs" ? JSON.stringify(v) : v);
  }
  if (sets.length === 0) return getProduct(id);

  vals.push(id);
  const { rows } = await getPool().query(
    `UPDATE products SET ${sets.join(", ")} WHERE id = $${n} RETURNING *`,
    vals
  );
  return rows[0] ? row(rows[0]) : null;
}

export async function deleteProduct(id: string): Promise<boolean> {
  const { rowCount } = await getPool().query("DELETE FROM products WHERE id = $1", [id]);
  return (rowCount ?? 0) > 0;
}
