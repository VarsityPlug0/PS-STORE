import { isAdminAuthenticated } from "@/lib/auth";
import { createProduct } from "@/lib/products";

export async function POST(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const product = createProduct(body);
  return Response.json({ product }, { status: 201 });
}
