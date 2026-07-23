import { randomBytes } from "crypto";
import { getDb } from "./db";

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

const PROJ = { projection: { _id: 0 } } as const;

export async function getOrders(): Promise<Order[]> {
  const db = await getDb();
  return db
    .collection<Order>("orders")
    .find({}, PROJ)
    .sort({ createdAt: -1 })
    .toArray();
}

export async function getOrderById(id: string): Promise<Order | null> {
  const db = await getDb();
  return db.collection<Order>("orders").findOne({ id }, PROJ) ?? null;
}

export async function getOrdersByEmail(email: string): Promise<Order[]> {
  const db = await getDb();
  return db
    .collection<Order>("orders")
    .find({ "customer.email": { $regex: new RegExp(`^${email}$`, "i") } }, PROJ)
    .sort({ createdAt: -1 })
    .toArray();
}

export async function createOrder(
  data: Omit<Order, "id" | "messages" | "createdAt" | "updatedAt">
): Promise<Order> {
  const db = await getDb();
  const order: Order = {
    ...data,
    id: "PS-" + randomBytes(4).toString("hex").toUpperCase(),
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await db.collection("orders").insertOne(order as any);
  return order;
}

export async function updateOrder(
  id: string,
  patch: Partial<Omit<Order, "id" | "createdAt">>
): Promise<Order | null> {
  const db = await getDb();
  const result = await db.collection<Order>("orders").findOneAndUpdate(
    { id },
    { $set: { ...patch, updatedAt: new Date().toISOString() } },
    { returnDocument: "after", ...PROJ }
  );
  return result ?? null;
}

export async function pushMessage(
  id: string,
  from: "admin" | "customer",
  text: string
): Promise<Order | null> {
  const db = await getDb();
  const msg: OrderMessage = { from, text, at: new Date().toISOString() };
  const result = await db.collection<Order>("orders").findOneAndUpdate(
    { id },
    {
      $push: { messages: msg },
      $set: { updatedAt: new Date().toISOString() },
    },
    { returnDocument: "after", ...PROJ }
  );
  return result ?? null;
}
