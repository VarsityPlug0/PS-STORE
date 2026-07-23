import { isAdminAuthenticated } from "@/lib/auth";
import { updateProduct, deleteProduct } from "@/lib/products";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const product = await updateProduct(id, body);

  if (!product) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  return Response.json({ product });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const ok = await deleteProduct(id);

  if (!ok) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  return Response.json({ ok: true });
}
