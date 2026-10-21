import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const resolvedParams = await params;
    const contracts = await prisma.contract.findMany({
      where: { clientId: resolvedParams.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(contracts);
  } catch (error) {
    console.error("[CONTRACTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return new NextResponse("Unauthorized", { status: 401 });

    const resolvedParams = await params;
    const body = await req.json();
    const { title, content, totalAmount } = body;

    if (!title || !content) {
      return new NextResponse("العنوان وبنود العقد مطلوبة", { status: 400 });
    }

    const contract = await prisma.contract.create({
      data: {
        clientId: resolvedParams.id,
        title,
        content,
        totalAmount: Number(totalAmount) || 0,
        status: "PENDING",
      },
    });

    return NextResponse.json(contract);
  } catch (error) {
    console.error("[CONTRACTS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
