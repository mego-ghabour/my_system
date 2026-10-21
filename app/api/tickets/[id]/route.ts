import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const resolvedParams = await params;
    const body = await req.json();
    const { status } = body;

    const ticket = await prisma.ticket.update({
      where: { id: resolvedParams.id },
      data: { status },
    });

    return NextResponse.json(ticket);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
