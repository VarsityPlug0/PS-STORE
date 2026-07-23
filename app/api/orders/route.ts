import { createOrder, getOrders, getOrdersByEmail } from "@/lib/orders";
import { isAdminAuthenticated } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customer, items, total, paymentMethod } = body;

    if (!customer || !items?.length || !total || !paymentMethod) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const order = createOrder({
      customer,
      items,
      total,
      paymentMethod,
      status: "pending",
      paymentStatus: "pending",
    });

    return Response.json({ order }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (email) {
    const orders = getOrdersByEmail(email);
    return Response.json({ orders });
  }

  const authed = await isAdminAuthenticated();
  if (!authed) return Response.json({ error: "Unauthorized" }, { status: 401 });

  return Response.json({ orders: getOrders() });
}
