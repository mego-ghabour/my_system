import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() || "";

    if (!q || q.length < 1) {
      // Return recent clients and services if no search query
      const [recentClients, recentServices] = await Promise.all([
        prisma.client.findMany({ take: 5, orderBy: { createdAt: "desc" }, select: { id: true, name: true, phone: true, companyName: true, status: true } }),
        prisma.service.findMany({ take: 4, orderBy: { createdAt: "desc" }, select: { id: true, name: true, basePrice: true } }),
      ]);
      return NextResponse.json({ clients: recentClients, quotations: [], services: recentServices, tickets: [] });
    }

    const [clients, services, tickets, quotations] = await Promise.all([
      prisma.client.findMany({
        where: {
          OR: [
            { name: { contains: q } },
            { phone: { contains: q } },
            { companyName: { contains: q } },
            { email: { contains: q } },
          ],
        },
        take: 6,
        select: { id: true, name: true, phone: true, companyName: true, status: true },
      }),
      prisma.service.findMany({
        where: {
          name: { contains: q },
        },
        take: 4,
        select: { id: true, name: true, basePrice: true },
      }),
      prisma.ticket.findMany({
        where: {
          OR: [
            { title: { contains: q } },
            { description: { contains: q } },
          ],
        },
        take: 4,
        select: { id: true, title: true, status: true, clientId: true },
      }),
      prisma.quotation.findMany({
        where: {
          client: {
            name: { contains: q },
          },
        },
        take: 4,
        include: { client: { select: { name: true } } },
      }),
    ]);

    return NextResponse.json({ clients, services, tickets, quotations });
  } catch (error) {
    console.error("[SEARCH_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
