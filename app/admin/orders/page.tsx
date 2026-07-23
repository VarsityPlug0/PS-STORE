import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { getOrders } from "@/lib/orders";
import AdminOrdersClient from "./AdminOrdersClient";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const authed = await isAdminAuthenticated();
  if (!authed) redirect("/admin/login");

  const orders = await getOrders();
  return <AdminOrdersClient initialOrders={orders} />;
}
