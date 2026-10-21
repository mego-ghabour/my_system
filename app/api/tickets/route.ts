import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const tickets = await prisma.ticket.findMany({
      include: { client: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(tickets);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, clientId, title, description } = body;

    if (!title || !description) {
      return new NextResponse("عنوان التذكرة ووصفها مطلوبان", { status: 400 });
    }

    let finalClientId = clientId;

    // If request comes from external (WhatsApp) via phone
    if (phone && !clientId) {
      const client = await prisma.client.findUnique({ where: { phone } });
      if (!client) return new NextResponse("العميل غير موجود", { status: 404 });
      finalClientId = client.id;
    }

    if (!finalClientId) {
      return new NextResponse("يجب تحديد العميل", { status: 400 });
    }

    const ticket = await prisma.ticket.create({
      data: {
        clientId: finalClientId,
        title,
        description,
        status: "OPEN",
      },
    });

    return NextResponse.json(ticket);
  } catch (error) {
    console.error("[TICKETS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
