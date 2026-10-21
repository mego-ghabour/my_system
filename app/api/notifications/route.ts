import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const [openTickets, pendingTasks, sentQuotations, unpaidInvoices] = await Promise.all([
      prisma.ticket.findMany({
        where: { status: "OPEN" },
        include: { client: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.task.findMany({
        where: { completed: false },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.quotation.findMany({
        where: { status: "SENT" },
        include: { client: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.invoice.findMany({
        where: { status: { in: ["UNPAID", "PARTIAL"] } },
        include: { client: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    const notifications: any[] = [];

    openTickets.forEach((t) => {
      notifications.push({
        id: `ticket-${t.id}`,
        title: "تذكرة دعم مفتوحة",
        description: `تذكرة "${t.title}" من العميل ${t.client?.name || ""}`,
        href: "/tickets",
        type: "ticket",
        time: t.createdAt,
      });
    });

    pendingTasks.forEach((task) => {
      notifications.push({
        id: `task-${task.id}`,
        title: "مهمة غير مكتملة",
        description: task.title,
        href: "/tasks",
        type: "task",
        time: task.createdAt,
      });
    });

    sentQuotations.forEach((q) => {
      notifications.push({
        id: `quotation-${q.id}`,
        title: "عرض سعر بانتظار الرد",
        description: `عرض بقيمة ${q.total} ر.س للعميل ${q.client?.name || ""}`,
        href: "/quotations",
        type: "quotation",
        time: q.createdAt,
      });
    });

    unpaidInvoices.forEach((inv) => {
      const remaining = inv.total - (inv.paid || 0);
      notifications.push({
        id: `invoice-${inv.id}`,
        title: "فاتورة مستحقة الدفع",
        description: `متبقي ${remaining.toLocaleString()} ر.س للعميل ${inv.client?.name || ""}`,
        href: "/financials",
        type: "invoice",
        time: inv.createdAt,
      });
    });

    // Sort by time descending
    notifications.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    return NextResponse.json({
      count: notifications.length,
      notifications: notifications.slice(0, 15),
    });
  } catch (error) {
    console.error("[NOTIFICATIONS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
