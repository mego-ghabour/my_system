import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });
    
    const resolvedParams = await params;
    const { isPinned } = await req.json();

    const client = await prisma.client.update({
      where: { id: resolvedParams.id },
      data: { isPinned }
    });

    return NextResponse.json(client);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
