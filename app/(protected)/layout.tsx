import { Sidebar } from "@/components/Sidebar";
import { CommandMenu } from "@/components/CommandMenu";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { NotificationCenter } from "@/components/NotificationCenter";
import { UserCircle } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/db";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const user = session?.user?.email ? await prisma.user.findUnique({ where: { email: session.user.email } }) : null;

  return (
    <div className="min-h-screen bg-gray-50/50 text-gray-900 font-sans" style={{ paddingRight: "240px" }}>
      <Sidebar />
      
      <div className="flex flex-col min-h-screen w-full relative">
        {/* Top Header */}
        <header className="h-16 bg-white/70 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-40 transition-all duration-300">
          <div className="flex items-center gap-4">
            <CommandMenu />
            <div className="h-5 w-px bg-gray-200"></div>
            <Breadcrumbs />
          </div>
          <div className="flex items-center gap-4">
            <NotificationCenter />
            <div className="flex items-center gap-3 pl-2 border-l border-gray-100">
              <div className="flex flex-col items-end">
                <span className="text-sm font-bold text-gray-700">{user?.name || "مدير النظام"}</span>
                <span className="text-xs text-gray-400">المدير العام</span>
              </div>
              <div className="w-9 h-9 bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 rounded-xl flex items-center justify-center overflow-hidden border border-blue-200 shadow-sm">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <UserCircle size={20} />
                )}
              </div>
            </div>
          </div>
        </header>
        {/* Page Content */}
        <main className="flex-1 overflow-auto pb-8">
          {children}
        </main>
      </div>
    </div>
  );
}
