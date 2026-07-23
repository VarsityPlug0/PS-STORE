import { randomBytes } from "crypto";
import { getPool } from "./db";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentMethod = "card" | "eft";
export type PaymentStatus = "pending" | "submitted" | "paid" | "failed";

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface OrderMessage {
  from: "admin" | "customer";
  text: string;
  at: string;
}

export interface Customer {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
}

export interface Order {
  id: string;
  customer: Customer;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  trackingNumber?: string;
  trackingCarrier?: string;
  stripeSessionId?: string;
  adminNotes?: string;
  messages: OrderMessage[];
  createdAt: string;
  updatedAt: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function row(r: any): Order {
  return {
    id: r.id,
    customer: r.customer,
    items: r.items,
    total: Number(r.total),
    status: r.status,
    paymentMethod: r.payment_method,
    paymentStatus: r.payment_status,
    trackingNumber: r.tracking_number ?? undefined,
    trackingCarrier: r.tracking_carrier ?? undefined,
    stripeSessionId: r.stripe_session_id ?? undefined,
    adminNotes: r.admin_notes ?? undefined,
    messages: r.messages ?? [],
    createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : r.created_at,
    updatedAt: r.updated_at instanceof Date ? r.updated_at.toISOString() : r.updated_at,
  };
}

export async function getOrders(): Promise<Order[]> {
  const { rows } = await getPool().query("SELECT * FROM orders ORDER BY created_at DESC");
  return rows.map(row);
}

export async function getOrderById(id: string): Promise<Order | null> {
  const { rows } = await getPool().query("SELECT * FROM orders WHERE id = $1", [id]);
  return rows[0] ? row(rows[0]) : null;
}

export async function getOrdersByEmail(email: string): Promise<Order[]> {
  const { rows } = await getPool().query(
    "SELECT * FROM orders WHERE lower(customer->>'email') = lower($1) ORDER BY created_at DESC",
    [email]
  );
  return rows.map(row);
}

export async function createOrder(
  data: Omit<Order, "id" | "messages" | "createdAt" | "updatedAt">
): Promise<Order> {
  const id = "PS-" + randomBytes(4).toString("hex").toUpperCase();
  const now = new Date().toISOString();

  await getPool().query(
    `INSERT INTO orders
      (id, customer, items, total, status, payment_method, payment_status,
       tracking_number, tracking_carrier, stripe_session_id, admin_notes, messages, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$13)`,
    [
      id,
      JSON.stringify(data.customer),
      JSON.stringify(data.items),
      data.total,
      data.status,
      data.paymentMethod,
      data.paymentStatus,
      data.trackingNumber ?? null,
      data.trackingCarrier ?? null,
      data.stripeSessionId ?? null,
      data.adminNotes ?? null,
      JSON.stringify([]),
      now,
    ]
  );

  return {
    ...data,
    id,
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
}

export async function updateOrder(
  id: string,
  patch: Partial<Omit<Order, "id" | "createdAt">>
): Promise<Order | null> {
  const map: Record<string, string> = {
    paymentMethod: "payment_method",
    paymentStatus: "payment_status",
    trackingNumber: "tracking_number",
    trackingCarrier: "tracking_carrier",
    stripeSessionId: "stripe_session_id",
    adminNotes: "admin_notes",
  };

  const sets: string[] = [];
  const vals: unknown[] = [];
  let n = 1;

  for (const [k, v] of Object.entries(patch)) {
    if (k === "id" || k === "createdAt") continue;
    const col = map[k] ?? k;
    sets.push(`${col} = $${n++}`);
    vals.push(
      typeof v === "object" && v !== null && !Array.isArray(v)
        ? JSON.stringify(v)
        : v
    );
  }

  sets.push(`updated_at = $${n++}`);
  vals.push(new Date().toISOString());
  vals.push(id);

  const { rows } = await getPool().query(
    `UPDATE orders SET ${sets.join(", ")} WHERE id = $${n} RETURNING *`,
    vals
  );
  return rows[0] ? row(rows[0]) : null;
}

export async function pushMessage(
  id: string,
  from: "admin" | "customer",
  text: string
): Promise<Order | null> {
  const msg: OrderMessage = { from, text, at: new Date().toISOString() };

  const { rows } = await getPool().query(
    `UPDATE orders
     SET messages = messages || $1::jsonb,
         updated_at = $2
     WHERE id = $3
     RETURNING *`,
    [JSON.stringify([msg]), new Date().toISOString(), id]
  );
  return rows[0] ? row(rows[0]) : null;
}
