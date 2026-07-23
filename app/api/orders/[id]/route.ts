import { getOrderById, updateOrder } from "@/lib/orders";
import { isAdminAuthenticated } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  const authed = await isAdminAuthenticated();

  const order = getOrderById(id);
  if (!order) return Response.json({ error: "Not found" }, { status: 404 });

  // Allow access if admin or email matches
  if (!authed && order.customer.email.toLowerCase() !== email?.toLowerCase()) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return Response.json({ order });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const authed = await isAdminAuthenticated();
  if (!authed) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const patch = await req.json();
  const order = updateOrder(id, patch);
  if (!order) return Response.json({ error: "Not found" }, { status: 404 });

  return Response.json({ order });
}
