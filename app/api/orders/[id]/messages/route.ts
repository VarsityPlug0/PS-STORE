import { getOrderById, pushMessage } from "@/lib/orders";
import { isAdminAuthenticated } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { text, email } = await req.json();

  if (!text?.trim()) {
    return Response.json({ error: "Message cannot be empty" }, { status: 400 });
  }

  const authed = await isAdminAuthenticated();
  const order = await getOrderById(id);
  if (!order) return Response.json({ error: "Not found" }, { status: 404 });

  if (authed) {
    const updated = await pushMessage(id, "admin", text.trim());
    return Response.json({ order: updated });
  }

  // Customer: verify email
  if (!email || order.customer.email.toLowerCase() !== email.toLowerCase()) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const updated = await pushMessage(id, "customer", text.trim());
  return Response.json({ order: updated });
}
