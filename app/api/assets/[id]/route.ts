import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const resolvedParams = await params;
    await prisma.asset.delete({
      where: { id: resolvedParams.id },
    });

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("[ASSET_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
