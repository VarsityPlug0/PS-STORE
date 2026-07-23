import { stripe } from "@/lib/stripe";
import { updateOrder } from "@/lib/orders";

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export async function POST(req: Request) {
  try {
    const { items, orderId }: { items: CartItem[]; orderId?: string } = await req.json();

    if (!items || items.length === 0) {
      return Response.json({ error: "Cart is empty" }, { status: 400 });
    }

    const origin =
      req.headers.get("origin") ??
      process.env.NEXT_PUBLIC_URL ??
      "http://localhost:3000";

    const successUrl = orderId
      ? `${origin}/success?order_id=${orderId}`
      : `${origin}/success`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: items.map((item) => ({
        price_data: {
          currency: "zar",
          product_data: {
            name: item.name,
            images: [item.image],
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      success_url: successUrl,
      cancel_url: `${origin}/checkout`,
      metadata: orderId ? { orderId } : {},
    });

    // Attach Stripe session ID to the order
    if (orderId) {
      await updateOrder(orderId, { stripeSessionId: session.id });
    }

    return Response.json({ url: session.url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return Response.json({ error: message }, { status: 500 });
  }
}
