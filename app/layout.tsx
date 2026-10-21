import type { Metadata } from "next";
import { Inter, Cairo } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";

const cairo = Cairo({ subsets: ["arabic"] });

import { AppThemeManager } from "@/components/AppThemeManager";

export const metadata: Metadata = {
  title: "Freelance CRM",
  description: "نظام إدارة أعمال الفريلانس",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.className} text-[15px]`}>
        <Providers>
          <AppThemeManager />
          <TooltipProvider>{children}</TooltipProvider>
        </Providers>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
