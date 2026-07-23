import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import { getOrderById } from "@/lib/orders";
import AdminOrderDetailClient from "./AdminOrderDetailClient";
import { notFound } from "next/navigation";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const authed = await isAdminAuthenticated();
  if (!authed) redirect("/admin/login");

  const { id } = await params;
  const order = getOrderById(id);
  if (!order) notFound();

  return <AdminOrderDetailClient initialOrder={order} />;
}
