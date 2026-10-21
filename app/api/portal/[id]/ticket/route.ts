import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const body = await req.json();
    const { title, description } = body;

    if (!title || !description) {
      return new NextResponse("عنوان التذكرة والوصف مطلوبان", { status: 400 });
    }

    const ticket = await prisma.ticket.create({
      data: {
        clientId: resolvedParams.id,
        title,
        description,
        status: "OPEN",
      },
    });

    // Create client activity log
    await prisma.clientActivity.create({
      data: {
        clientId: resolvedParams.id,
        type: "TICKET_CREATED",
        description: `تم فتح تذكرة دعم جديدة عبر بوابة العميل: "${title}"`,
      },
    });

    return NextResponse.json(ticket);
  } catch (error) {
    console.error("[PORTAL_TICKET_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
