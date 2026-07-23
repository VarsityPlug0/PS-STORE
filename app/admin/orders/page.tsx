import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { getOrders } from "@/lib/orders";
import AdminOrdersClient from "./AdminOrdersClient";

export default async function AdminOrdersPage() {
  const authed = await isAdminAuthenticated();
  if (!authed) redirect("/admin/login");

  const orders = getOrders();
  return <AdminOrdersClient initialOrders={orders} />;
}
