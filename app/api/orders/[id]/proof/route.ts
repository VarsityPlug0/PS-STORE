import { getOrderById, updateOrder, pushMessage } from "@/lib/orders";
import nodemailer from "nodemailer";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const order = getOrderById(id);

  if (!order) {
    return Response.json({ error: "Order not found" }, { status: 404 });
  }
  if (order.paymentStatus === "paid") {
    return Response.json({ error: "Order is already paid" }, { status: 400 });
  }
  if (order.paymentStatus === "submitted") {
    return Response.json({ error: "Payment proof already submitted" }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const note = typeof body.note === "string" ? body.note.trim().slice(0, 500) : "";

  updateOrder(id, { paymentStatus: "submitted", paymentMethod: "eft" });
  const updated = pushMessage(
    id,
    "customer",
    note
      ? `Payment submitted. Reference/note: ${note}`
      : "Customer confirmed EFT payment."
  );

  // Send email notification if SMTP is configured
  if (process.env.ADMIN_EMAIL && process.env.SMTP_HOST) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT ?? 587),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const adminUrl = `${process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000"}/admin/orders/${id}`;

      await transporter.sendMail({
        from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
        to: process.env.ADMIN_EMAIL,
        subject: `[PS Store] EFT Payment Submitted – ${id}`,
        text: [
          `EFT Payment Submitted`,
          ``,
          `Order:    ${id}`,
          `Customer: ${order.customer.name}`,
          `Email:    ${order.customer.email}`,
          `Phone:    ${order.customer.phone}`,
          `Amount:   R${order.total.toFixed(2)}`,
          note ? `Note:     ${note}` : "",
          ``,
          `Review order: ${adminUrl}`,
        ]
          .filter((l) => l !== undefined)
          .join("\n"),
        html: `
<h2 style="color:#16a34a">EFT Payment Submitted</h2>
<table cellpadding="6" cellspacing="0" style="border-collapse:collapse;font-family:sans-serif;font-size:14px">
  <tr><td style="color:#6b7280;width:100px"><strong>Order</strong></td><td><code>${id}</code></td></tr>
  <tr><td><strong>Customer</strong></td><td>${order.customer.name}</td></tr>
  <tr><td><strong>Email</strong></td><td>${order.customer.email}</td></tr>
  <tr><td><strong>Phone</strong></td><td>${order.customer.phone}</td></tr>
  <tr><td><strong>Amount</strong></td><td style="color:#16a34a;font-weight:bold">R${order.total.toFixed(2)}</td></tr>
  ${note ? `<tr><td><strong>Note</strong></td><td>${note}</td></tr>` : ""}
</table>
<br>
<a href="${adminUrl}" style="background:#2563eb;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:bold;font-family:sans-serif">
  View Order in Admin
</a>
        `.trim(),
      });
    } catch (err) {
      console.error("[PS Store] Failed to send EFT notification email:", err);
      // Don't fail the request if email fails
    }
  }

  return Response.json({ order: updated });
}
