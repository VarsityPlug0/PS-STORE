import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import CartSidebar from "@/components/CartSidebar";
import WhatsAppChat from "@/components/WhatsAppChat";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PS Store – Buy PlayStation Consoles & Accessories",
  description: "Shop the latest PlayStation 5 and PlayStation 4 consoles, controllers, and accessories.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.className} bg-gray-950 text-white min-h-screen`}>
        <Navbar />
        <CartSidebar />
        <main className="pt-16">{children}</main>
        <WhatsAppChat />
      </body>
    </html>
  );
}
