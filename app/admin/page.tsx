import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { getProducts } from "@/lib/products";
import AdminProductsClient from "./AdminProductsClient";

export default async function AdminPage() {
  const authed = await isAdminAuthenticated();
  if (!authed) redirect("/admin/login");

  const products = getProducts();
  return <AdminProductsClient initialProducts={products} />;
}
